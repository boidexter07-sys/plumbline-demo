// src/pulse/compute.ts — The 12-step Pulse compute pipeline.
//
// Source-of-truth: phase-2-data-pipeline-spec.md §4.4 (compute order).
//
//  1. FETCH (parallel — handled by the caller, not here)
//  2. VALIDATE — mark missing/stale
//  3. NORMALIZE — z against native-freq baseline, intensity = tanh(|z|/2)
//  4. MASK — asset-class applicability
//  5. CLUSTER-CAP — cap each correlated cluster
//  6. DROP-AND-RENORMALIZE — within each category
//  7. COMPOSITE — per-holding weighted sum
//  8. BAND ASSIGNMENT — percentile-locked cutpoints + hysteresis
//  9. PORTFOLIO AGGREGATE — weighted by holding weight
// 10. N_EFF — effective number of independent signals
// 11. DRIFT MONITOR — factor distribution + correlation shift
// 12. WRITE — caller persists to KV

import type {
  AssetClass,
  BandCutpoints,
  BandLabel,
  ClusterId,
  DataJson,
  FactorId,
  FactorObservation,
  FactorScore,
  HoldingPulse,
  PortfolioPulse,
  Position,
} from "./types";
import {
  CATEGORIES,
  CLUSTERS,
  DEFAULT_APPLICABILITY,
  DEFAULT_BAND_CUTPOINTS,
} from "./types";
import { ALL_FACTOR_IDS, FACTORS, isLevelAnchored } from "./factor-registry";
import {
  applyClusterCap,
  applyHysteresis,
  bandFromComposite,
  bandFromPercentile,
  categoryCoverage,
  dropAndRenormalize,
  effectiveNumberOfSignals,
  intensity,
  percentileRank,
  zScore,
} from "./math";

/**
 * Compute the 29-factor Pulse for a single holding.
 *
 * @param position        the holding (symbol, weight, asset_class, ...)
 * @param observations    per-factor raw values for this holding
 * @param baselines       per-factor mu/sigma/history
 * @param cutpoints       locked percentile cutpoints
 * @param previousBand    the band's previous band (for hysteresis) — null on first run
 * @param previousComposite  the holding's previous composite (for hysteresis margin)
 * @param env             Worker env (for cluster_cap_ratio, hysteresis_margin, coverage_floor)
 */
