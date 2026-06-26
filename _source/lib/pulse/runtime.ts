// _source/lib/pulse/runtime.ts
//
// Phase 2 client runtime for the dashboard tiles. Three responsibilities:
//
//   1. Read /public/data.json once and adapt the producer's shape into the
//      BrowserSnapshot the engine expects (toBrowserSnapshot).
//   2. Read the user's portfolio from localStorage (key `plumbline_portfolio`).
//      Falls back to the test_30_universe template from data.json for first-time
//      visitors so the UI has something real to render during friend-feedback.
//   3. Provide a single useSnapshot() hook that all tiles share, so we only
//      fetch data.json once per page load.
//
// Why a hook and not a context provider: the static-export build doesn't ship
// React context well across the app/(app)/ route group, and each tile already
// sits inside StaticGate which handles the localStorage session. A single
// per-page fetch cached in module scope is the simplest correct shape.

"use client";

import { useEffect, useState } from "react";
import { computePulse } from "./pulse";
import type { BrowserPortfolio, BrowserSnapshot, PulseResult } from "./pulse";
import {
  DEFAULT_BAND_CUTPOINTS,
  type AssetClass,
  type BandCutpoints,
  type BandLabel,
  type Position,
} from "./types";

// =====================================================================
// data.json → BrowserSnapshot adapter
// =====================================================================

/**
 * The shape data-snapshot.ts writes to public/data.json. Mirrors the Atlas
 * spec §5.2 with the additions Phase 2 actually shipped (factor_legend,
 * holdings_observations, daily_brief, markets_now, leaderboard).
 */
export interface DataJson {
  meta: {
    schema_version: string;
    computed_at: string;
    pulse_version: string;
    weights_hash: string;
    bands_hash: string;
    low_confidence?: boolean;
    degraded_factors?: string[];
  };
  pulse_universe: {
    computed_at: string;
    compute_duration_ms: number;
    composite_stats: {
      mean: number;
      p50: number;
      p75: number;
      p90: number;
      p98: number;
      min: number;
      max: number;
    };
    band_cutpoints: BandCutpoints;
    asset_class_summaries: Array<{
      asset_class: string;
      count: number;
      mean_pulse: number;
      band_distribution: Record<string, number>;
    }>;
    top_movers: {
      biggest_rises: Array<{ symbol: string; pulse: number; band: string; change_from_yesterday: number }>;
      biggest_drops: Array<{ symbol: string; pulse: number; band: string; change_from_yesterday: number }>;
    };
  };
  pulse_portfolio_templates: Array<{
    id: string;
    name: string;
    composite: number;
    band: string;
    coverage: number;
    low_confidence: boolean;
    positions: Array<{ symbol: string; weight: number }>;
  }>;
  markets_now: {
    as_of: string;
    equities_us: Array<MarketRow>;
    crypto_top_10: Array<MarketRow>;
    commodities: Array<MarketRow>;
  };
  daily_brief: {
    date: string;
    computed_at: string;
    headline: string;
    paragraphs: string[];
    signals: Array<{ label: string; factors: string[]; impact: string }>;
    disclaimer: string;
  };
  leaderboard: {
    as_of: string;
    window: string;
    metric: string;
    top_10: Array<{ rank?: number; name?: string; sharpe?: number; ret3m?: number | string; pulse?: number | string; band?: string }>;
  };
  factor_legend: {
    computed_at: string;
    total_factors: number;
    factors: Array<{
      id: string;
      name: string;
      plain_language: string;
      category: string;
      weight: number;
      polarity: number;
      color_token: string;
      glyph_token: string;
      current_state: Record<string, unknown>;
    }>;
  };
  drift_monitor: { computed_at: string; alerts: unknown[] };
  holdings_observations: Record<string, Record<string, unknown>>;
  factor_baselines: Record<string, unknown>;
}

export interface MarketRow {
  symbol: string;
  name: string;
  /** Note: in current snapshot this is a normalised pulse-like value (0..1), not a price. */
  last: number;
  /** 0 = no daily delta captured yet by the snapshot script. */
  change_pct: number;
  source: string;
}

const DATA_URL = "/data.json";

/** Module-level cache so multiple tiles on the same page share one fetch. */
let cachedSnapshot: { data: DataJson; fetchedAt: number } | null = null;
let inflight: Promise<{ data: DataJson; fetchedAt: number }> | null = null;

/** Fetch /data.json once. Cache for the lifetime of the page. */
export function fetchDataJson(): Promise<{ data: DataJson; fetchedAt: number }> {
  if (cachedSnapshot) return Promise.resolve(cachedSnapshot);
  if (inflight) return inflight;
  inflight = fetch(DATA_URL, { credentials: "omit" })
    .then((r) => {
      if (!r.ok) throw new Error(`data.json HTTP ${r.status}`);
      return r.json() as Promise<DataJson>;
    })
    .then((data) => {
      const fetchedAt = Date.now();
      cachedSnapshot = { data, fetchedAt };
      inflight = null;
      return cachedSnapshot;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });
  return inflight;
}

/**
 * Convert the data.json producer shape into the BrowserSnapshot the engine
 * expects. This is the single boundary between "what the snapshot script
 * writes" and "what the math consumes" — keep it thin and total.
 */
