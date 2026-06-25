// src/pulse/math.ts — The v1.0 Pulse math primitives.
//
// Source-of-truth: phase-3-atlas-spec-robust.md §1 (intensity), §2.1 (native-freq),
// §2.4 (tanh saturation), §3.4 (drop-and-renormalize).
//
// Reversal #1 (Decision 28): intensity = tanh(|z|/2), NOT signed z-score.
// Reversal #2 (Decision 29): per-factor native-freq baseline, NOT uniform 252d.
//
// Properties we guarantee by construction:
//   - baseline (|z|≈0) → intensity ≈ 0  → Quiet
//   - both directions raise intensity (crash and rally produce same Pulse)
//   - no cancellation between positive and negative z's
//   - no hard clip (tanh is monotone forever, soft-saturates)
//   - composite ∈ [0, 1)

import type { FactorCategory, FactorId } from "./types";
import { CATEGORIES, CLUSTERS } from "./types";

/**
 * Compute the signed z-score against a baseline.
 *
 *   z = (raw - mu) / sigma
 *
 * Edge cases:
 *   - sigma = 0 (e.g., a degenerate series): returns 0 (treat as at-baseline)
 *   - raw = null/undefined: returns NaN (caller must mark missing upstream)
 */
export function zScore(raw: number, mu: number, sigma: number): number {
  if (!Number.isFinite(raw)) return NaN;
  if (!Number.isFinite(sigma) || sigma === 0) return 0;
  return (raw - mu) / sigma;
}

/**
 * Compute the magnitude intensity from a signed z-score.
 *
 *   intensity = tanh(|z|/2)
 *
 * Properties:
 *   - in [0, 1)
 *   - 0 at baseline (z=0)
 *   - both directions raise intensity equally
 *   - soft saturation: 3σ → 0.905, 5σ → 0.987, 10σ → 0.99996 (monotone, no clip)
 *
 * Reversal #1 (§1) — this is THE fix that makes Pulse non-directional.
 */
export function intensity(z: number): number {
  if (!Number.isFinite(z)) return 0;
  return Math.tanh(Math.abs(z) / 2);
}

/**
 * Compute the percentile rank of a value within a finite history.
 *
 * Used for F17 (annual embargo share) where σ from 1 observation is meaningless.
 *
 * Returns value in [0, 1]: 0 = lowest in history, 1 = highest.
 *
 * @param value the current raw value
 * @param history the available history (oldest → newest)
 */
export function percentileRank(value: number, history: number[]): number {
  if (history.length === 0) return 0.5;
  const sorted = [...history].sort((a, b) => a - b);
  let count = 0;
  for (const h of sorted) {
    if (h <= value) count++;
    else break;
  }
  return count / sorted.length;
}

/**
 * Lookup a band label from a composite score and percentile cutpoints.
 *
 * Spec §1.C: cutpoints are LOCKED percentiles of the empirical composite
 * distribution. Defaults: 0.50 / 0.75 / 0.90 / 0.98 / 1.00.
 *
 * Note: this is the direct-from-composite band lookup.
 * The HISTORICAL-percentile path is `bandFromPercentile()` — used in production
 * because the band name should track the empirical rank, not the raw value.
 *
 * @param composite the holding's or portfolio's composite in [0, 1]
 * @param cutpoints locked percentile cutpoints
 */
export function bandFromComposite(
  composite: number,
  cutpoints: { quiet_max: number; light_max: number; active_max: number; strong_max: number },
): "Quiet" | "Light" | "Active" | "Strong" | "Intense" {
  if (composite < cutpoints.quiet_max)  return "Quiet";
  if (composite < cutpoints.light_max)  return "Light";
  if (composite < cutpoints.active_max) return "Active";
  if (composite < cutpoints.strong_max) return "Strong";
  return "Intense";
}

/**
 * Lookup a band label from a known empirical percentile rank.
 *
 * Used after we compute the percentile of a holding's composite within the
 * universe's composite distribution. The cutpoints are the locked percentiles.
 */