export function computeHoldingPulse(
  position: Position,
  observations: Partial<Record<FactorId, FactorObservation>>,
  baselines: Partial<Record<FactorId, { mu: number; sigma: number; history: number[] }>>,
  cutpoints: BandCutpoints,
  previousBand: BandLabel | null = null,
  previousComposite: number | null = null,
  options: {
    clusterCapRatio?: number;
    hysteresisMargin?: number;
    coverageFloor?: number;
  } = {},
): { holding: HoldingPulse; composite: number } {
  const applicability = DEFAULT_APPLICABILITY[position.asset_class];
  const clusterCapRatio = options.clusterCapRatio ?? 1.5;
  const hysteresisMargin = options.hysteresisMargin ?? 0.02;
  const coverageFloor = options.coverageFloor ?? 0.60;

  // === Step 2: VALIDATE (mark missing/stale) ===
  // A factor is missing if observation is undefined/null. A factor is stale if
  // freshness_seconds exceeds the threshold for its native frequency.
  const isLive: Record<FactorId, boolean> = {} as Record<FactorId, boolean>;
  const isStale: Record<FactorId, boolean> = {} as Record<FactorId, boolean>;
  const isMissing: Record<FactorId, boolean> = {} as Record<FactorId, boolean>;
  for (const fid of ALL_FACTOR_IDS) {
    const obs = observations[fid];
    if (!obs || obs.raw_value === null || obs.raw_value === undefined || !Number.isFinite(obs.raw_value)) {
      isMissing[fid] = true;
      isLive[fid] = false;
      isStale[fid] = false;
    } else {
      isMissing[fid] = false;
      isStale[fid] = isStaleByCadence(fid, obs.freshness_seconds);
      isLive[fid] = !isStale[fid];
    }
  }

  // === Step 3: NORMALIZE (z + intensity) ===
  const factorScores: Record<FactorId, FactorScore> = {} as Record<FactorId, FactorScore>;
  for (const fid of ALL_FACTOR_IDS) {
    const obs = observations[fid];
    const baseline = baselines[fid];
    const meta = FACTORS[fid];

    let z = NaN;
    let intensityVal = 0;

    if (!isMissing[fid] && baseline) {
      // For annual-rank factors (F17), use percentile rank of the raw value
      if (meta.reference === "annual_rank" && baseline.history && baseline.history.length > 0) {
        const pct = percentileRank(obs!.raw_value, baseline.history);
        // Map percentile [0,1] to z-equivalent such that pct=0.5 → z=0
        // Use inverse-normal-style: z = norminv(pct) — approximated via Box-Muller-derived lookup
        z = inverseNormalApprox(pct);
        intensityVal = intensity(z);
      } else if (baseline.sigma !== 0) {
        z = zScore(obs!.raw_value, baseline.mu, baseline.sigma);
        intensityVal = intensity(z);
      } else {
        z = 0;
        intensityVal = 0;
      }
    }

    factorScores[fid] = {
      factor: fid,
      raw_value: obs?.raw_value ?? NaN,
      observation_date: obs?.observation_date ?? "",
      z_score: isMissing[fid] ? NaN : z,
      intensity: intensityVal,
      weight_base: meta.weight,
      weight_effective: 0,       // filled in step 4-6
      category: meta.category,
      missing: isMissing[fid],
      stale: isStale[fid],
      applicability: applicability[fid],
      cluster: clusterOf(fid),
    };
  }

  // === Step 4: MASK (asset-class applicability) ===
  for (const fid of ALL_FACTOR_IDS) {
    const fs = factorScores[fid];
    const appFactor = applicability[fid];
    if (appFactor === 0) {
      fs.weight_effective = 0;             // fully masked
    } else if (appFactor < 1) {
      fs.weight_effective = fs.weight_base * appFactor;   // partial
      fs.applicability = appFactor;
    } else {
      fs.weight_effective = fs.weight_base;
    }
  }

  // === Step 6: DROP-AND-RENORMALIZE within each category (§3.4) ===
  // First compute the isLive map (live means: not missing, not stale, applicability > 0)
  const isLiveEffective: Record<FactorId, boolean> = {} as Record<FactorId, boolean>;
  for (const fid of ALL_FACTOR_IDS) {
    const fs = factorScores[fid];
    isLiveEffective[fid] = !fs.missing && !fs.stale && fs.applicability > 0;
  }

  // Apply drop-and-renormalize per category — get a renormalized weight object
  let weights: Record<FactorId, number> = {} as Record<FactorId, number>;
  for (const fid of ALL_FACTOR_IDS) {
    weights[fid] = factorScores[fid].weight_effective;
  }
  for (const category of Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>) {
    weights = dropAndRenormalize(weights, isLiveEffective, category);
  }

  // === Step 5: CLUSTER-CAP (§2.2) ===
  weights = applyClusterCap(weights, clusterCapRatio);

  // Push final weights back into factorScores
  for (const fid of ALL_FACTOR_IDS) {
    factorScores[fid].weight_effective = weights[fid] ?? 0;
  }

  // === Step 7: COMPOSITE (per holding) ===
  let composite = 0;
  let compositeEffective = 0;       // sum of weights actually used
  for (const fid of ALL_FACTOR_IDS) {
    const fs = factorScores[fid];
    if (!fs.missing && !fs.stale && fs.weight_effective > 0) {
      composite += fs.weight_effective * fs.intensity;
      compositeEffective += fs.weight_effective;
    }
  }
  // Renormalize composite to [0,1] in case category drops changed effective total weight
  if (compositeEffective > 0) {
    composite = composite / compositeEffective;
  }
  // Clamp to [0, 1] (should always be in range, defensive)
  composite = Math.max(0, Math.min(1, composite));

  // === Step 8: BAND ASSIGNMENT (with hysteresis) ===
  const proposed = bandFromComposite(composite, cutpoints);
  const finalBand = applyHysteresis(
    proposed,
    previousBand,
    composite,
    previousComposite,
    cutpoints,
    hysteresisMargin,
  );

  // === Step 4.2: Coverage & low_confidence ===
  let coverage = 0;
  let lowConfidence = false;
  const categoryCoverages: Record<string, { coverage: number; low_confidence: boolean }> = {};
  for (const category of Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>) {
    const weightsForCov: Record<FactorId, { weight: number; missing: boolean; stale: boolean }> = {} as Record<FactorId, { weight: number; missing: boolean; stale: boolean }>;
    for (const fid of CATEGORIES[category]) {
      weightsForCov[fid] = {
        weight: FACTORS[fid].weight,
        missing: factorScores[fid].missing,
        stale: factorScores[fid].stale,
      };
    }
    const cc = categoryCoverage(category, weightsForCov, coverageFloor);
    categoryCoverages[category] = cc;
    if (cc.low_confidence) lowConfidence = true;
  }
  // Coverage = weighted-aggregate of category coverages (using category base weights)
  const categoryWeights: Record<string, number> = { price: 0.19, macro: 0.61, news: 0.19, sentiment: 0.01 };
  let covWeighted = 0;
  let covTotal = 0;
  for (const [cat, w] of Object.entries(categoryWeights)) {
    covWeighted += w * (categoryCoverages[cat]?.coverage ?? 0);
    covTotal += w;
  }
  coverage = covTotal > 0 ? covWeighted / covTotal : 0;

  const holding: HoldingPulse = {
    symbol: position.symbol,
    asset_class: position.asset_class,
    sector: position.sector,
    weight: position.weight,
    pulse: composite,
    band: finalBand,
    coverage,
    low_confidence: lowConfidence,
    factors: factorScores,
  };
  return { holding, composite };
}