export function toBrowserSnapshot(data: DataJson): BrowserSnapshot {
  const cs = data.pulse_universe.composite_stats;
  return {
    computed_at: data.pulse_universe.computed_at,
    pulse_version: data.meta.pulse_version,
    weights_hash: data.meta.weights_hash,
    bands_hash: data.meta.bands_hash,
    band_cutpoints: data.pulse_universe.band_cutpoints ?? DEFAULT_BAND_CUTPOINTS,
    universe: {
      // The snapshot script doesn't ship the full composites array (would bloat
      // the file). The engine only needs it for universePercentile() — and that
      // falls back to the band cutpoints + composite_stats, which are enough.
      composites: [cs.min, cs.p50, cs.p75, cs.p90, cs.p98, cs.max],
      mean: cs.mean,
      p50: cs.p50,
      p75: cs.p75,
      p90: cs.p90,
      p98: cs.p98,
    },
    baselines: {}, // Populated by future snapshot revision — engine treats empty as graceful missing.
    observations: data.holdings_observations as BrowserSnapshot["observations"],
  };
}

// =====================================================================
// Portfolio reader
// =====================================================================

const PORTFOLIO_KEY = "plumbline_portfolio";

export interface StoredPosition {
  symbol: string;
  weight: number;
  asset_class?: "equity_us" | "equity_ca" | "crypto" | "commodity";
  sector?: string;
}

/**
 * Read the user's portfolio from localStorage. If absent (first visit during
 * friend-feedback), fall back to the test_30_universe template baked into
 * data.json so the dashboard has something real to show. The fallback is
 * identifiable by a transient `_from_template` flag so the UI can show a
 * "sample portfolio" hint without ever writing it back to localStorage.
 */
export function readPortfolio(data: DataJson): BrowserPortfolio {
  let stored: StoredPosition[] | null = null;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(PORTFOLIO_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.positions)) {
          stored = parsed.positions as StoredPosition[];
        }
      }
    } catch {
      stored = null;
    }
  }
  if (stored && stored.length > 0) {
    return { positions: withAssetClass(stored, data) };
  }
  // Fallback: test_30_universe template from data.json. No write — the user
  // can edit in /sandbox/ to make it theirs.
  const tpl = data.pulse_portfolio_templates?.[0];
  if (tpl && Array.isArray(tpl.positions)) {
    return { positions: withAssetClass(tpl.positions, data) };
  }
  return { positions: [] };
}

/**
 * Stamp an asset_class onto each position using a snapshot-derived lookup.
 * Symbols appearing in markets_now.equities_us → equity_us, crypto → crypto,
 * commodities → commodity, otherwise default to equity_us (most common).
 * Unknown symbols (e.g. "CASH") fall back to equity_us with low coverage —
 * the engine handles them as missing-observation.
 */
function withAssetClass(
  raw: Array<{ symbol: string; weight: number; asset_class?: AssetClass; sector?: string }>,
  data: DataJson,
): Position[] {
  const lookup = new Map<string, AssetClass>();
  for (const r of data.markets_now.equities_us ?? []) lookup.set(r.symbol, "equity_us");
  for (const r of data.markets_now.crypto_top_10 ?? []) lookup.set(r.symbol, "crypto");
  for (const r of data.markets_now.commodities ?? []) lookup.set(r.symbol, "commodity");
  // CASH / GLB / unknown symbols: equity_us default — engine treats missing
  // observations as low coverage and the composite reflects that gracefully.
  return raw.map((p) => ({
    symbol: p.symbol,
    weight: p.weight,
    asset_class: p.asset_class ?? lookup.get(p.symbol) ?? "equity_us",
    sector: p.sector,
  }));
}

// =====================================================================
// React hook — single entry point for all tiles
// =====================================================================

export type RuntimeState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      data: DataJson;
      snapshot: BrowserSnapshot;
      portfolio: BrowserPortfolio;
      pulse: PulseResult;
      portfolioIsFallback: boolean;
    };

/**
 * useRuntime — single hook every tile uses. Fetches data.json, derives the
 * BrowserSnapshot, reads the user's portfolio, and runs computePulse()
 * client-side. The result is the only thing the UI needs.
 */
export function useRuntime(): RuntimeState {
  const [state, setState] = useState<RuntimeState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await fetchDataJson();
        if (cancelled) return;
        const snapshot = toBrowserSnapshot(data);
        const stored = hasStoredPortfolio();
        const portfolio = readPortfolio(data);
        const pulse = computePulse(portfolio, snapshot);
        setState({
          status: "ready",
          data,
          snapshot,
          portfolio,
          pulse,
          portfolioIsFallback: !stored,
        });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setState({ status: "error", message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

function hasStoredPortfolio(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(PORTFOLIO_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.positions) && parsed.positions.length > 0;
  } catch {
    return false;
  }
}

// =====================================================================
// Display helpers
// =====================================================================

/** Map a Pulse band to the CSS class suffix used in the design system. */
export function bandClass(band: string): string {
  switch (band?.toLowerCase()) {
    case "quiet":
      return "q";
    case "light":
      return "l";
    case "active":
      return "a";
    case "strong":
      return "s";
    case "intense":
      return "i";
    default:
      return "q";
  }
}

/** Format a Pulse composite as 0.00 with sign-stable 2 decimals. */
export function fmtPulse(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(2);
}

/** Format a change percentage. Returns "—" when delta is 0 (snapshot not yet captured). */
export function fmtChange(pct: number): string {
  if (!Number.isFinite(pct) || pct === 0) return "—";
  const sign = pct > 0 ? "+" : "−";
  return `${sign}${Math.abs(pct).toFixed(1)}%`;
}

/** True if the change is negative (used to apply the .warn class). */
export function isDown(pct: number): boolean {
  return Number.isFinite(pct) && pct < 0;
}
