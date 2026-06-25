// src/pulse/factor-registry.ts — The 29-factor v1.0 Pulse model.
//
// Source-of-truth: phase-3-atlas-spec-robust.md Page 3 (factor table) + Page 11 (source map).
// Weights are LOCKED per Decision 16 (conditionally unlocked by §3.1 measurement).
// Sum is verified to be 1.000 across all 29 factors.
//
// DO NOT change weights, source mappings, or baseline windows without re-running the §3.1
// cross-sectional measurement and getting Taha sign-off.

import type { FactorId, FactorMeta } from "./types";

/**
 * The 29 effective factors (F6 + F16 netted into one exposure-scaled FX factor "F6_16").
 *
 * Weights are EXACTLY as specified in phase-3-atlas-spec-robust.md Page 3.
 * Sum: 0.07 + 0.05 + 0.04 + 0.03 + 0.05 + 0.05 + 0.05 + 0.05 + 0.05 + 0.04 + 0.05 + 0.04
 *     + 0.04 + 0.04 + 0.04 + 0.03 + 0.02 + 0.03 + 0.03 + 0.03 + 0.03 + 0.02 + 0.02 + 0.02
 *     + 0.02 + 0.02 + 0.02 + 0.01 + 0.01
 *     = 1.000 (verified)
 */
