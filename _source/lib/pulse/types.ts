// src/types.ts — Locked v1.0 contract: 29 factors, 5 bands, free-source math.
//
// Sources of truth:
//   - /home/taha/Desktop/Dexter/projects/v1.0/phase-3-atlas-spec-robust.md  (math: 29 factors, intensity norm, native-freq windows, asset-class mask)
//   - /home/taha/Desktop/Dexter/projects/v1.0/phase-2-data-pipeline-spec.md §4–5 (compute order, data.json shape)
//   - Decisions 28-32 (the 5 reversals, Taha-confirmed 2026-06-24)
//
// DO NOT EDIT WEIGHTS WITHOUT Taha sign-off (Decision 16, conditionally unlocked by §3.1 measurement).

// === Asset classes ===
export type AssetClass = "equity_us" | "equity_ca" | "crypto" | "commodity";

// === The 29 effective factors (F6 + F16 netted into one) ===
// IDs match the math spec table.
export type FactorId =
  | "F1" | "F2" | "F3" | "F4"
  | "F5"
  | "F6_16"           // FX net (CAD/USD exposure-scaled) — single factor representing F6+F16
  | "F7" | "F8"
  | "F9" | "F10" | "F11" | "F12"
  | "F13" | "F14" | "F15"
  | "F17"             // oil embargoed % (F16 was nixed — see §2.3)
  | "F18" | "F19" | "F20"
  | "F21" | "F22"
  | "F23" | "F24" | "F25"
  | "F26" | "F27" | "F28"
  | "F29"             // prediction-market overlay
  | "F30";            // news spike

// === Factor metadata ===
export type FactorCategory = "price" | "macro" | "news" | "sentiment";
export type ReferenceClass = "daily_price_252d" | "daily_macro_10y" | "monthly_10y" | "quarterly_10y" | "annual_rank";

export interface FactorMeta {
  id: FactorId;
  name: string;
  category: FactorCategory;
  weight: number;            // v1.0 locked weight (sum = 1.000 across 29 factors)
  polarity: 1 | -1;          // metadata only — does NOT enter composite (per §1 magnitude fix)
  source: SourceId;
  source_param?: string;      // e.g. WDS PID, FRED series_id, Yahoo ticker
  reference: ReferenceClass;  // native-freq baseline window (per §2.1)
  description: string;
}

// === Source identifiers ===
export type SourceId =
  | "wds"           // Statistics Canada Web Data Service
  | "fred"          // FRED — St Louis Fed
  | "yahoo"         // Yahoo Finance unofficial
  | "boc"           // Bank of Canada Valet
  | "gdelt"         // GDELT 2.0
  | "polymarket" | "kalshi" | "predictit"
  | "exchangerate"
  | "eia" | "ofac"
  | "alfred";       // FRED archival — backtest only in v1.0

// === Factor raw value (one observation) ===
export interface FactorObservation {
  raw_value: number;
  observation_date: string;   // ISO 8601
  release_date?: string;      // ISO 8601 — for ALFRED lag (§3.3)
  source: string;             // "wds:18100004", "fred:DFEDTARU", "yahoo:AAPL", etc.
  freshness_seconds: number;
  missing?: boolean;
  stale?: boolean;
}

// === Baseline (per factor, per factor's native-freq window) ===
export interface Baseline {
  mu: number;
  sigma: number;
  window_label: string;       // "252d_rolling", "10y_level", "40q", "annual_rank"
  history: number[];          // raw history — needed for percentile-rank fallback (F17)
}

// === Per-factor computed state (post-normalization) ===
export interface FactorScore {
  factor: FactorId;
  raw_value: number;
  observation_date: string;
  z_score: number;            // signed z against native-freq baseline
  intensity: number;          // tanh(|z|/2), in [0,1)
  weight_base: number;        // v1.0 locked weight
  weight_effective: number;   // post-applicability-mask, post-cluster-cap, post-drop
  category: FactorCategory;
  missing: boolean;
  stale: boolean;
  applicability: number;      // 1.0 live, 0.5 partial, 0.0 masked
  cluster?: ClusterId;
}

// === Clusters (§2.2 — correlated factor groupings for cap) ===
export type ClusterId = "rates" | "inflation" | "credit_vol" | "fx";

