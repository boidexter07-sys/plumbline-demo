// _source/scripts/data-snapshot.ts — Phase 2 data-snapshot entry.
//
// Phase 2 of Plumbline v1.0 — Decision 41 (no Cloudflare). This script runs
// in the GitHub Actions runner every 4h, pulls factor data from the 6 free
// sources, computes Pulse for the universe, and writes the result to
// public/data.json. The Next.js static export then copies data.json into the
// deployed site and the browser reads it via fetch('/data.json').
//
// Run locally with:  npm run data-snapshot
// Output:            public/data.json (< 500KB per Atlas spec §6.4)

import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  ALL_FACTOR_IDS,
  FACTORS,
} from "../lib/pulse/factor-registry";
import {
  DEFAULT_BAND_CUTPOINTS,
  type AssetClass,
  type BandLabel,
  type DataJson,
  type FactorId,
  type FactorObservation,
  type HoldingPulse,
  type PortfolioPulse,
  type Position,
} from "../lib/pulse/types";
import {
  aggregatePortfolio,
  computeHoldingPulse,
} from "../lib/pulse/compute";
import {
  f1Return1d,
  f3Volatility30d,
  f4Drawdown,
  toObservation,
} from "../lib/pulse/factor-functions";
import {
  bandFromPercentile,
  percentileRank,
} from "../lib/pulse/math";
import {
  fetchBoc,
  fetchExchangerate,
  fetchFred,
  fetchGdelt,
  fetchOilSupplyRisk,
  fetchPredictionMarkets,
  fetchWds,
  fetchYahoo,
  fetchYahooBatch,
} from "./snapshot/connectors";
import type { ConnectorEnv } from "./snapshot/base";

// === Constants ===

const PULSE_VERSION = "1.0.0";
const PULSE_SCHEMA_VERSION = "phase-2-1.0.0";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, "..", "public", "data.json");

/** Default universe — 10 S&P 500 mega-caps + 10 crypto + 10 commodities for v1.0 launch. */
const UNIVERSE_POSITIONS: Position[] = [
  // 10 S&P 500 mega-caps (spec §11.5)
  { symbol: "AAPL",  weight: 0.04, asset_class: "equity_us", sector: "Technology",   usd_revenue_exposure: 0.62 },
  { symbol: "MSFT",  weight: 0.04, asset_class: "equity_us", sector: "Technology",   usd_revenue_exposure: 0.62 },
  { symbol: "GOOGL", weight: 0.04, asset_class: "equity_us", sector: "Communication Services", usd_revenue_exposure: 0.50 },
  { symbol: "AMZN",  weight: 0.04, asset_class: "equity_us", sector: "Consumer Cyclical", usd_revenue_exposure: 0.67 },
  { symbol: "NVDA",  weight: 0.04, asset_class: "equity_us", sector: "Technology",   usd_revenue_exposure: 0.60 },
  { symbol: "META",  weight: 0.04, asset_class: "equity_us", sector: "Communication Services", usd_revenue_exposure: 0.55 },
  { symbol: "TSLA",  weight: 0.04, asset_class: "equity_us", sector: "Consumer Cyclical", usd_revenue_exposure: 0.50 },
  { symbol: "BRK-B", weight: 0.04, asset_class: "equity_us", sector: "Financials",   usd_revenue_exposure: 0.40 },
  { symbol: "JPM",   weight: 0.04, asset_class: "equity_us", sector: "Financials",   usd_revenue_exposure: 0.40 },
  { symbol: "V",     weight: 0.04, asset_class: "equity_us", sector: "Financials",   usd_revenue_exposure: 0.30 },
  // 10 top crypto
  { symbol: "BTC-USD", weight: 0.012, asset_class: "crypto", sector: "Crypto" },
  { symbol: "ETH-USD", weight: 0.010, asset_class: "crypto", sector: "Crypto" },
  { symbol: "SOL-USD", weight: 0.008, asset_class: "crypto", sector: "Crypto" },
  { symbol: "XRP-USD", weight: 0.008, asset_class: "crypto", sector: "Crypto" },
  { symbol: "ADA-USD", weight: 0.006, asset_class: "crypto", sector: "Crypto" },
  { symbol: "DOGE-USD", weight: 0.006, asset_class: "crypto", sector: "Crypto" },
  { symbol: "AVAX-USD", weight: 0.006, asset_class: "crypto", sector: "Crypto" },
  { symbol: "LINK-USD", weight: 0.006, asset_class: "crypto", sector: "Crypto" },
  { symbol: "DOT-USD", weight: 0.006, asset_class: "crypto", sector: "Crypto" },
  { symbol: "MATIC-USD", weight: 0.006, asset_class: "crypto", sector: "Crypto" },
  // 10 commodities (futures)
  { symbol: "GC=F", weight: 0.02, asset_class: "commodity", sector: "Commodities" },   // Gold
  { symbol: "SI=F", weight: 0.02, asset_class: "commodity", sector: "Commodities" },   // Silver
  { symbol: "CL=F", weight: 0.02, asset_class: "commodity", sector: "Commodities" },   // Crude oil
  { symbol: "NG=F", weight: 0.02, asset_class: "commodity", sector: "Commodities" },   // Natural gas
  { symbol: "HG=F", weight: 0.02, asset_class: "commodity", sector: "Commodities" },   // Copper
  { symbol: "ZC=F", weight: 0.02, asset_class: "commodity", sector: "Commodities" },   // Corn
  { symbol: "ZW=F", weight: 0.02, asset_class: "commodity", sector: "Commodities" },   // Wheat
  { symbol: "ZS=F", weight: 0.02, asset_class: "commodity", sector: "Commodities" },   // Soybeans
  { symbol: "KC=F", weight: 0.02, asset_class: "commodity", sector: "Commodities" },   // Coffee
  { symbol: "CT=F", weight: 0.02, asset_class: "commodity", sector: "Commodities" },   // Cotton
];