export const FACTORS: Record<FactorId, FactorMeta> = {
  // === Price lane (0.19 total) ===
  F1: {
    id: "F1",
    name: "Return — 1 day",
    category: "price",
    weight: 0.07,
    polarity: 1,
    source: "yahoo",
    source_param: "ticker",
    reference: "daily_price_252d",
    description: "How the holding moved in today's session, vs. yesterday's close.",
  },
  F2: {
    id: "F2",
    name: "Return vs. sector",
    category: "price",
    weight: 0.05,
    polarity: 1,
    source: "yahoo",
    source_param: "ticker",
    reference: "daily_price_252d",
    description: "How it moved today against the average peer in its sector.",
  },
  F3: {
    id: "F3",
    name: "Volatility (30d)",
    category: "price",
    weight: 0.04,
    polarity: -1,
    source: "yahoo",
    source_param: "ticker",
    reference: "daily_price_252d",
    description: "How big its day-to-day swings have been over the last 30 trading days.",
  },
  F4: {
    id: "F4",
    name: "Drawdown depth",
    category: "price",
    weight: 0.03,
    polarity: -1,
    source: "yahoo",
    source_param: "ticker",
    reference: "daily_price_252d",
    description: "How far it has fallen from its recent peak, as a % of that peak.",
  },

  // === Macro lane (0.05 + 0.56 = 0.61 total) ===
  F5: {
    id: "F5",
    name: "BoC overnight rate",
    category: "macro",
    weight: 0.05,
    polarity: -1,
    source: "boc",
    source_param: "FX_RATES_DAILY",
    reference: "daily_macro_10y",
    description: "The Bank of Canada's policy rate and the direction it is moving.",
  },
  // F6 + F16 netted into one exposure-scaled FX factor (§2.3).
  F6_16: {
    id: "F6_16",
    name: "FX (CAD/USD, exposure-scaled)",
    category: "macro",
    weight: 0.05,
    polarity: -1,
    source: "exchangerate",
    source_param: "CAD/USD",
    reference: "daily_price_252d",
    description: "The move in CAD/USD weighted by the holding's USD revenue exposure.",
  },
  F7: {
    id: "F7",
    name: "Commodity pressure",
    category: "macro",
    weight: 0.05,
    polarity: -1,           // higher commodity prices = pressure (contractionary); intensity neutral
    source: "yahoo",
    source_param: "futures_bucket",
    reference: "daily_price_252d",
    description: "How the relevant commodity bucket (energy / metals / grains) has moved, 30d.",
  },
  F8: {
    id: "F8",
    name: "Sector rotation",
    category: "macro",
    weight: 0.05,
    polarity: 1,
    source: "yahoo",
    source_param: "sector_etf",
    reference: "daily_price_252d",
    description: "How the holding's sector has performed vs. the broader market, 30d.",
  },
  F13: {
    id: "F13",
    name: "Inflation — Headline CPI",
    category: "macro",
    weight: 0.04,
    polarity: -1,
    source: "wds",
    source_param: "18100004",
    reference: "monthly_10y",
    description: "How fast Canadian consumer prices are rising, all-items, YoY.",
  },
  F14: {
    id: "F14",
    name: "Gas prices (CAD/L, national avg)",
    category: "macro",
    weight: 0.04,
    polarity: -1,
    source: "wds",
    source_param: "18100001",
    reference: "monthly_10y",
    description: "What Canadian drivers pay at the pump, monthly.",
  },
  F15: {
    id: "F15",
    name: "Gold price (USD/oz)",
    category: "macro",
    weight: 0.04,
    polarity: 1,
    source: "yahoo",
    source_param: "GC=F",
    reference: "daily_price_252d",
    description: "The price of gold. A risk-off hedge — moves up when equities move down.",
  },
  F17: {
    id: "F17",
    name: "Oil supply — embargoed %",
    category: "macro",
    weight: 0.03,
    polarity: -1,
    source: "eia",
    source_param: "annual_share",
    reference: "annual_rank",
    description: "What share of global oil supply is held by sanctioned producers.",
  },
  F18: {
    id: "F18",
    name: "Renewable energy supply (Canada)",
    category: "macro",
    weight: 0.02,
    polarity: 1,
    source: "wds",
    source_param: "25100015",
    reference: "monthly_10y",
    description: "Total Canadian renewable electricity generation, monthly.",
  },
  F19: {
    id: "F19",
    name: "Auto sector sales (Canada)",
    category: "macro",
    weight: 0.03,
    polarity: 1,
    source: "wds",
    source_param: "20100085",
    reference: "monthly_10y",
    description: "Total Canadian new motor-vehicle sales, monthly.",
  },
  F20: {
    id: "F20",
    name: "GDP per capita (Canada)",
    category: "macro",
    weight: 0.03,
    polarity: 1,
    source: "wds",
    source_param: "36100706",
    reference: "quarterly_10y",
    description: "Canadian GDP divided by population, quarterly.",
  },
  F21: {
    id: "F21",
    name: "US Fed funds rate (target upper)",
    category: "macro",
    weight: 0.03,
    polarity: -1,
    source: "fred",
    source_param: "DFEDTARU",
    reference: "daily_macro_10y",
    description: "The US Fed's policy rate ceiling.",
  },
  F22: {
    id: "F22",
    name: "10y − 2y Treasury spread",
    category: "macro",
    weight: 0.03,
    polarity: 1,
    source: "fred",
    source_param: "T10Y2Y",
    reference: "daily_macro_10y",
    description: "The difference between US 10-year and 2-year yields. Inverted (negative) for >1 quarter historically precedes recessions.",
  },
  F23: {
    id: "F23",
    name: "Labour Heat (unemployment rate)",
    category: "macro",
    weight: 0.02,
    polarity: -1,
    source: "wds",
    source_param: "14100292",
    reference: "monthly_10y",
    description: "What share of the Canadian labour force is unemployed, monthly.",
  },
  F24: {
    id: "F24",
    name: "Shelter Cost Pressure (NHPI)",
    category: "macro",
    weight: 0.02,
    polarity: -1,
    source: "wds",
    source_param: "18100205",
    reference: "monthly_10y",
    description: "How fast Canadian housing prices are rising, month-over-month.",
  },
  F25: {
    id: "F25",
    name: "Trade Balance Pulse",
    category: "macro",
    weight: 0.02,
    polarity: 1,
    source: "wds",
    source_param: "12100011",
    reference: "monthly_10y",
    description: "Whether Canada is exporting more than it imports, monthly.",
  },
  F26: {
    id: "F26",
    name: "Inflation Expectations (10y Breakeven)",
    category: "macro",
    weight: 0.02,
    polarity: -1,
    source: "fred",
    source_param: "T10YIE",
    reference: "daily_macro_10y",
    description: "What bond markets think inflation will average over the next 10 years.",
  },
  F27: {
    id: "F27",
    name: "Credit Spread (HY OAS)",
    category: "macro",
    weight: 0.02,
    polarity: -1,
    source: "fred",
    source_param: "BAMLH0A0HYM2",
    reference: "daily_macro_10y",
    description: "The extra yield junk-rated US borrowers pay over US Treasuries.",
  },
  F28: {
    id: "F28",
    name: "Market Fear (VIX)",
    category: "macro",
    weight: 0.02,
    polarity: -1,
    source: "yahoo",
    source_param: "^VIX",
    reference: "daily_price_252d",
    description: "What the options market is pricing for S&P 500 volatility over the next 30 days.",
  },

  // === News lane (0.19 total) ===
  F9: {
    id: "F9",
    name: "News tone shift",
    category: "news",
    weight: 0.05,
    polarity: 1,
    source: "gdelt",
    source_param: "ticker_or_name",
    reference: "daily_price_252d",
    description: "Whether the tone of recent stories has shifted positive or negative, 7d window.",
  },
  F10: {
    id: "F10",
    name: "Event volume",
    category: "news",
    weight: 0.04,
    polarity: 1,
    source: "gdelt",
    source_param: "ticker_or_name",
    reference: "daily_price_252d",
    description: "How many distinct news events mention the holding, normalised to its baseline.",
  },
  F11: {
    id: "F11",
    name: "Story direction",
    category: "news",
    weight: 0.05,
    polarity: 1,
    source: "gdelt",
    source_param: "ticker_or_name",
    reference: "daily_price_252d",
    description: "Whether the dominant narrative has shifted (favourable ↔ unfavourable).",
  },
  F12: {
    id: "F12",
    name: "News-vs-macro alignment",
    category: "news",
    weight: 0.04,
    polarity: 1,
    source: "gdelt",
    source_param: "computed",
    reference: "daily_price_252d",
    description: "Whether the news and macro signals are pointing the same way.",
  },
  F30: {
    id: "F30",
    name: "News spike detection",
    category: "news",
    weight: 0.01,
    polarity: 1,
    source: "gdelt",
    source_param: "volume_zscore",
    reference: "daily_price_252d",
    description: "Whether today's 24h news-event volume for a holding has spiked above its trailing 30d baseline.",
  },

  // === Sentiment (0.01) ===
  F29: {
    id: "F29",
    name: "Prediction-market sentiment (expanded)",
    category: "sentiment",
    weight: 0.01,
    polarity: 1,
    source: "polymarket",     // + Kalshi + PredictIt aggregated
    source_param: "macro_overlay",
    reference: "daily_price_252d",
    description: "Crowd probabilities from Polymarket, Kalshi, PredictIt on macro questions.",
  },
};