export const CLUSTERS: Record<ClusterId, FactorId[]> = {
  rates:       ["F5", "F21", "F22", "F26"],
  inflation:   ["F13", "F14", "F24"],
  credit_vol:  ["F27", "F28", "F3"],
  fx:          ["F6_16"],
};

// === Categories — for §3.4 drop-and-renormalize within lane ===
export const CATEGORIES: Record<FactorCategory, FactorId[]> = {
  price:    ["F1", "F2", "F3", "F4"],
  macro:    [
    "F5", "F6_16", "F7", "F8", "F13", "F14", "F15", "F17",
    "F18", "F19", "F20", "F21", "F22", "F23", "F24", "F25",
    "F26", "F27", "F28",
  ],
  news:     ["F9", "F10", "F11", "F12", "F30"],
  sentiment:["F29"],
};

// === Asset-class applicability (§3.2) ===
// 1.0 = full weight, 0.5 = partial (half-weight), 0.0 = masked
export type ApplicabilityMatrix = Record<AssetClass, Record<FactorId, number>>;

// === Position in a portfolio ===
export interface Position {
  symbol: string;
  weight: number;             // 0-1, sums to 1 across portfolio
  asset_class: AssetClass;
  usd_revenue_exposure?: number;  // 0-1, used for F6+16 exposure scaling
  sector?: string;
  disambiguation_id?: string;     // for GDELT §3.5 guardrails
}

// === Per-holding Pulse result ===
export interface HoldingPulse {
  symbol: string;
  name?: string;
  asset_class: AssetClass;
  sector?: string;
  weight: number;
  pulse: number;              // [0, 1]
  band: BandLabel;
  coverage: number;           // [0, 1] — fraction of weight live at compute time
  low_confidence: boolean;
  factors: Record<FactorId, FactorScore>;
}

// === Portfolio Pulse result ===
export interface PortfolioPulse {
  composite: number;
  band: BandLabel;
  band_percentile: number;
  effective_n_signals: number;
  coverage: number;
  low_confidence: boolean;
  computed_at: string;
  compute_duration_ms: number;
  degraded_factors: FactorId[];
  holdings: HoldingPulse[];
}

// === Band labels ===
export type BandLabel = "Quiet" | "Light" | "Active" | "Strong" | "Intense";

// === Band cutpoints (percentile-locked per §1.C) ===
export interface BandCutpoints {
  quiet_max: number;          // default 0.50
  light_max: number;          // default 0.75
  active_max: number;         // default 0.90
  strong_max: number;         // default 0.98
  intense_max: number;        // 1.00 (top)
}

// === data.json top-level shape (spec §5.2) ===
export interface DataJson {
  meta: {
    schema_version: string;
    computed_at: string;
    data_freshness_seconds: number;
    build_sha?: string;
    pulse_version: string;
    weights_hash: string;
    bands_hash: string;
    low_confidence: boolean;
    degraded_factors: FactorId[];
  };
  pulse_universe: {
    computed_at: string;
    compute_duration_ms: number;
    composite_stats: CompositeStats;
    band_cutpoints: BandCutpoints;
    asset_class_summaries: AssetClassSummary[];
    top_movers: {
      biggest_rises: Array<{ symbol: string; pulse: number; band: BandLabel; change_from_yesterday: number }>;
      biggest_drops: Array<{ symbol: string; pulse: number; band: BandLabel; change_from_yesterday: number }>;
    };
  };
  pulse_portfolio_templates: PulsePortfolioTemplate[];
  markets_now: MarketsNow;
  daily_brief: DailyBrief;
  leaderboard: Leaderboard;
  factor_legend: FactorLegend;
  drift_monitor: DriftMonitorSnapshot;
}

export interface CompositeStats {
  mean: number;
  p50: number;
  p75: number;
  p90: number;
  p98: number;
  min: number;
  max: number;
}

export interface AssetClassSummary {
  asset_class: AssetClass;
  count: number;
  mean_pulse: number;
  band_distribution: Record<BandLabel, number>;
}

export interface PulsePortfolioTemplate {
  id: string;
  name: string;
  computed_at: string;
  composite: number;
  band: BandLabel;
  coverage: number;
  low_confidence: boolean;
  positions: Array<{ symbol: string; weight: number }>;
}

export interface MarketsNow {
  as_of: string;
  equities_us: MarketQuote[];
  crypto_top_10: MarketQuote[];
  commodities: MarketQuote[];
}