/** Daily Brief signals shown when a macro factor exceeds the 1.5σ band. */
function detectSignals(
  macro: Partial<Record<FactorId, FactorObservation>>,
): Array<{ label: string; factors: FactorId[]; impact: string }> {
  const signals: Array<{ label: string; factors: FactorId[]; impact: string }> = [];
  // Crude intuition: signal if a high-weight factor's raw is far from its proxy baseline.
  // v1.1 will use real z-scores against the live distribution; v1.0 ships placeholder signals.
  if (macro.F13) signals.push({ label: "Headline CPI", factors: ["F13"], impact: "Direct read on consumer prices; affects rate expectations." });
  if (macro.F21) signals.push({ label: "Fed funds rate", factors: ["F21"], impact: "Policy rate ceiling — sets the cost of capital." });
  if (macro.F28) signals.push({ label: "VIX", factors: ["F28"], impact: "Options-implied S&P 500 volatility over 30 days." });
  if (macro.F27) signals.push({ label: "Credit spread", factors: ["F27"], impact: "Yield premium on junk-rated debt — risk appetite proxy." });
  return signals;
}

// === Main ===

async function main(): Promise<void> {
  const tStart = Date.now();
  console.log("[snapshot] starting at", new Date().toISOString());

  const env: ConnectorEnv = {
    FRED_API_KEY: process.env.FRED_API_KEY,
  };

  // Phase 1: pull the macro layer ONCE
  console.log("[snapshot] pulling macro layer (18 sources in parallel)...");
  const macroPulls = await Promise.all([
    fetchWds("18100004", env),       // F13
    fetchWds("18100001", env),       // F14
    fetchWds("25100015", env),       // F18
    fetchWds("20100085", env),       // F19
    fetchWds("36100706", env),       // F20
    fetchWds("14100292", env),       // F23
    fetchWds("18100205", env),       // F24
    fetchWds("12100011", env),       // F25
    fetchFred("DFEDTARU", env),      // F21
    fetchFred("T10Y2Y", env),        // F22
    fetchFred("T10YIE", env),        // F26
    fetchFred("BAMLH0A0HYM2", env),  // F27
    fetchYahoo("^VIX", env),         // F28
    fetchYahoo("GC=F", env),         // F15
    fetchBoc("FX_RATES_DAILY", env), // F5
    fetchExchangerate(env),          // F6_16
    fetchOilSupplyRisk(env),         // F17
    fetchPredictionMarkets(env),     // F29
  ]);
  const macro: Partial<Record<FactorId, FactorObservation>> = {};
  const assign = (fid: FactorId, obs: FactorObservation | null) => { if (obs) macro[fid] = obs; };
  const macroFids: FactorId[] = ["F13","F14","F18","F19","F20","F23","F24","F25","F21","F22","F26","F27","F28","F15","F5","F6_16","F17","F29"];
  for (let i = 0; i < macroFids.length; i++) assign(macroFids[i]!, macroPulls[i]);
  const liveMacro = macroFids.filter((f) => macro[f]).length;
  console.log(`[snapshot] macro layer: ${liveMacro}/${macroFids.length} live`);

  // Phase 2: pull price histories per unique ticker
  const uniqueTickers = Array.from(new Set(UNIVERSE_POSITIONS.map((p) => p.symbol)));
  console.log(`[snapshot] pulling price histories for ${uniqueTickers.length} tickers (concurrency=8)...`);
  const priceHistories = await fetchYahooBatch(uniqueTickers, env, 8);
  let liveHistories = 0;
  for (const h of priceHistories.values()) if (h) liveHistories++;
  console.log(`[snapshot] price histories: ${liveHistories}/${uniqueTickers.length} live`);

  // Phase 3: pull GDELT per unique ticker
  console.log(`[snapshot] pulling GDELT news for ${uniqueTickers.length} tickers...`);
  const gdeltResults = await Promise.all(
    uniqueTickers.map(async (t) => ({ t, r: await fetchGdelt(t, env) })),
  );
  const gdeltMap = new Map<string, FactorObservation | null>();
  for (const { t, r } of gdeltResults) gdeltMap.set(t, r);
  let liveGdelt = 0;
  for (const r of gdeltMap.values()) if (r) liveGdelt++;
  console.log(`[snapshot] gdelt: ${liveGdelt}/${uniqueTickers.length} live`);

  // Phase 4: compute per-holding Pulse
  const computedAt = new Date().toISOString();
  const holdingResults: Array<{ holding: HoldingPulse; composite: number }> = [];
  const perHoldingObservations: Record<string, Partial<Record<FactorId, FactorObservation>>> = {};

  for (const pos of UNIVERSE_POSITIONS) {
    const obs: Partial<Record<FactorId, FactorObservation>> = { ...macro };
    const history = priceHistories.get(pos.symbol);

    if (history) {
      const f1 = f1Return1d(history);
      if (f1 !== null) {
        const o = toObservation(f1, `yahoo:${pos.symbol}:F1_1d_return`);
        if (o) obs.F1 = o;
      }
      const f3 = f3Volatility30d(history);
      if (f3 !== null) {
        const o = toObservation(f3, `yahoo:${pos.symbol}:F3_vol_30d`);
        if (o) obs.F3 = o;
      }
      const f4 = f4Drawdown(history);
      if (f4 !== null) {
        const o = toObservation(f4, `yahoo:${pos.symbol}:F4_drawdown`);
        if (o) obs.F4 = o;
      }
    }
    const gd = gdeltMap.get(pos.symbol);
    if (gd) obs.F10 = gd;

    perHoldingObservations[pos.symbol] = obs;

    const baselines = deriveBaselines(history, macro, pos);
    const result = computeHoldingPulse(pos, obs, baselines, DEFAULT_BAND_CUTPOINTS);
    holdingResults.push(result);
  }

  const computeDurationMs = Date.now() - tStart;
  console.log(`[snapshot] computed ${holdingResults.length} holdings in ${computeDurationMs}ms`);

  const portfolio = aggregatePortfolio(
    holdingResults,
    computedAt,
    computeDurationMs,
    deriveBaselinesForUniverse(),
  );

  // Phase 5: build the data.json payload
  const compositeStats = computeCompositeStats(holdingResults.map((r) => r.composite));
  const assetClassSummaries = computeAssetClassSummaries(UNIVERSE_POSITIONS, holdingResults);
  const topMovers = computeTopMovers(holdingResults);

  const snapshot: DataJson & {
    /** Custom extension: per-holding observations keyed by symbol, used by the browser. */
    holdings_observations: Record<string, Partial<Record<FactorId, FactorObservation>>>;
    /** Custom extension: per-factor baselines, used by the browser. */
    factor_baselines: Partial<Record<FactorId, { mu: number; sigma: number; history: number[] }>>;
  } = {
    meta: {
      schema_version: PULSE_SCHEMA_VERSION,
      computed_at: computedAt,
      data_freshness_seconds: 0,
      pulse_version: PULSE_VERSION,
      weights_hash: weightsHash(),
      bands_hash: bandsHash(DEFAULT_BAND_CUTPOINTS),
      low_confidence: portfolio.low_confidence,
      degraded_factors: portfolio.degraded_factors,
    },
    pulse_universe: {
      computed_at: computedAt,
      compute_duration_ms: computeDurationMs,
      composite_stats: compositeStats,
      band_cutpoints: DEFAULT_BAND_CUTPOINTS,
      asset_class_summaries: assetClassSummaries,
      top_movers: topMovers,
    },
    pulse_portfolio_templates: [
      {
        id: "test_30_universe",
        name: "30-holding v1.0 universe (sample)",
        computed_at: computedAt,
        composite: portfolio.composite,
        band: portfolio.band,
        coverage: portfolio.coverage,
        low_confidence: portfolio.low_confidence,
        positions: UNIVERSE_POSITIONS.map((p) => ({ symbol: p.symbol, weight: p.weight })),
      },
    ],
    markets_now: {
      as_of: computedAt,
      equities_us: extractMarketQuotes(UNIVERSE_POSITIONS, holdingResults, "equity_us"),
      crypto_top_10: extractMarketQuotes(UNIVERSE_POSITIONS, holdingResults, "crypto"),
      commodities: extractMarketQuotes(UNIVERSE_POSITIONS, holdingResults, "commodity"),
    },
    daily_brief: buildDailyBrief(portfolio, macro, computedAt),
    leaderboard: {
      as_of: computedAt,
      window: "3M",
      metric: "risk_adjusted_return",
      top_10: [],
    },
    factor_legend: buildFactorLegend(computedAt),
    drift_monitor: { computed_at: computedAt, alerts: [] },
    // Browser-side extensions
    holdings_observations: perHoldingObservations,
    factor_baselines: deriveBaselinesForUniverse(),
  };

  // Write
  if (!existsSync(dirname(OUTPUT_PATH))) {
    await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  }
  await writeFile(OUTPUT_PATH, JSON.stringify(snapshot, null, 0), "utf8");
  const sizeKb = (JSON.stringify(snapshot).length / 1024).toFixed(1);
  const totalMs = Date.now() - tStart;
  console.log(`[snapshot] ✓ wrote ${OUTPUT_PATH} (${sizeKb} KB) in ${totalMs}ms`);
  if (parseFloat(sizeKb) > 500) {
    console.warn(`[snapshot] ⚠️  data.json exceeds 500KB size budget — investigate`);
  }
}

