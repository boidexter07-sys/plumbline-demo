// _source/lib/pulse/pulse.ts — Browser-friendly entry to the Pulse engine.
//
// Phase 2 of Plumbline v1.0 — Decision 41 (no Cloudflare). The Pulse math runs
// client-side against the static data.json snapshot. This file is the single
// import surface the dashboard uses:
//
//   import { computePulse } from "@/lib/pulse/pulse";
//
// Inputs:
//   - portfolio: array of positions (symbol, weight, asset_class, sector, ...)
//   - snapshot:  the data.json fetched from /data.json — see type below
//
// Output:
//   - { perHolding: HoldingPulse[], portfolio: PortfolioPulse }
//
// The math here is identical to v1.0-worker/src/pulse/compute.ts. The data-
// snapshot script (lib/pulse/snapshot.ts) and the browser compute this with
// the same functions, so the two outputs match exactly (modulo time-of-day
// freshness).

import type {
  BandCutpoints,
  DataJson,
  FactorId,
  FactorObservation,
  HoldingPulse,
  PortfolioPulse,
  Position,
} from "./types";
import { DEFAULT_BAND_CUTPOINTS } from "./types";
import { ALL_FACTOR_IDS } from "./factor-registry";
import { aggregatePortfolio, computeHoldingPulse } from "./compute";

/**
 * A user's portfolio, persisted in localStorage. Positions are normalised so
 * weights sum to 1; this is enforced at write time.
 */
export interface BrowserPortfolio {
  positions: Position[];
}

/**
 * The shape of data.json as written by scripts/data-snapshot.ts.
 *
 * Top-level keys come from the Atlas spec §5.2; the engine itself only needs
 * `pulse_universe.composite_stats`, `pulse_universe.band_cutpoints`, and the
 * per-holding baseline maps.
 */
export interface BrowserSnapshot {
  computed_at: string;
  pulse_version: string;
  weights_hash: string;
  bands_hash: string;
  /** Universe-level composite distribution (used for percentile band assignment). */
  universe: {
    composites: number[];
    mean: number;
    p50: number;
    p75: number;
    p90: number;
    p98: number;
  };
  /** Locked percentile band cutpoints. */
  band_cutpoints: BandCutpoints;
  /** Per-factor baseline (mu, sigma, history) — used to compute z-scores. */
  baselines: Partial<Record<FactorId, { mu: number; sigma: number; history: number[] }>>;
  /** Per-holding observations keyed by symbol. */
  observations: Record<string, Partial<Record<FactorId, FactorObservation>>>;
  /** Asset-class applicability matrix (defaults baked in if absent). */
  applicability?: DataJson["pulse_universe"] extends never ? never : never;
}

export interface PulseResult {
  perHolding: HoldingPulse[];
  portfolio: PortfolioPulse;
  /** Compute duration in ms — useful for showing "computed in 47ms" UX. */
  compute_duration_ms: number;
  /** Schema-version check — useful for showing a banner if the snapshot is stale. */
  snapshot_computed_at: string;
}

/**
 * Compute Pulse for a portfolio against a snapshot.
 *
 * This is the only function the dashboard needs. It:
 *   1. Computes per-holding Pulse (29-factor, all 5 reversals)
 *   2. Aggregates to portfolio Pulse (weighted by holding weight)
 *   3. Returns the result with timing metadata
 *
 * No async, no fetch, no Node — runs entirely in the browser.
 */
export function computePulse(
  portfolio: BrowserPortfolio,
  snapshot: BrowserSnapshot,
  options: {
    previousBands?: Record<string, { band: HoldingPulse["band"]; composite: number }>;
  } = {},
): PulseResult {
  const t0 =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  const cutpoints = snapshot.band_cutpoints ?? DEFAULT_BAND_CUTPOINTS;

  // Normalise weights so they sum to 1 (defensive — caller may have stale data)
  const positions = normaliseWeights(portfolio.positions);

  // Per-holding compute
  const perHolding: Array<{ holding: HoldingPulse; composite: number }> = [];
  for (const pos of positions) {
    const observations = snapshot.observations[pos.symbol] ?? {};
    const prev = options.previousBands?.[pos.symbol] ?? null;
    const result = computeHoldingPulse(
      pos,
      observations,
      snapshot.baselines,
      cutpoints,
      prev?.band ?? null,
      prev?.composite ?? null,
    );
    perHolding.push(result);
  }

  // Portfolio aggregate
  const computedAt =
    typeof snapshot.computed_at === "string" ? snapshot.computed_at : new Date().toISOString();
  const t1 =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  const compute_duration_ms = Math.round(t1 - t0);

  const portfolioResult = aggregatePortfolio(
    perHolding,
    computedAt,
    compute_duration_ms,
    snapshot.baselines,
  );

  return {
    perHolding: perHolding.map((h) => h.holding),
    portfolio: portfolioResult,
    compute_duration_ms,
    snapshot_computed_at: computedAt,
  };
}

/**
 * Defensive weight normalisation — drops empty positions, renormalises so the
 * sum is exactly 1. Returns the original array untouched if already valid.
 */
function normaliseWeights(positions: Position[]): Position[] {
  const valid = positions.filter((p) => p.weight > 0 && p.symbol);
  if (valid.length === 0) return valid;
  const total = valid.reduce((a, p) => a + p.weight, 0);
  if (Math.abs(total - 1) < 1e-6) return valid;
  return valid.map((p) => ({ ...p, weight: p.weight / total }));
}

/**
 * Quick sanity-check helper for the UI — "this holding is at the X percentile
 * of the universe's composite distribution."
 */
export function universePercentile(composite: number, snapshot: BrowserSnapshot): number {
  if (!snapshot.universe?.composites?.length) return 0.5;
  const sorted = [...snapshot.universe.composites].sort((a, b) => a - b);
  let count = 0;
  for (const c of sorted) {
    if (c <= composite) count++;
    else break;
  }
  return count / sorted.length;
}

/** Re-export the canonical factor list for callers that want to enumerate. */
export { ALL_FACTOR_IDS };