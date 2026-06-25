// src/pulse/factor-functions.ts — Derive per-factor raw values from raw inputs.
//
// The 29 factors decompose into three groups based on data shape:
//   1. MACRO factors (F5, F6_16, F7, F8, F13-F15, F17-F28): single value per cron run
//      → pulled directly by the connectors; raw_value flows through.
//   2. PRICE factors (F1, F2, F3, F4): DERIVED from a 252d price history
//      → this file computes returns, sector-relative return, vol, drawdown.
//   3. NEWS factors (F9, F10, F11, F30): DERIVED from a GDELT article list
//      → F10 (event volume) is the connector output; F9/F11/F30 derived downstream.
//
// For v1.0 the price functions are the only "derived" path — everything else passes through.
// Sector rotation (F8) requires a sector ETF (e.g., XLK for tech) — v1.0 uses the holding's
// own sector mapped to a Yahoo Finance sector ETF via a static table.

import type { FactorObservation } from "./types";
import type { Position } from "./types";

/** Inline freshness helper — micro-second math, pure function. */
function freshnessSeconds(isoDate: string, now: number = Date.now()): number {
  const t = Date.parse(isoDate);
  if (Number.isNaN(t)) return Infinity;
  return Math.max(0, Math.floor((now - t) / 1000));
}

/** Per-ticker sector ETF mapping (Yahoo Finance symbols). */
const SECTOR_ETF: Record<string, string> = {
  Technology:   "XLK",
  "Communication Services": "XLC",
  "Consumer Cyclical":     "XLY",
  "Consumer Defensive":    "XLP",
  Healthcare:   "XLV",
  Financials:   "XLF",
  Industrials:  "XLI",
  Energy:      "XLE",
  Utilities:   "XLU",
  "Real Estate": "XLRE",
  "Basic Materials": "XLB",
};

/** Map a Yahoo Finance sector label to one of our sector buckets. */
function sectorBucket(sector: string | undefined): string {
  if (!sector) return "Technology";
  // Yahoo Finance returns sectors like "Technology", "Financial Services", "Healthcare".
  // Normalize to the canonical buckets above.
  const norm = sector.toLowerCase();
  if (norm.includes("tech")) return "Technology";
  if (norm.includes("communication")) return "Communication Services";
  if (norm.includes("consumer cyclical") || norm.includes("consumer discretionary")) return "Consumer Cyclical";
  if (norm.includes("consumer defensive") || norm.includes("consumer staples")) return "Consumer Defensive";
  if (norm.includes("health")) return "Healthcare";
  if (norm.includes("financ")) return "Financials";
  if (norm.includes("industr")) return "Industrials";
  if (norm.includes("energy")) return "Energy";
  if (norm.includes("utilit")) return "Utilities";
  if (norm.includes("real estate") || norm.includes("estate")) return "Real Estate";
  if (norm.includes("basic") || norm.includes("material")) return "Basic Materials";
  return "Technology";
}

export function sectorEtfFor(position: Position): string {
  return SECTOR_ETF[sectorBucket(position.sector)] ?? "XLK";
}

// === Price factor derivations ===

/** F1: Return — 1 day. raw_value = (last - prev_close) / prev_close. */
export function f1Return1d(history: number[]): number | null {
  if (history.length < 2) return null;
  const last = history[history.length - 1]!;
  const prev = history[history.length - 2]!;
  if (prev === 0) return null;
  return (last - prev) / prev;
}

/** F2: Return vs sector. raw_value = holding_return - sector_return over the same window.
 *  Note: this is a DERIVED factor — we need both histories. The caller computes both.
 */
export function f2ReturnVsSector(holdingReturn: number, sectorReturn: number): number | null {
  if (!Number.isFinite(holdingReturn) || !Number.isFinite(sectorReturn)) return null;
  return holdingReturn - sectorReturn;
}

/** F3: Volatility (30d). raw_value = stdev of daily log returns over last 30 trading days. */
export function f3Volatility30d(history: number[]): number | null {
  if (history.length < 31) return null;
  const recent = history.slice(-31);
  const logReturns: number[] = [];
  for (let i = 1; i < recent.length; i++) {
    const prev = recent[i - 1]!;
    const cur = recent[i]!;
    if (prev <= 0 || cur <= 0) continue;
    logReturns.push(Math.log(cur / prev));
  }
  if (logReturns.length < 5) return null;
  const mean = logReturns.reduce((a, b) => a + b, 0) / logReturns.length;
  const variance = logReturns.reduce((a, b) => a + (b - mean) ** 2, 0) / logReturns.length;
  return Math.sqrt(variance);
}

/** F4: Drawdown depth. raw_value = (peak - last) / peak over the 252d window. */
export function f4Drawdown(history: number[]): number | null {
  if (history.length === 0) return null;
  let peak = history[0]!;
  for (const p of history) {
    if (p > peak) peak = p;
  }
  const last = history[history.length - 1]!;
  if (peak === 0) return null;
  return (peak - last) / peak;
}

/** Wrap a raw numeric value as a FactorObservation using "now" as observation_date. */
export function toObservation(raw: number | null, sourceLabel: string): FactorObservation | null {
  if (raw === null || !Number.isFinite(raw)) return null;
  const now = new Date().toISOString();
  return {
    raw_value: raw,
    observation_date: now,
    source: sourceLabel,
    freshness_seconds: freshnessSeconds(now),
  };
}