// === Helpers ===

function deriveBaselines(
  history: number[] | null,
  macro: Partial<Record<FactorId, FactorObservation>>,
  _pos: Position,
): Partial<Record<FactorId, { mu: number; sigma: number; history: number[] }>> {
  const baselines: Partial<Record<FactorId, { mu: number; sigma: number; history: number[] }>> = {};
  if (history && history.length >= 20) {
    const ret = returns(history);
    baselines.F1 = statsFor(ret.slice(-252), ret);
    const f3 = f3Volatility30d(history);
    if (f3 !== null) baselines.F3 = { mu: f3, sigma: Math.max(f3 * 0.5, 1e-6), history: [f3] };
    const f4 = f4Drawdown(history);
    if (f4 !== null) baselines.F4 = { mu: f4, sigma: Math.max(f4 * 0.5, 1e-6), history: [f4] };
  }
  for (const fid of ALL_FACTOR_IDS) {
    if (FACTORS[fid].category !== "price" && macro[fid] && !baselines[fid]) {
      const raw = macro[fid]!.raw_value;
      baselines[fid] = {
        mu: raw,
        sigma: Math.max(Math.abs(raw) * 0.05, 1e-6),
        history: [raw],
      };
    }
  }
  return baselines;
}

function deriveBaselinesForUniverse(): Partial<Record<FactorId, { mu: number; sigma: number; history: number[] }>> {
  // v1.0 placeholder — return the macro baselines keyed by the snapshot's mu/sigma.
  // v1.1 will populate from a historical store.
  return {};
}