/**
 * Compute the portfolio-level Pulse from a set of holding Pulses.
 *
 * Step 9 of §4.4.
 */
export function aggregatePortfolio(
  holdingPulses: Array<{ holding: HoldingPulse; composite: number }>,
  computedAt: string,
  computeDurationMs: number,
  baselines: Partial<Record<FactorId, { mu: number; sigma: number; history: number[] }>>,
): PortfolioPulse {
  // Step 9: portfolio_composite = Σ weight_h * composite_h
  let totalWeight = 0;
  let portfolioComposite = 0;
  let portfolioCoverage = 0;
  let lowConfidence = false;
  const degraded: FactorId[] = [];

  for (const { holding } of holdingPulses) {
    totalWeight += holding.weight;
    portfolioComposite += holding.weight * holding.pulse;
    portfolioCoverage += holding.weight * holding.coverage;
    if (holding.low_confidence) lowConfidence = true;
    for (const fid of ALL_FACTOR_IDS) {
      if (holding.factors[fid].missing || holding.factors[fid].stale) {
        if (!degraded.includes(fid)) degraded.push(fid);
      }
    }
  }

  if (totalWeight > 0) {
    portfolioComposite = portfolioComposite / totalWeight;
    portfolioCoverage = portfolioCoverage / totalWeight;
  }

  // Compute band from the portfolio's percentile rank across holding pulses
  const allPulses = holdingPulses.map((hp) => hp.composite).sort((a, b) => a - b);
  const portfolioPercentile = percentileRank(portfolioComposite, allPulses);
  const portfolioBand = bandFromPercentile(portfolioPercentile, DEFAULT_BAND_CUTPOINTS);

  // Step 10: N_eff
  // Build the weight vector for the union of live factors across holdings
  const liveWeights: Record<FactorId, number> = {} as Record<FactorId, number>;
  for (const fid of ALL_FACTOR_IDS) {
    let w = 0;
    for (const { holding } of holdingPulses) {
      w += holding.weight * (holding.factors[fid].weight_effective ?? 0);
    }
    liveWeights[fid] = w;
  }
  // Use a simple diagonal correlation (independent) when no correlation map is provided
  const correlation: Record<FactorId, Record<FactorId, number>> = {} as Record<FactorId, Record<FactorId, number>>;
  for (const i of ALL_FACTOR_IDS) {
    correlation[i] = {} as Record<FactorId, number>;
    for (const j of ALL_FACTOR_IDS) {
      correlation[i]![j] = i === j ? 1 : ASSUMED_CORRELATIONS[i]?.[j] ?? 0;
    }
  }
  const nEff = effectiveNumberOfSignals(liveWeights, ALL_FACTOR_IDS, correlation);

  return {
    composite: portfolioComposite,
    band: portfolioBand,
    band_percentile: portfolioPercentile,
    effective_n_signals: nEff,
    coverage: portfolioCoverage,
    low_confidence: lowConfidence || portfolioCoverage < 0.80,
    computed_at: computedAt,
    compute_duration_ms: computeDurationMs,
    degraded_factors: degraded,
    holdings: holdingPulses.map((hp) => hp.holding),
  };
}