export function bandFromPercentile(
  percentile: number,
  cutpoints: { quiet_max: number; light_max: number; active_max: number; strong_max: number },
): "Quiet" | "Light" | "Active" | "Strong" | "Intense" {
  if (percentile < cutpoints.quiet_max)  return "Quiet";
  if (percentile < cutpoints.light_max)  return "Light";
  if (percentile < cutpoints.active_max) return "Active";
  if (percentile < cutpoints.strong_max) return "Strong";
  return "Intense";
}

/**
 * Apply band hysteresis (§4.1):
 *
 *   A band boundary must be crossed by a margin of 0.02 in the composite
 *   (or persist for 3 days) before the label flips.
 *
 * @param proposed  the band the math wants to assign today
 * @param previous  the band assigned on the previous observation
 * @param compositeToday  the composite we're labeling
 * @param cutpoints  the locked percentile cutpoints
 * @param compositeYesterday  the composite from the previous observation (for margin test)
 */
export function applyHysteresis(
  proposed: "Quiet" | "Light" | "Active" | "Strong" | "Intense",
  previous: "Quiet" | "Light" | "Active" | "Strong" | "Intense" | null,
  compositeToday: number,
  compositeYesterday: number | null,
  cutpoints: { quiet_max: number; light_max: number; active_max: number; strong_max: number },
  margin: number,
): "Quiet" | "Light" | "Active" | "Strong" | "Intense" {
  // No previous → just adopt proposed.
  if (!previous || compositeYesterday === null) return proposed;

  if (proposed === previous) return proposed;     // no boundary crossed

  // Determine the boundary between proposed and previous.
  // The boundary is the cutpoint of the LOWER band of the two (the upper bound
  // of the lower band is the boundary into the higher band).
  const order = ["Quiet", "Light", "Active", "Strong", "Intense"];
  const proposedIdx = order.indexOf(proposed);
  const previousIdx = order.indexOf(previous);
  if (proposedIdx < 0 || previousIdx < 0) return proposed;

  const goingUp = proposedIdx > previousIdx;
  const lowerBand = goingUp ? previous : proposed;
  const boundary = cutpoints[cutpointKeyForUpper(lowerBand)];

  // Distance from the boundary the composite has traveled since yesterday.
  // For going-up: today should be above boundary by >= margin.
  // For going-down: today should be below boundary by >= margin.
  const distance = goingUp
    ? compositeToday - boundary
    : boundary - compositeToday;

  if (distance >= margin) return proposed;     // clear break
  return previous;                              // hold (boundary crossed by < margin → keep previous band)
}

function cutpointKeyForUpper(band: "Quiet" | "Light" | "Active" | "Strong" | "Intense"): "quiet_max" | "light_max" | "active_max" | "strong_max" {
  // Returns the upper bound of `band`. For "Intense", returns strong_max as the
  // boundary from Strong into Intense.
  switch (band) {
    case "Quiet":   return "quiet_max";
    case "Light":   return "light_max";
    case "Active":  return "active_max";
    case "Strong":  return "strong_max";
    case "Intense": return "strong_max";
  }
}

/**
 * Compute a coverage ratio (live weight / total weight) for a category.
 *
 * Per §3.4: if coverage < floor (default 0.60), mark the composite low_confidence.
 */
export function categoryCoverage(
  category: FactorCategory,
  weights: Record<FactorId, { weight: number; missing: boolean; stale: boolean }>,
  floor = 0.60,
): { coverage: number; low_confidence: boolean } {
  const factors = CATEGORIES[category];
  let liveWeight = 0;
  let totalWeight = 0;
  for (const f of factors) {
    const w = weights[f].weight;
    totalWeight += w;
    if (!weights[f].missing && !weights[f].stale) {
      liveWeight += w;
    }
  }
  const coverage = totalWeight === 0 ? 0 : liveWeight / totalWeight;
  return { coverage, low_confidence: coverage < floor };
}

/**
 * Drop-and-renormalize weights within a category (§3.4).
 *
 * For a missing factor i in category C, set w'_i = 0 and renormalize the remaining
 * factors in C so the category weight is preserved.
 *
 * Returns a NEW weights object — pure function.
 */