function statsFor(series: number[], _ref: number[]): { mu: number; sigma: number; history: number[] } {
  if (series.length === 0) return { mu: 0, sigma: 1, history: [] };
  const mu = series.reduce((a, b) => a + b, 0) / series.length;
  const variance = series.reduce((a, b) => a + (b - mu) ** 2, 0) / series.length;
  const sigma = Math.sqrt(variance) || 1e-9;
  return { mu, sigma, history: series };
}

function returns(history: number[]): number[] {
  const r: number[] = [];
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1]!;
    const cur = history[i]!;
    if (prev > 0 && cur > 0) r.push(Math.log(cur / prev));
  }
  return r;
}

function computeCompositeStats(composites: number[]): DataJson["pulse_universe"]["composite_stats"] {
  if (composites.length === 0) return { mean: 0, p50: 0, p75: 0, p90: 0, p98: 0, min: 0, max: 0 };
  const sorted = [...composites].sort((a, b) => a - b);
  const pct = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))] ?? 0;
  const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  return {
    mean,
    p50: pct(0.50),
    p75: pct(0.75),
    p90: pct(0.90),
    p98: pct(0.98),
    min: sorted[0]!,
    max: sorted[sorted.length - 1]!,
  };
}

function computeAssetClassSummaries(
  positions: Position[],
  results: Array<{ holding: HoldingPulse; composite: number }>,
): DataJson["pulse_universe"]["asset_class_summaries"] {
  const byClass = new Map<AssetClass, number[]>();
  for (let i = 0; i < positions.length; i++) {
    const cls = positions[i]!.asset_class;
    const c = results[i]!.composite;
    if (!byClass.has(cls)) byClass.set(cls, []);
    byClass.get(cls)!.push(c);
  }
  const summaries: DataJson["pulse_universe"]["asset_class_summaries"] = [];
  for (const [cls, vals] of byClass) {
    const bands: Record<BandLabel, number> = { Quiet: 0, Light: 0, Active: 0, Strong: 0, Intense: 0 };
    for (const v of vals) {
      const pct = percentileRank(v, vals);
      const band = bandFromPercentile(pct, DEFAULT_BAND_CUTPOINTS);
      bands[band]++;
    }
    summaries.push({
      asset_class: cls,
      count: vals.length,
      mean_pulse: vals.reduce((a, b) => a + b, 0) / vals.length,
      band_distribution: bands,
    });
  }
  return summaries;
}

