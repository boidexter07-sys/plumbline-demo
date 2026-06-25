// tests/unit/factor-functions.test.ts — Tests for derived factor functions (F1-F4).

import { describe, expect, it } from "vitest";
import { f1Return1d, f2ReturnVsSector, f3Volatility30d, f4Drawdown, sectorEtfFor, toObservation } from "../factor-functions";

describe("f1Return1d", () => {
  it("computes 1d log return (approximated as simple return here)", () => {
    // [100, 102] → +2%
    expect(f1Return1d([100, 102])).toBeCloseTo(0.02, 4);
  });

  it("returns negative for a down day", () => {
    expect(f1Return1d([100, 98])).toBeCloseTo(-0.02, 4);
  });

  it("returns null if history is too short", () => {
    expect(f1Return1d([])).toBeNull();
    expect(f1Return1d([100])).toBeNull();
  });

  it("returns null if prev close is 0", () => {
    expect(f1Return1d([0, 100])).toBeNull();
  });
});

describe("f2ReturnVsSector", () => {
  it("computes the sector-relative return", () => {
    expect(f2ReturnVsSector(0.02, 0.01)).toBeCloseTo(0.01, 6);
    expect(f2ReturnVsSector(-0.05, 0.01)).toBeCloseTo(-0.06, 6);
  });

  it("returns null for non-finite inputs", () => {
    expect(f2ReturnVsSector(NaN, 0.01)).toBeNull();
    expect(f2ReturnVsSector(0.01, NaN)).toBeNull();
  });
});

describe("f3Volatility30d", () => {
  it("computes stdev of log returns over the last 30 days", () => {
    // 31 days of stable price 100 → 100 → ... → 100 (constant returns = 0)
    const stable = Array(31).fill(100);
    expect(f3Volatility30d(stable)).toBe(0);
  });

  it("returns null if history < 31 days", () => {
    expect(f3Volatility30d(Array(20).fill(100))).toBeNull();
  });

  it("positive for volatile series", () => {
    // Series with daily moves
    const history = [100];
    for (let i = 1; i < 31; i++) {
      history.push(history[i - 1]! * (1 + (i % 2 === 0 ? 0.02 : -0.02)));
    }
    const vol = f3Volatility30d(history);
    expect(vol).toBeGreaterThan(0);
  });
});

describe("f4Drawdown", () => {
  it("returns 0 when at the peak", () => {
    expect(f4Drawdown([100, 105, 110])).toBe(0);
  });

  it("computes depth from peak", () => {
    // Peak 110, last 99 → drawdown = (110-99)/110 ≈ 0.10
    expect(f4Drawdown([100, 110, 105, 99])).toBeCloseTo(0.10, 3);
  });

  it("returns 0 for empty history", () => {
    expect(f4Drawdown([])).toBeNull();
  });

  it("returns null if peak is 0", () => {
    expect(f4Drawdown([0, 0])).toBeNull();
  });
});

describe("sectorEtfFor", () => {
  it("returns XLK for Technology", () => {
    expect(sectorEtfFor({ symbol: "AAPL", weight: 1, asset_class: "equity_us", sector: "Technology" })).toBe("XLK");
  });

  it("returns XLF for Financial Services", () => {
    expect(sectorEtfFor({ symbol: "JPM", weight: 1, asset_class: "equity_us", sector: "Financial Services" })).toBe("XLF");
  });

  it("returns XLE for Energy", () => {
    expect(sectorEtfFor({ symbol: "XOM", weight: 1, asset_class: "equity_us", sector: "Energy" })).toBe("XLE");
  });

  it("defaults to XLK for unknown sectors", () => {
    expect(sectorEtfFor({ symbol: "XYZ", weight: 1, asset_class: "equity_us", sector: "Unknown" })).toBe("XLK");
  });
});

describe("toObservation", () => {
  it("wraps a numeric value as a FactorObservation", () => {
    const obs = toObservation(0.05, "yahoo:AAPL:F1");
    expect(obs).not.toBeNull();
    expect(obs!.raw_value).toBe(0.05);
    expect(obs!.source).toBe("yahoo:AAPL:F1");
    expect(obs!.freshness_seconds).toBeGreaterThanOrEqual(0);
  });

  it("returns null for null/non-finite inputs", () => {
    expect(toObservation(null, "x:y")).toBeNull();
    expect(toObservation(NaN, "x:y")).toBeNull();
    expect(toObservation(Infinity, "x:y")).toBeNull();
  });
});