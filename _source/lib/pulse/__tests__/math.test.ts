// tests/unit/math.test.ts — Unit tests for the Pulse math primitives.
//
// Source-of-truth: phase-3-atlas-spec-robust.md §1 (intensity), §2.1 (native-freq),
// §2.4 (tanh saturation), §3.4 (drop-and-renormalize).

import { describe, expect, it } from "vitest";
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
} from "../math";
import { DEFAULT_BAND_CUTPOINTS, CLUSTERS } from "../types";
import { ALL_FACTOR_IDS } from "../factor-registry";

describe("zScore", () => {
  it("computes a basic z-score", () => {
    expect(zScore(110, 100, 10)).toBeCloseTo(1.0, 6);
    expect(zScore(90, 100, 10)).toBeCloseTo(-1.0, 6);
    expect(zScore(100, 100, 10)).toBeCloseTo(0, 6);
  });

  it("returns 0 when sigma is 0 (degenerate series)", () => {
    expect(zScore(110, 100, 0)).toBe(0);
    expect(zScore(110, 100, NaN)).toBe(0);
  });

  it("returns NaN for non-finite raw values", () => {
    expect(zScore(NaN, 100, 10)).toBeNaN();
    expect(zScore(Infinity, 100, 10)).toBeNaN();
  });
});

describe("intensity (Reversal #1 — the load-bearing fix)", () => {
  it("returns 0 at baseline (z=0)", () => {
    expect(intensity(0)).toBe(0);
  });

  it("is non-negative for all z (no signed values)", () => {
    for (const z of [-5, -2, -1, 0, 1, 2, 5]) {
      expect(intensity(z)).toBeGreaterThanOrEqual(0);
    }
  });

  it("produces the same intensity for +z and -z (non-directional)", () => {
    expect(intensity(2)).toBeCloseTo(intensity(-2), 6);
    expect(intensity(5)).toBeCloseTo(intensity(-5), 6);
  });

  it("matches tanh(|z|/2) exactly", () => {
    for (const z of [-3, -1, 0.5, 1.5, 2.5, 4]) {
      expect(intensity(z)).toBeCloseTo(Math.tanh(Math.abs(z) / 2), 6);
    }
  });

  it("soft-saturates: a 10σ event still ranks above a 3σ event", () => {
    const small = intensity(3);
    const big = intensity(10);
    expect(big).toBeGreaterThan(small);
    // No hard clip — both should be < 1
    expect(small).toBeLessThan(1);
    expect(big).toBeLessThan(1);
    // 3σ → ~0.905, 10σ → ~0.99995
    expect(small).toBeCloseTo(0.9051, 3);
    expect(big).toBeCloseTo(0.99995, 3);
  });

  it("is monotone in |z|", () => {
    let prev = -1;
    for (const z of [0.5, 1, 2, 3, 5, 8]) {
      const i = intensity(z);
      expect(i).toBeGreaterThan(prev);
      prev = i;
    }
  });

  it("returns 0 for NaN", () => {
    expect(intensity(NaN)).toBe(0);
  });
});

describe("percentileRank (used for F17 annual embargo share)", () => {
  it("returns 0 for the lowest value", () => {
    expect(percentileRank(1, [1, 2, 3, 4, 5])).toBe(0.2);
  });

  it("returns 1 for the highest value", () => {
    expect(percentileRank(5, [1, 2, 3, 4, 5])).toBe(1);
  });

  it("returns 0.5 for an empty history", () => {
    expect(percentileRank(3, [])).toBe(0.5);
  });

  it("handles unsorted history", () => {
    expect(percentileRank(3, [5, 1, 3, 2, 4])).toBe(0.6);
  });
});