export interface MarketQuote {
  symbol: string;
  name?: string;
  last: number;
  change_pct: number;
  change_abs?: number;
  volume?: number;
  market_cap?: number;
  change_pct_24h?: number;
  source: SourceId;
}

export interface DailyBrief {
  date: string;
  computed_at: string;
  headline: string;
  paragraphs: string[];
  signals: Array<{ label: string; factors: FactorId[]; impact: string }>;
  disclaimer: string;
}

export interface Leaderboard {
  as_of: string;
  window: string;
  metric: string;
  top_10: Array<{
    rank: number;
    anonymous_id: string;
    display_name: string;
    pulse: number;
    band: BandLabel;
    risk_adjusted_return: number;
    portfolio_size: number;
  }>;
}

export interface FactorLegend {
  computed_at: string;
  total_factors: number;
  factors: Array<{
    id: FactorId;
    name: string;
    plain_language: string;
    category: FactorCategory;
    weight: number;
    polarity: 1 | -1;
    color_token: string;
    glyph_token: string;
    current_state: {
      universe_mean_z: number;
      active_holdings_above_p75: number;
    };
    source: SourceId;
    applicability: AssetClass[];
  }>;
}

export interface DriftMonitorSnapshot {
  computed_at: string;
  alerts: Array<{
    factor: FactorId;
    severity: "info" | "warn" | "critical";
    condition: string;
    metric: number;
    threshold: number;
  }>;
}

// === Defaults & helpers ===
export const DEFAULT_BAND_CUTPOINTS: BandCutpoints = {
  quiet_max:  0.40,
  light_max:  0.58,
  active_max: 0.71,
  strong_max: 0.85,
  intense_max: 1.00,
};

export const DEFAULT_APPLICABILITY: ApplicabilityMatrix = {
  // From phase-3-atlas-spec-robust.md §3.2 table — crypto applicability matrix.
  // For non-crypto asset classes, default is 1.0 unless noted.
  equity_us: {
    F1: 1, F2: 1, F3: 1, F4: 1,
    F5: 1, F6_16: 1, F7: 1, F8: 1,
    F9: 1, F10: 1, F11: 1, F12: 1,
    F13: 1, F14: 1, F15: 1, F17: 1,
    F18: 1, F19: 1, F20: 1, F21: 1, F22: 1,
    F23: 1, F24: 1, F25: 1, F26: 1, F27: 1, F28: 1,
    F29: 1, F30: 1,
  },
  equity_ca: {
    F1: 1, F2: 1, F3: 1, F4: 1,
    F5: 1, F6_16: 1, F7: 1, F8: 1,
    F9: 1, F10: 1, F11: 1, F12: 1,
    F13: 1, F14: 1, F15: 1, F17: 1,
    F18: 1, F19: 1, F20: 1, F21: 1, F22: 1,
    F23: 1, F24: 1, F25: 1, F26: 1, F27: 1, F28: 1,
    F29: 1, F30: 1,
  },
  crypto: {
    F1: 1, F2: 1, F3: 1, F4: 1,
    F5: 0.5,    // partial — BoC as global-rate proxy, half-weight
    F6_16: 1,   // direct USD strength transmission
    F7: 1,      // commodity bucket (energy/metals)
    F8: 1,      // sector rotation (token sector indices exist)
    F9: 1, F10: 1, F11: 1, F12: 1, F30: 1,
    F13: 0,     // no Canadian CPI transmission to crypto
    F14: 0,     // gas — no transmission
    F15: 1,     // gold — risk-off transmission
    F17: 1,     // oil supply — energy transmission
    F18: 0,     // Canadian renewable — no transmission
    F19: 0,     // Canadian auto sales — no transmission
    F20: 0,     // Canadian GDP/cap — no transmission
    F21: 1, F22: 1,
    F23: 0, F24: 0, F25: 0,    // Canadian domestic labour/housing/trade
    F26: 1, F27: 1, F28: 1,
    F29: 1,
  },
  commodity: {
    F1: 1, F2: 1, F3: 1, F4: 1,
    F5: 1, F6_16: 1, F7: 1, F8: 1,
    F9: 1, F10: 1, F11: 1, F12: 1,
    F13: 1, F14: 1, F15: 1, F17: 1,
    F18: 1, F19: 1, F20: 1, F21: 1, F22: 1,
    F23: 1, F24: 1, F25: 1, F26: 1, F27: 1, F28: 1,
    F29: 1, F30: 1,
  },
};