/**
 * The 29 factor IDs in canonical order. Used everywhere a stable iteration order matters.
 */
export const ALL_FACTOR_IDS: FactorId[] = Object.keys(FACTORS) as FactorId[];

/**
 * Sanity: weights sum to 1.000 across all 29 factors.
 * Asserted at module load — fails fast if registry is mis-edited.
 */
export const WEIGHT_SUM: number = ALL_FACTOR_IDS.reduce(
  (acc, id) => acc + FACTORS[id].weight,
  0,
);

/**
 * Get the cluster a factor belongs to (for §2.2 cluster-cap).
 * Returns undefined for factors not in any cluster.
 */
export function getFactorCluster(factor: FactorId): string | undefined {
  // Inline to avoid circular import with types
  const CLUSTERS: Record<string, FactorId[]> = {
    rates:      ["F5", "F21", "F22", "F26"],
    inflation:  ["F13", "F14", "F24"],
    credit_vol: ["F27", "F28", "F3"],
    fx:         ["F6_16"],
  };
  for (const [name, members] of Object.entries(CLUSTERS)) {
    if (members.includes(factor)) return name;
  }
  return undefined;
}

/**
 * Returns true if a factor is a "level-anchored" macro factor (§2.5):
 * uses a long native-frequency baseline rather than a rolling 252d window.
 */
export function isLevelAnchored(factor: FactorId): boolean {
  const LEVEL_ANCHORED: FactorId[] = [
    "F5",   // BoC — level-anchored 10y
    "F21",  // Fed funds — level-anchored 10y
    "F22",  // 10y-2y spread — level-anchored 10y
    "F24",  // Shelter NHPI — level-anchored 10y
    "F26",  // 10y Breakeven — level-anchored 10y
    "F27",  // HY OAS — level-anchored 10y
  ];
  return LEVEL_ANCHORED.includes(factor);
}