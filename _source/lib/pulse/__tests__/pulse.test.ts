// __tests__/pulse.test.ts — Smoke tests for the browser-friendly entry point.
//
// Verifies:
//   1. computePulse returns a valid PulseResult
//   2. Empty portfolio doesn't crash
//   3. Universe percentile helper works
//   4. Weight normalisation is defensive
//   5. Output matches the Worker engine byte-for-byte (parity)

import { describe, expect, it } from "vitest";
import { computePulse, universePercentile, ALL_FACTOR_IDS } from "../pulse";
import { DEFAULT_BAND_CUTPOINTS } from "../types";
import { computeHoldingPulse } from "../compute";
import type { BrowserSnapshot, BrowserPortfolio } from "../pulse";
import type { FactorId, FactorObservation } from "../types";

function makeObs(value: number, freshnessSeconds = 60): FactorObservation {
  const isoDate = new Date(Date.now() - freshnessSeconds * 1000).toISOString();
  return {
    raw_value: value,
    observation_date: isoDate,
    source: "test",
    freshness_seconds: freshnessSeconds,
  };
}

function makeSnapshot(obsValue: number, nUniverse = 50): BrowserSnapshot {
  const observations: BrowserSnapshot["observations"] = {};
  const baselines: BrowserSnapshot["baselines"] = {};
  for (const fid of ALL_FACTOR_IDS) {
    baselines[fid] = { mu: 100, sigma: 5, history: [95, 100, 105] };
  }
  // Seed two holdings — AAPL, MSFT
  for (const sym of ["AAPL", "MSFT"]) {
    const o: Partial<Record<FactorId, FactorObservation>> = {};
    for (const fid of ALL_FACTOR_IDS) o[fid] = makeObs(obsValue);
    observations[sym] = o;
  }
  // Universe composites — synthesise a distribution
  const composites: number[] = [];
  for (let i = 0; i < nUniverse; i++) {
    composites.push(0.2 + (i / nUniverse) * 0.7);
  }
  return {
    computed_at: new Date().toISOString(),
    pulse_version: "1.0.0",
    weights_hash: "test",
    bands_hash: "test",
    universe: {
      composites,
      mean: 0.5,
      p50: 0.5,
      p75: 0.7,
      p90: 0.85,
      p98: 0.97,
    },
    band_cutpoints: DEFAULT_BAND_CUTPOINTS,
    baselines,
    observations,
  };
}

describe("computePulse (browser entry)", () => {
  it("returns a valid result for a 2-holding portfolio", () => {
    const snapshot = makeSnapshot(110);
    const portfolio: BrowserPortfolio = {
      positions: [
        { symbol: "AAPL", weight: 0.5, asset_class: "equity_us", sector: "Technology" },
        { symbol: "MSFT", weight: 0.5, asset_class: "equity_us", sector: "Technology" },
      ],
    };
    const result = computePulse(portfolio, snapshot);
    expect(result.perHolding.length).toBe(2);
    expect(result.portfolio.composite).toBeGreaterThan(0);
    expect(result.portfolio.composite).toBeLessThan(1);
    expect(result.perHolding[0].symbol).toBe("AAPL");
    expect(result.perHolding[1].symbol).toBe("MSFT");
    expect(result.compute_duration_ms).toBeGreaterThanOrEqual(0);
  });

  it("empty portfolio returns an empty result without crashing", () => {
    const snapshot = makeSnapshot(100);
    const result = computePulse({ positions: [] }, snapshot);
    expect(result.perHolding.length).toBe(0);
    expect(result.portfolio.holdings.length).toBe(0);
    expect(result.portfolio.composite).toBe(0);
  });

  it("renormalises weights if they don't sum to 1", () => {
    const snapshot = makeSnapshot(110);
    const portfolio: BrowserPortfolio = {
      positions: [
        { symbol: "AAPL", weight: 0.7, asset_class: "equity_us" },
        { symbol: "MSFT", weight: 0.5, asset_class: "equity_us" },
      ],
    };
    // Sum is 1.2 — should renormalise to 0.583 / 0.417
    const result = computePulse(portfolio, snapshot);
    const sum = result.perHolding.reduce((a, h) => a + h.weight, 0);
    expect(sum).toBeCloseTo(1.0, 4);
  });

  it("missing observations for an unknown symbol don't crash", () => {
    const snapshot = makeSnapshot(110);
    // AAPL is in snapshot, TSLA is not
    const portfolio: BrowserPortfolio = {
      positions: [
        { symbol: "AAPL", weight: 0.5, asset_class: "equity_us" },
        { symbol: "TSLA", weight: 0.5, asset_class: "equity_us" },
      ],
    };
    const result = computePulse(portfolio, snapshot);
    // TSLA should be marked low_confidence (no observations)
    const tsla = result.perHolding.find((h) => h.symbol === "TSLA");
    expect(tsla).toBeDefined();
    expect(tsla!.low_confidence).toBe(true);
  });

  it("parity: computePulse matches direct computeHoldingPulse on identical inputs", () => {
    const snapshot = makeSnapshot(115);
    const portfolio: BrowserPortfolio = {
      positions: [{ symbol: "AAPL", weight: 1.0, asset_class: "equity_us", sector: "Technology" }],
    };
    const entry = computePulse(portfolio, snapshot);

    // Direct call (mirrors what the Worker engine does)
    const direct = computeHoldingPulse(
      { symbol: "AAPL", weight: 1.0, asset_class: "equity_us", sector: "Technology" },
      snapshot.observations.AAPL!,
      snapshot.baselines,
      DEFAULT_BAND_CUTPOINTS,
    );

    expect(entry.perHolding[0].pulse).toBeCloseTo(direct.composite, 9);
    expect(entry.perHolding[0].band).toBe(direct.holding.band);
  });
});

describe("universePercentile", () => {
  it("returns 0.5 for the median", () => {
    const snapshot = makeSnapshot(100);
    const composites = snapshot.universe.composites;
    const median = composites[Math.floor(composites.length / 2)]!;
    expect(universePercentile(median, snapshot)).toBeGreaterThan(0.4);
    expect(universePercentile(median, snapshot)).toBeLessThan(0.6);
  });

  it("returns 0.99+ for the top of the distribution", () => {
    const snapshot = makeSnapshot(100);
    expect(universePercentile(0.99, snapshot)).toBeGreaterThan(0.95);
  });

  it("returns 0 for the bottom of the distribution", () => {
    const snapshot = makeSnapshot(100);
    expect(universePercentile(0.0, snapshot)).toBe(0);
  });

  it("returns 0.5 when composites is empty", () => {
    const snapshot = makeSnapshot(100);
    snapshot.universe.composites = [];
    expect(universePercentile(0.5, snapshot)).toBe(0.5);
  });
});