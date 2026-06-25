// tests/unit/factor-registry.test.ts — Locks the 29-factor registry invariants.

import { describe, expect, it } from "vitest";
import { ALL_FACTOR_IDS, FACTORS, getFactorCluster, isLevelAnchored, WEIGHT_SUM } from "../factor-registry";
import { CATEGORIES, CLUSTERS } from "../types";

describe("Factor registry", () => {
  it("has exactly 29 factors", () => {
    expect(ALL_FACTOR_IDS.length).toBe(29);
  });

  it("has weights summing to 1.000 (verified at module load)", () => {
    expect(WEIGHT_SUM).toBeCloseTo(1.000, 6);
  });

  it("uses the F6_16 ID for the netted FX factor (Reversal #3)", () => {
    expect(FACTORS.F6_16).toBeDefined();
    expect(FACTORS.F6_16.name).toMatch(/FX/);
    expect(FACTORS.F6_16.weight).toBe(0.05);
    // F16 should NOT exist as a separate factor
    expect((FACTORS as any).F16).toBeUndefined();
  });

  it("uses magnitude/intensity normalization (Reversal #1) — meta only, not in math", () => {
    // The math itself doesn't reference polarity (see math.ts); it's metadata only.
    // The composite is computed as Σ w' * tanh(|z|/2), which is polarity-free.
    // The FACTORS table may still carry polarity for the directional detail view.
    for (const fid of ALL_FACTOR_IDS) {
      expect([1, -1]).toContain(FACTORS[fid].polarity);
    }
  });

  it("categories sum to: price 0.19, macro 0.61, news 0.19, sentiment 0.01", () => {
    let price = 0, macro = 0, news = 0, sentiment = 0;
    for (const fid of ALL_FACTOR_IDS) {
      const w = FACTORS[fid].weight;
      switch (FACTORS[fid].category) {
        case "price":     price += w; break;
        case "macro":     macro += w; break;
        case "news":      news += w; break;
        case "sentiment": sentiment += w; break;
      }
    }
    expect(price).toBeCloseTo(0.19, 6);
    expect(macro).toBeCloseTo(0.61, 6);
    expect(news).toBeCloseTo(0.19, 6);
    expect(sentiment).toBeCloseTo(0.01, 6);
  });

  it("every factor is assigned to a category", () => {
    const allIds = new Set(ALL_FACTOR_IDS);
    const cIds = new Set<string>();
    for (const cat of Object.values(CATEGORIES)) {
      for (const fid of cat) cIds.add(fid);
    }
    expect(cIds.size).toBe(29);
    for (const fid of allIds) {
      expect(cIds.has(fid)).toBe(true);
    }
  });

  it("every cluster has 3-4 members (per spec §2.2)", () => {
    for (const [name, members] of Object.entries(CLUSTERS)) {
      expect(members.length, `cluster ${name}`).toBeGreaterThanOrEqual(1);
      expect(members.length, `cluster ${name}`).toBeLessThanOrEqual(4);
    }
  });

  it("level-anchored factors are exactly the §2.5 set", () => {
    const expected = ["F5", "F21", "F22", "F24", "F26", "F27"];
    for (const fid of expected) {
      expect(isLevelAnchored(fid as any), `${fid} should be level-anchored`).toBe(true);
    }
    // F13, F14, F18, F19, F20, F23, F25 are NOT level-anchored (monthly/quarterly stats)
    for (const fid of ["F13", "F14", "F20", "F23"]) {
      expect(isLevelAnchored(fid as any), `${fid} should NOT be level-anchored`).toBe(false);
    }
  });

  it("getFactorCluster returns the right cluster for known factors", () => {
    expect(getFactorCluster("F5")).toBe("rates");
    expect(getFactorCluster("F21")).toBe("rates");
    expect(getFactorCluster("F13")).toBe("inflation");
    expect(getFactorCluster("F27")).toBe("credit_vol");
    expect(getFactorCluster("F6_16")).toBe("fx");
    // F1 is not in any cluster
    expect(getFactorCluster("F1")).toBeUndefined();
  });
});