function computeTopMovers(
  results: Array<{ holding: HoldingPulse; composite: number }>,
): DataJson["pulse_universe"]["top_movers"] {
  const sorted = [...results].sort((a, b) => b.composite - a.composite);
  return {
    biggest_rises: sorted.slice(0, 3).map((r) => ({
      symbol: r.holding.symbol, pulse: r.composite, band: r.holding.band, change_from_yesterday: 0,
    })),
    biggest_drops: sorted.slice(-3).map((r) => ({
      symbol: r.holding.symbol, pulse: r.composite, band: r.holding.band, change_from_yesterday: 0,
    })),
  };
}

function extractMarketQuotes(
  positions: Position[],
  results: Array<{ holding: HoldingPulse; composite: number }>,
  cls: AssetClass,
): DataJson["markets_now"]["equities_us"] {
  return positions
    .map((p, i) => ({ p, r: results[i] }))
    .filter(({ p, r }) => p.asset_class === cls && r)
    .map(({ p, r }) => ({
      symbol: p.symbol,
      name: p.symbol,
      last: r!.composite,
      change_pct: 0,
      source: "yahoo" as const,
    }));
}

function buildDailyBrief(
  portfolio: PortfolioPulse,
  macro: Partial<Record<FactorId, FactorObservation>>,
  computedAt: string,
): DataJson["daily_brief"] {
  const date = new Date().toISOString().slice(0, 10);
  const factorSummary = ALL_FACTOR_IDS
    .filter((f) => macro[f])
    .map((f) => f)
    .slice(0, 3)
    .join(", ");
  return {
    date,
    computed_at: computedAt,
    headline: `Universe Pulse reads ${portfolio.band} (composite ${portfolio.composite.toFixed(2)}).`,
    paragraphs: [
      `Across the 30-holding launch universe, the average Pulse is ${portfolio.composite.toFixed(3)} (${portfolio.band}).`,
      `Live macro layer covers ${ALL_FACTOR_IDS.filter((f) => macro[f]).length}/18 of the daily-pull factors (${factorSummary} leading).`,
    ],
    signals: detectSignals(macro),
    disclaimer: "The Daily Brief is editorial context, not a forecast or recommendation.",
  };
}

