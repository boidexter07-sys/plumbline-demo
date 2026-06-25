// _source/scripts/snapshot/base.ts — Common connector contract for the data-snapshot.
//
// Phase 2 of Plumbline v1.0 — Decision 41 (no Cloudflare). The 6 free sources
// (WDS, FRED, Yahoo, BoC, GDELT, prediction markets + FX) are pulled in the
// GitHub Actions runner via Node 20's native fetch, then written to
// public/data.json.
//
// This is the v1.0-worker/data-sources/base.ts ported — small enough to inline
// rather than carry a separate file.

import type { FactorObservation, FactorId, SourceId } from "../../lib/pulse/types";

export interface FactorResult {
  raw_value: number;
  observation_date: string;
  release_date?: string;
  source: string;
  freshness_seconds: number;
}

export interface Connector {
  readonly sourceId: SourceId;
  readonly description: string;
  fetch(factorParam: string, env: ConnectorEnv): Promise<FactorResult | null>;
  parse(body: unknown, factorParam: string): FactorResult | null;
}

export interface ConnectorEnv {
  FRED_API_KEY?: string;
  fetchImpl?: typeof fetch;
}

/** Cache TTL per source (seconds). Matches spec §3.3. */
export const SOURCE_TTL: Record<SourceId, number> = {
  wds:           86400,
  fred:          14400,
  yahoo:         900,
  boc:           86400,
  gdelt:         900,
  polymarket:    14400,
  kalshi:        14400,
  predictit:     14400,
  exchangerate:  14400,
  eia:           30 * 86400,
  ofac:          30 * 86400,
  alfred:        86400,
};

export function toFactorObservation(result: FactorResult, _factorParam: string): FactorObservation {
  return {
    raw_value: result.raw_value,
    observation_date: result.observation_date,
    release_date: result.release_date,
    source: result.source,
    freshness_seconds: result.freshness_seconds,
  };
}

export async function backoff<T>(
  fn: () => Promise<T | null>,
  options: { maxAttempts?: number; baseMs?: number } = {},
): Promise<T | null> {
  const maxAttempts = options.maxAttempts ?? 4;
  const baseMs = options.baseMs ?? 500;
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await fn();
      if (result !== null) return result;
    } catch (err) {
      lastErr = err;
    }
    const delay = baseMs * Math.pow(2, attempt) * (0.5 + Math.random());
    await new Promise((r) => setTimeout(r, delay));
  }
  return null;
}

export function freshnessSeconds(isoDate: string, now: number = Date.now()): number {
  const t = Date.parse(isoDate);
  if (Number.isNaN(t)) return Infinity;
  return Math.max(0, Math.floor((now - t) / 1000));
}

/** Map FactorId → source param for the snapshot script. */
export const FACTOR_PARAMS: Partial<Record<FactorId, { source: SourceId; param: string }>> = {
  F1:  { source: "yahoo",  param: "ticker" },
  F2:  { source: "yahoo",  param: "ticker" },
  F3:  { source: "yahoo",  param: "ticker" },
  F4:  { source: "yahoo",  param: "ticker" },
  F5:  { source: "boc",    param: "FX_RATES_DAILY" },
  F6_16:{ source: "exchangerate", param: "CAD/USD" },
  F7:  { source: "yahoo",  param: "futures_bucket" },
  F8:  { source: "yahoo",  param: "sector_etf" },
  F13: { source: "wds",    param: "18100004" },
  F14: { source: "wds",    param: "18100001" },
  F15: { source: "yahoo",  param: "GC=F" },
  F17: { source: "eia",    param: "annual_share" },
  F18: { source: "wds",    param: "25100015" },
  F19: { source: "wds",    param: "20100085" },
  F20: { source: "wds",    param: "36100706" },
  F21: { source: "fred",   param: "DFEDTARU" },
  F22: { source: "fred",   param: "T10Y2Y" },
  F23: { source: "wds",    param: "14100292" },
  F24: { source: "wds",    param: "18100205" },
  F25: { source: "wds",    param: "12100011" },
  F26: { source: "fred",   param: "T10YIE" },
  F27: { source: "fred",   param: "BAMLH0A0HYM2" },
  F28: { source: "yahoo",  param: "^VIX" },
  F29: { source: "polymarket", param: "macro_overlay" },
};