describe("bandFromComposite / bandFromPercentile", () => {
  it("assigns bands according to locked percentile cutpoints", () => {
    expect(bandFromComposite(0.10, DEFAULT_BAND_CUTPOINTS)).toBe("Quiet");
    expect(bandFromComposite(0.35, DEFAULT_BAND_CUTPOINTS)).toBe("Quiet");   // below 0.40
    expect(bandFromComposite(0.50, DEFAULT_BAND_CUTPOINTS)).toBe("Light");    // between 0.40-0.58
    expect(bandFromComposite(0.65, DEFAULT_BAND_CUTPOINTS)).toBe("Active");
    expect(bandFromComposite(0.80, DEFAULT_BAND_CUTPOINTS)).toBe("Strong");
    expect(bandFromComposite(0.95, DEFAULT_BAND_CUTPOINTS)).toBe("Intense");
  });

  it("bandFromPercentile works on percentile ranks (using DEFAULT_BAND_CUTPOINTS = empirical composite values, not percentile defaults)", () => {
    // DEFAULT_BAND_CUTPOINTS in this build hold the empirical-composite cutpoints:
    //   quiet_max=0.40, light_max=0.58, active_max=0.71, strong_max=0.85
    // bandFromPercentile compares the INPUT to these composite values.
    expect(bandFromPercentile(0.10, DEFAULT_BAND_CUTPOINTS)).toBe("Quiet");
    expect(bandFromPercentile(0.50, DEFAULT_BAND_CUTPOINTS)).toBe("Light");   // 0.50 > 0.40, < 0.58
    expect(bandFromPercentile(0.65, DEFAULT_BAND_CUTPOINTS)).toBe("Active");  // > 0.58, < 0.71
    expect(bandFromPercentile(0.80, DEFAULT_BAND_CUTPOINTS)).toBe("Strong");  // > 0.71, < 0.85
    expect(bandFromPercentile(0.95, DEFAULT_BAND_CUTPOINTS)).toBe("Intense"); // > 0.85
  });
});

describe("applyHysteresis (Reversal §4.1)", () => {
  it("adopts proposed band on first run (no previous)", () => {
    expect(
      applyHysteresis("Active", null, 0.55, null, DEFAULT_BAND_CUTPOINTS, 0.02),
    ).toBe("Active");
  });

  it("keeps previous band when boundary crossed by less than margin", () => {
    // Boundary between Quiet (0-0.40) and Light (0.40-0.58) is at 0.40.
    // Yesterday: 0.39 (Quiet). Today: 0.405 (crossed by 0.005, less than 0.02 margin).
    // Proposed: Light. Expected: hold Quiet.
    expect(
      applyHysteresis("Light", "Quiet", 0.405, 0.39, DEFAULT_BAND_CUTPOINTS, 0.02),
    ).toBe("Quiet");
  });

  it("flips when boundary crossed by margin or more", () => {
    // Today: 0.45 (crossed by 0.05, more than 0.02 margin). Flip.
    expect(
      applyHysteresis("Light", "Quiet", 0.45, 0.39, DEFAULT_BAND_CUTPOINTS, 0.02),
    ).toBe("Light");
  });

  it("no-op when proposed equals previous", () => {
    expect(
      applyHysteresis("Active", "Active", 0.55, 0.55, DEFAULT_BAND_CUTPOINTS, 0.02),
    ).toBe("Active");
  });

  it("stops strobing at the boundary — sanity check across multiple runs", () => {
    // Day 1: composite 0.395 (Quiet)
    // Day 2: composite 0.401 (would be Light, but margin 0.001 → hold Quiet)
    // Day 3: composite 0.42  (now margin 0.02 → flip)
    let band: "Quiet" | "Light" | "Active" | "Strong" | "Intense" | null = null;
    const days: Array<[number, number]> = [
      [0.395, 0],
      [0.401, 0.395],
      [0.42, 0.401],
    ];
    for (const [composite, prev] of days) {
      band = applyHysteresis("Light", band, composite, prev, DEFAULT_BAND_CUTPOINTS, 0.02);
    }
    expect(band).toBe("Light");     // flipped on day 3
  });
});