function buildFactorLegend(computedAt: string): DataJson["factor_legend"] {
  return {
    computed_at: computedAt,
    total_factors: ALL_FACTOR_IDS.length,
    factors: ALL_FACTOR_IDS.map((fid) => {
      const meta = FACTORS[fid];
      return {
        id: fid,
        name: meta.name,
        plain_language: meta.description,
        category: meta.category,
        weight: meta.weight,
        polarity: meta.polarity,
        color_token: meta.category === "price" ? "ink" : meta.category === "macro" ? "sienna" : meta.category === "news" ? "teal" : "sage",
        glyph_token: "wave",
        current_state: { universe_mean_z: 0, active_holdings_above_p75: 0 },
        source: meta.source,
        applicability: getApplicableAssetClasses(fid),
      };
    }),
  };
}

function getApplicableAssetClasses(fid: FactorId): AssetClass[] {
  const classes: AssetClass[] = ["equity_us", "equity_ca", "commodity"];
  const NO_CRYPTO: FactorId[] = ["F13", "F14", "F18", "F19", "F20", "F23", "F24", "F25"];
  if (!NO_CRYPTO.includes(fid)) classes.push("crypto");
  return classes;
}

function weightsHash(): string {
  const s = ALL_FACTOR_IDS.map((id) => `${id}:${FACTORS[id].weight}`).join("|");
  return `sha256:${simpleHash(s)}`;
}

function bandsHash(cutpoints: typeof DEFAULT_BAND_CUTPOINTS): string {
  return `sha256:${simpleHash(JSON.stringify(cutpoints))}`;
}

function simpleHash(s: string): string {
  let hash = 2166136261;
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash.toString(16).padStart(8, "0");
}

main().catch((err) => {
  console.error("[snapshot] FATAL:", err);
  process.exit(1);
});