export function dropAndRenormalize(
  weights: Record<FactorId, number>,
  isLive: Record<FactorId, boolean>,
  category: FactorCategory,
): Record<FactorId, number> {
  const factors = CATEGORIES[category];
  let categoryWeight = 0;
  let liveCategoryWeight = 0;
  for (const f of factors) {
    categoryWeight += weights[f] ?? 0;
    if (isLive[f]) liveCategoryWeight += weights[f] ?? 0;
  }
  if (liveCategoryWeight === 0) {
    // All factors in category are dead. Zero out everything in the category.
    const result: Record<FactorId, number> = { ...weights };
    for (const f of factors) {
      result[f] = 0;
    }
    return result;
  }
  const scale = categoryWeight / liveCategoryWeight;
  const result: Record<FactorId, number> = { ...weights };
  for (const f of factors) {
    if (isLive[f]) {
      result[f] = (weights[f] ?? 0) * scale;
    } else {
      result[f] = 0;
    }
  }
  return result;
}

/**
 * Apply the §2.2 cluster-cap.
 *
 * For each cluster, if the sum of effective weights exceeds `cap_ratio × baseline`
 * (default cap_ratio = 1.5), scale all cluster members down by the ratio and
 * renormalize within the cluster so the cluster's effective contribution stays
 * capped but doesn't change the category-total weight.
 *
 * @param weights effective weights (post-mask, post-drop-and-renormalize)
 * @param clusterCapRatio how much a cluster can amplify (1.5 = 50% above baseline)
 */
export function applyClusterCap(
  weights: Record<FactorId, number>,
  clusterCapRatio = 1.5,
): Record<FactorId, number> {
  const result: Record<FactorId, number> = { ...weights };
  for (const [_, members] of Object.entries(CLUSTERS)) {
    // Compute baseline cluster weight (sum of base weights for cluster members)
    let clusterEffective = 0;
    for (const f of members) clusterEffective += result[f] ?? 0;
    // Compute baseline: treat current effective as the baseline (no separate pre-cap sum available
    // post-drop-and-renormalize). This is the v1.0 simplification — v1.1 may use the static pre-cap.
    const cap = clusterEffective * clusterCapRatio;
    if (clusterEffective > cap && clusterEffective > 0) {
      const scale = cap / clusterEffective;
      for (const f of members) {
        result[f] = (result[f] ?? 0) * scale;
      }
    }
  }
  return result;
}

/**
 * Effective number of independent signals (§4.3 — participation ratio).
 *
 *   N_eff = (Σλ)² / Σ(λ²)
 *
 * where λ are eigenvalues of the weighted correlation matrix.
 *
 * For v1.0 we use a simplified approximation that doesn't require full
 * eigen-decomposition: treat the weighted correlation as a matrix and compute
 * the participation ratio directly. For a diagonal matrix (independent
 * factors) this equals N; for a unit-rank matrix (perfectly correlated) this
 * equals 1.
 *
 * @param weights post-cap effective weights
 * @param factorIds the 29 factor IDs
 * @param correlation a 29×29 symmetric matrix of assumed correlations (1 on diagonal)
 */
export function effectiveNumberOfSignals(
  weights: Record<FactorId, number>,
  factorIds: FactorId[],
  correlation: Record<FactorId, Record<FactorId, number>>,
): number {
  const n = factorIds.length;
  if (n === 0) return 0;

  // Build the weighted correlation matrix C[i][j] = w_i * corr[i][j] * w_j
  const C: number[][] = [];
  for (let i = 0; i < n; i++) {
    const fi = factorIds[i]!;
    const wi = weights[fi] ?? 0;
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      const fj = factorIds[j]!;
      const wj = weights[fj] ?? 0;
      const cij = correlation[fi]?.[fj] ?? 0;
      row.push(wi * cij * wj);
    }
    C.push(row);
  }

  // Compute (Σλ)² and Σλ² via trace identities:
  //   trace(C) = Σλ
  //   trace(C²) = Σλ²
  let traceC = 0;
  let traceC2 = 0;
  for (let i = 0; i < n; i++) {
    traceC += C[i]![i]!;
    for (let j = 0; j < n; j++) {
      traceC2 += C[i]![j]! * C[j]![i]!;
    }
  }

  if (traceC2 === 0) return 0;
  return (traceC * traceC) / traceC2;
}