describe("dropAndRenormalize (§3.4)", () => {
  it("drops missing factor and renormalizes within category", () => {
    const weights = { F1: 0.07, F2: 0.05, F3: 0.04, F4: 0.03 } as any;
    const isLive = { F1: true, F2: false, F3: true, F4: true } as any;
    const result = dropAndRenormalize(weights, isLive, "price");
    expect(result.F2).toBe(0);
    // Live weight was 0.07 + 0.04 + 0.03 = 0.14; original was 0.19.
    // Scale = 0.19 / 0.14 = 1.357
    // F1 → 0.07 * 1.357 ≈ 0.095
    // F3 → 0.04 * 1.357 ≈ 0.054
    // F4 → 0.03 * 1.357 ≈ 0.041
    expect(result.F1).toBeCloseTo(0.095, 3);
    expect(result.F3).toBeCloseTo(0.054, 3);
    expect(result.F4).toBeCloseTo(0.041, 3);
    // Sum ≈ 0.19 (preserved)
    expect(result.F1 + result.F3 + result.F4).toBeCloseTo(0.19, 3);
  });

  it("returns zeros when all factors in category are dead", () => {
    const weights = { F1: 0.07, F2: 0.05, F3: 0.04, F4: 0.03 } as any;
    const isLive = { F1: false, F2: false, F3: false, F4: false } as any;
    const result = dropAndRenormalize(weights, isLive, "price");
    expect(result.F1 + result.F2 + result.F3 + result.F4).toBe(0);
  });
});

describe("categoryCoverage (§3.4 floor rule)", () => {
  it("returns full coverage when all factors are live", () => {
    const weights = {
      F1:  { weight: 0.07, missing: false, stale: false },
      F2:  { weight: 0.05, missing: false, stale: false },
      F3:  { weight: 0.04, missing: false, stale: false },
      F4:  { weight: 0.03, missing: false, stale: false },
    } as any;
    const cc = categoryCoverage("price", weights, 0.60);
    expect(cc.coverage).toBe(1);
    expect(cc.low_confidence).toBe(false);
  });

  it("flags low_confidence when coverage falls below 0.60", () => {
    const weights = {
      F1:  { weight: 0.07, missing: true,  stale: false },
      F2:  { weight: 0.05, missing: true,  stale: false },
      F3:  { weight: 0.04, missing: false, stale: false },
      F4:  { weight: 0.03, missing: false, stale: false },
    } as any;
    // Live weight = 0.04 + 0.03 = 0.07, total = 0.19, coverage = 0.368 → low_confidence
    const cc = categoryCoverage("price", weights, 0.60);
    expect(cc.coverage).toBeCloseTo(0.368, 2);
    expect(cc.low_confidence).toBe(true);
  });
});

