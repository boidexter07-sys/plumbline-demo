// tests/unit/compute.test.ts — Integration of the 12-step compute pipeline at the holding level.

import { describe, expect, it } from "vitest";
import { aggregatePortfolio, computeHoldingPulse } from "../compute";
import { DEFAULT_BAND_CUTPOINTS } from "../types";
import type { FactorId, FactorObservation, Position } from "../types";
import { ALL_FACTOR_IDS } from "../factor-registry";

function makeObs(value: number, freshnessSeconds = 60): FactorObservation {
  const isoDate = new Date(Date.now() - freshnessSeconds * 1000).toISOString();
  return {
    raw_value: value,
    observation_date: isoDate,
    source: "test",
    freshness_seconds: freshnessSeconds,
  };
}

const TEST_POS: Position = {
  symbol: "AAPL",
  weight: 1.0,
  asset_class: "equity_us",
  sector: "Technology",
  usd_revenue_exposure: 0.62,
};

describe("computeHoldingPulse", () => {
  it("returns Quiet (low intensity) when all factors are at baseline", () => {
    const obs: Partial<Record<FactorId, FactorObservation>> = {};
    const baselines: any = {};
    for (const fid of ALL_FACTOR_IDS) {
      obs[fid] = makeObs(100);     // at baseline (mu=100)
      baselines[fid] = { mu: 100, sigma: 5, history: [95, 100, 105] };
    }
    const { holding, composite } = computeHoldingPulse(
      TEST_POS, obs, baselines, DEFAULT_BAND_CUTPOINTS,
    );
    // All factors at z=0 → all intensities ≈ 0 → composite ≈ 0
    expect(composite).toBeLessThan(0.05);
    expect(holding.band).toBe("Quiet");
    expect(holding.coverage).toBe(1);     // all live
    expect(holding.low_confidence).toBe(false);
  });

  it("raises the composite when factors deviate from baseline (Reversal #1 — magnitude)", () => {
    const obs: Partial<Record<FactorId, FactorObservation>> = {};
    const baselines: any = {};
    for (const fid of ALL_FACTOR_IDS) {
      obs[fid] = makeObs(115);    // 3σ above baseline
      baselines[fid] = { mu: 100, sigma: 5, history: [95, 100, 105] };
    }
    const { composite } = computeHoldingPulse(
      TEST_POS, obs, baselines, DEFAULT_BAND_CUTPOINTS,
    );
    // 3σ deviations → all intensities ≈ 0.905 → composite should be substantial
    expect(composite).toBeGreaterThan(0.7);
  });

  it("same intensity for +z and -z (Reversal #1 — non-directional)", () => {
    const obsUp: Partial<Record<FactorId, FactorObservation>> = {};
    const obsDown: Partial<Record<FactorId, FactorObservation>> = {};
    const baselines: any = {};
    for (const fid of ALL_FACTOR_IDS) {
      obsUp[fid] = makeObs(115);    // +3σ
      obsDown[fid] = makeObs(85);   // -3σ
      baselines[fid] = { mu: 100, sigma: 5, history: [95, 100, 105] };
    }
    const r1 = computeHoldingPulse(TEST_POS, obsUp, baselines, DEFAULT_BAND_CUTPOINTS);
    const r2 = computeHoldingPulse(TEST_POS, obsDown, baselines, DEFAULT_BAND_CUTPOINTS);
    expect(r1.composite).toBeCloseTo(r2.composite, 4);
  });

  it("masks Canadian-domestic macro for crypto holdings (§3.2)", () => {
    const cryptoPos: Position = { ...TEST_POS, asset_class: "crypto" };
    const obs: Partial<Record<FactorId, FactorObservation>> = {};
    const baselines: any = {};
    for (const fid of ALL_FACTOR_IDS) {
      obs[fid] = makeObs(115);
      baselines[fid] = { mu: 100, sigma: 5, history: [95, 100, 105] };
    }
    const { holding } = computeHoldingPulse(cryptoPos, obs, baselines, DEFAULT_BAND_CUTPOINTS);
    // F13 (Canadian CPI) should be masked for crypto
    expect(holding.factors.F13.weight_effective).toBe(0);
    // F14 (Gas) should be masked for crypto
    expect(holding.factors.F14.weight_effective).toBe(0);
    // F1 (price) should NOT be masked for crypto
    expect(holding.factors.F1.weight_effective).toBeGreaterThan(0);
    // F5 (BoC) should be at half-weight for crypto
    expect(holding.factors.F5.weight_effective).toBeCloseTo(0.025, 3);    // 0.05 * 0.5
  });

  it("marks factors missing when observation is absent", () => {
    const obs: Partial<Record<FactorId, FactorObservation>> = {};
    const baselines: any = {};
    // Provide only F1, F5, F28
    obs.F1 = makeObs(102);
    obs.F5 = makeObs(4.5);
    obs.F28 = makeObs(18);
    // Provide only F1, F5, F28
    for (const fid of ["F1", "F5", "F28"] as FactorId[]) {
      baselines[fid] = { mu: 100, sigma: 5, history: [95, 100, 105] };
    }
    const { holding } = computeHoldingPulse(TEST_POS, obs, baselines, DEFAULT_BAND_CUTPOINTS);
    expect(holding.factors.F1.missing).toBe(false);
    expect(holding.factors.F13.missing).toBe(true);
    expect(holding.coverage).toBeLessThan(1);
  });

  it("marks factors stale when freshness exceeds the cadence threshold", () => {
    const obs: Partial<Record<FactorId, FactorObservation>> = {};
    const baselines: any = {};
    obs.F1 = makeObs(102, 60);                                  // fresh
    obs.F21 = makeObs(5.0, 60 * 86400);                          // 60 days old, exceeds 7d for F21
    baselines.F1 = { mu: 100, sigma: 5, history: [95, 100, 105] };
    baselines.F21 = { mu: 5, sigma: 1, history: [4, 5, 6] };
    const { holding } = computeHoldingPulse(TEST_POS, obs, baselines, DEFAULT_BAND_CUTPOINTS);
    expect(holding.factors.F1.stale).toBe(false);
    expect(holding.factors.F21.stale).toBe(true);
  });

  it("composite stays in [0, 1] for any input", () => {
    const obs: Partial<Record<FactorId, FactorObservation>> = {};
    const baselines: any = {};
    // Wild extremes
    for (const fid of ALL_FACTOR_IDS) {
      obs[fid] = makeObs(100000);
      baselines[fid] = { mu: 100, sigma: 1, history: [99, 100, 101] };
    }
    const { composite } = computeHoldingPulse(TEST_POS, obs, baselines, DEFAULT_BAND_CUTPOINTS);
    expect(composite).toBeGreaterThanOrEqual(0);
    expect(composite).toBeLessThanOrEqual(1);
  });
});