// === Helpers ===

/** Is a factor stale given its native-freq cadence? */
function isStaleByCadence(factor: FactorId, freshnessSeconds: number): boolean {
  const ref = FACTORS[factor].reference;
  const seconds = {
    daily_price_252d: 24 * 3600 * 2,             // 48h
    daily_macro_10y:  24 * 3600 * 7,             // 7d
    monthly_10y:      35 * 24 * 3600,
    quarterly_10y:    100 * 24 * 3600,
    annual_rank:      400 * 24 * 3600,
  };
  return freshnessSeconds > (seconds[ref] ?? Infinity);
}

function clusterOf(factor: FactorId): ClusterId | undefined {
  for (const [name, members] of Object.entries(CLUSTERS)) {
    if (members.includes(factor)) return name as ClusterId;
  }
  return undefined;
}

/**
 * Inverse-normal approximation via the Beasley-Springer-Moro algorithm.
 * Used for F17 (annual embargo share) where we want percentile → z-equivalent.
 *
 * @param p percentile in [0, 1]
 * @returns z-score such that P(Z <= z) = p
 */
function inverseNormalApprox(p: number): number {
  if (p <= 0) return -3.0;
  if (p >= 1) return  3.0;
  // Rational approximation (Abramowitz & Stegun 26.2.23)
  const t = Math.sqrt(-2 * Math.log(p < 0.5 ? p : 1 - p));
  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;
  const z = t - ((c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t));
  return p < 0.5 ? -z : z;
}

/**
 * Assumed correlation map for N_eff approximation.
 *
 * This is the LOCKED analyst's-notes correlation map from
 * phase-3-atlas-spec-robust.md Page 10. Pairs not listed are assumed independent.
 *
 * Used only for the §4.3 N_eff approximation; the v1.0 Pulse composite itself does NOT
 * depend on this map (cluster-cap handles the within-cluster dependency).
 */
const ASSUMED_CORRELATIONS: Partial<Record<FactorId, Partial<Record<FactorId, number>>>> = {
  F5:  { F13: 0.5, F21: 0.8 },
  F13: { F5:  0.5, F14: 0.7, F24: 0.6, F26: 0.5 },
  F14: { F13: 0.7, F19: -0.4, F17: 0.5 },
  F15: { F22: 0.5, F1: -0.3, F2: -0.3, F8: -0.3 },
  F17: { F14: 0.5 },
  F21: { F5:  0.8, F22: 0.6 },
  F22: { F15: 0.5, F21: 0.6 },
  F24: { F13: 0.6 },
  F26: { F13: 0.5 },
  F27: { F28: 0.7, F1: -0.4, F2: -0.4, F8: -0.4 },
  F28: { F27: 0.7, F3:  0.5 },
  F3:  { F28: 0.5 },
  F30: { F9:  0.5, F10: 0.7 },
  F9:  { F30: 0.5 },
  F10: { F30: 0.7 },
  F6_16: { F5: 0.4, F21: 0.4 },
};