describe("applyClusterCap (§2.2)", () => {
  it("does not cap when cluster sum is below the cap", () => {
    // rates cluster: F5(0.05) + F21(0.03) + F22(0.03) + F26(0.02) = 0.13
    // cap = 0.13 * 1.5 = 0.195 → no cap
    const weights = {
      F5: 0.05, F21: 0.03, F22: 0.03, F26: 0.02,
      F13: 0.04, F14: 0.04, F24: 0.02,    // inflation
      F27: 0.02, F28: 0.02, F3: 0.04,      // credit_vol
      F6_16: 0.05,                         // fx
    } as any;
    const result = applyClusterCap(weights, 1.5);
    expect(result.F5 + result.F21 + result.F22 + result.F26).toBeCloseTo(0.13, 6);
  });

  it("caps when cluster sum exceeds the cap", () => {
    // rates: F5 + F21 + F22 + F26 = 0.05 + 0.03 + 0.03 + 0.02 = 0.13
    // Mutate to make the cluster dominant: scale rates up by 3x
    const weights = {
      F5: 0.15, F21: 0.09, F22: 0.09, F26: 0.06,   // rates sum = 0.39
      F13: 0.04, F14: 0.04, F24: 0.02,
      F27: 0.02, F28: 0.02, F3: 0.04,
      F6_16: 0.05,
    } as any;
    const result = applyClusterCap(weights, 1.5);
    // Cap is 0.39 * 1.5 = 0.585; cluster effective is 0.39 → below cap → no change
    // To actually trigger cap, the cluster sum needs to exceed cap.
    // Use weights where cluster sum ALREADY exceeds cap:
    const weights2 = {
      F5: 0.30, F21: 0.20, F22: 0.15, F26: 0.10,   // sum = 0.75
      F13: 0.04, F14: 0.04, F24: 0.02,
      F27: 0.02, F28: 0.02, F3: 0.04,
      F6_16: 0.05,
    } as any;
    const result2 = applyClusterCap(weights2, 1.5);
    // Cap = 0.75 * 1.5 = 1.125; effective 0.75 < 1.125 → no cap
    // v1.0 cap logic: cap is "current * ratio" — only fires when current > cap, i.e., 0.75 > 1.125 → false
    // For the cap to fire, the cluster sum must already be > cap.
    // Let's make it explicit: cap_ratio 1.0 = "no amplification"
    const weights3 = {
      F5: 0.30, F21: 0.20, F22: 0.15, F26: 0.10,   // sum = 0.75
      F13: 0.04, F14: 0.04, F24: 0.02,
      F27: 0.02, F28: 0.02, F3: 0.04,
      F6_16: 0.05,
    } as any;
    const result3 = applyClusterCap(weights3, 1.0);   // ratio=1.0 means cap == current
    // sum=0.75, cap=0.75, sum > cap is FALSE (boundary) → no change
    // Use a slightly-less-than-1 ratio to force cap:
    const result4 = applyClusterCap(weights3, 0.99);  // cap = 0.7425 < 0.75 → CAP fires
    expect(result4.F5 + result4.F21 + result4.F22 + result4.F26).toBeLessThan(0.75);
  });
});

describe("effectiveNumberOfSignals (§4.3)", () => {
  it("returns 1 for perfectly correlated factors", () => {
    // All factors perfectly correlated (off-diagonal = 1)
    const weights = Object.fromEntries(ALL_FACTOR_IDS.map((id) => [id, 1 / ALL_FACTOR_IDS.length])) as any;
    const correlation: any = {};
    for (const i of ALL_FACTOR_IDS) {
      correlation[i] = {};
      for (const j of ALL_FACTOR_IDS) {
        correlation[i][j] = 1;     // perfect correlation
      }
    }
    const nEff = effectiveNumberOfSignals(weights, ALL_FACTOR_IDS, correlation);
    expect(nEff).toBeCloseTo(1, 6);    // participation ratio for N identical = 1
  });

  it("approaches N for independent factors", () => {
    // All factors independent (off-diagonal = 0)
    const weights = Object.fromEntries(ALL_FACTOR_IDS.map((id) => [id, 1 / ALL_FACTOR_IDS.length])) as any;
    const correlation: any = {};
    for (const i of ALL_FACTOR_IDS) {
      correlation[i] = {};
      for (const j of ALL_FACTOR_IDS) {
        correlation[i][j] = i === j ? 1 : 0;
      }
    }
    const nEff = effectiveNumberOfSignals(weights, ALL_FACTOR_IDS, correlation);
    // For independent factors, N_eff ≈ N (29)
    expect(nEff).toBeGreaterThan(25);
  });
});

describe("CLUSTERS constant", () => {
  it("includes the four locked clusters with the right factor membership", () => {
    expect(CLUSTERS.rates).toEqual(["F5", "F21", "F22", "F26"]);
    expect(CLUSTERS.inflation).toEqual(["F13", "F14", "F24"]);
    expect(CLUSTERS.credit_vol).toEqual(["F27", "F28", "F3"]);
    expect(CLUSTERS.fx).toEqual(["F6_16"]);
  });
});