describe("aggregatePortfolio", () => {
  it("computes a weighted average across holdings", () => {
    const obs1: any = {};
    const obs2: any = {};
    const baselines: any = {};
    for (const fid of ALL_FACTOR_IDS) {
      obs1[fid] = makeObs(100);    // baseline
      obs2[fid] = makeObs(120);    // 4σ above
      baselines[fid] = { mu: 100, sigma: 5, history: [95, 100, 105] };
    }
    const h1 = computeHoldingPulse({ ...TEST_POS, weight: 0.5 }, obs1, baselines, DEFAULT_BAND_CUTPOINTS);
    const h2 = computeHoldingPulse({ ...TEST_POS, weight: 0.5, symbol: "MSFT" }, obs2, baselines, DEFAULT_BAND_CUTPOINTS);
    const portfolio = aggregatePortfolio([h1, h2], new Date().toISOString(), 100, baselines);
    expect(portfolio.composite).toBeGreaterThan(0);
    expect(portfolio.composite).toBeLessThan(1);
    expect(portfolio.holdings.length).toBe(2);
  });

  it("effective_n_signals is finite and positive", () => {
    const obs: any = {};
    const baselines: any = {};
    for (const fid of ALL_FACTOR_IDS) {
      obs[fid] = makeObs(110);
      baselines[fid] = { mu: 100, sigma: 5, history: [95, 100, 105] };
    }
    const h = computeHoldingPulse(TEST_POS, obs, baselines, DEFAULT_BAND_CUTPOINTS);
    const portfolio = aggregatePortfolio([h], new Date().toISOString(), 100, baselines);
    expect(portfolio.effective_n_signals).toBeGreaterThan(0);
    expect(portfolio.effective_n_signals).toBeLessThanOrEqual(29);
  });
});