// _source/scripts/snapshot/connectors.ts — The 6 free data sources.
//
// Phase 2 of Plumbline v1.0 — Decision 41 (no Cloudflare). These run in the
// GitHub Actions runner (Node 20) every 4h via `npm run data-snapshot`. The
// output is committed as public/data.json and served by GitHub Pages.
//
// Sources ported from v1.0-worker/src/data-sources/ — the math is identical
// and pure HTTP, so the only porting work was stripping the `.ts` import
// extension and replacing the cross-import to factor-registry with a path
// into lib/pulse.

import type { Connector, ConnectorEnv, FactorResult } from "./base";
import { backoff, freshnessSeconds, toFactorObservation } from "./base";
import type { FactorObservation } from "../../lib/pulse/types";

// =====================================================================
// WDS — Statistics Canada (8 PIDs covering the macro lane)
// =====================================================================

const WDS_BASE = "https://www150.statcan.gc.ca/t1/wds/rest";
const WDS_ENDPOINT = `${WDS_BASE}/getDataFromCubePidCoordAndLatestNPeriods`;

const WDS_PID_COORDINATE: Record<string, string> = {
  "18100004": "2.2.0.0.0.0.0.0.0.0",       // F13 CPI
  "18100001": "20.2.0.0.0.0.0.0.0.0",      // F14 Gas
  "25100015": "1.1.1.0.0.0.0.0.0.0",       // F18 Renewable
  "20100085": "1.1.1.1.1.1.0.0.0.0",       // F19 Auto sales
  "36100706": "1.2.1.0.0.0.0.0.0.0",       // F20 GDP/cap
  "14100292": "1.2.1.0.0.0.0.0.0.0",       // F23 Unemployment
  "18100205": "1.2.0.0.0.0.0.0.0.0",       // F24 NHPI
  "12100011": "1.1.1.0.0.0.0.0.0.0",       // F25 Trade (best-guess coord; v1.1 refines)
};

export const wdsConnector: Connector = {
  sourceId: "wds",
  description: "Statistics Canada Web Data Service — 8 verified PIDs for the macro lane.",
  async fetch(pid: string, env: ConnectorEnv): Promise<FactorResult | null> {
    const fetchFn = env.fetchImpl ?? fetch;
    return backoff(async () => {
      const coord = WDS_PID_COORDINATE[pid] ?? "1.1.1.1";
      const body = JSON.stringify([
        { productId: parseInt(pid, 10), coordinate: coord, latestN: 1 },
      ]);
      const res = await fetchFn(WDS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) return null;
      const json = await res.json();
      return wdsConnector.parse(json, pid);
    });
  },
  parse(body: unknown, pid: string): FactorResult | null {
    if (!Array.isArray(body) || body.length === 0) return null;
    const first = body[0] as Record<string, unknown>;
    if (first.status !== "SUCCESS") return null;
    const obj = first.object as Record<string, unknown>;
    if (!obj || typeof obj !== "object") return null;
    const series = obj.vectorDataPoint as Array<Record<string, unknown>>;
    if (!Array.isArray(series) || series.length === 0) return null;
    const latest = series[series.length - 1]!;
    const value = parseFloat(String(latest.value));
    if (!Number.isFinite(value)) return null;
    const refDate = String(latest.refPer ?? "");
    const isoDate = `${refDate}T00:00:00.000Z`;
    return {
      raw_value: value,
      observation_date: isoDate,
      source: `wds:${pid}`,
      freshness_seconds: freshnessSeconds(isoDate),
    };
  },
};

export async function fetchWds(pid: string, env: ConnectorEnv): Promise<FactorObservation | null> {
  const r = await wdsConnector.fetch(pid, env);
  return r ? toFactorObservation(r, pid) : null;
}

// =====================================================================
// FRED — St Louis Fed (4 series: DFEDTARU, T10Y2Y, T10YIE, BAMLH0A0HYM2)
// =====================================================================

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

function buildFredUrl(seriesId: string, apiKey: string, limit = 10): string {
  const params = new URLSearchParams({
    series_id: seriesId, api_key: apiKey, file_type: "json",
    sort_order: "desc", limit: String(limit),
  });
  return `${FRED_BASE}?${params.toString()}`;
}

export const fredConnector: Connector = {
  sourceId: "fred",
  description: "FRED — 4 series: DFEDTARU, T10Y2Y, T10YIE, BAMLH0A0HYM2.",
  async fetch(seriesId: string, env: ConnectorEnv): Promise<FactorResult | null> {
    if (!env.FRED_API_KEY) return null;     // No key: caller marks missing
    const fetchFn = env.fetchImpl ?? fetch;
    return backoff(async () => {
      const res = await fetchFn(buildFredUrl(seriesId, env.FRED_API_KEY!), {
        method: "GET",
        headers: { "Accept": "application/json" },
      });
      if (res.status === 401 || res.status === 429 || !res.ok) return null;
      const json = await res.json();
      return fredConnector.parse(json, seriesId);
    });
  },
  parse(body: unknown, seriesId: string): FactorResult | null {
    const obj = body as Record<string, unknown>;
    const observations = obj.observations as Array<Record<string, unknown>> | undefined;
    if (!Array.isArray(observations) || observations.length === 0) return null;
    let latest: Record<string, unknown> | undefined;
    for (const o of observations) {
      const v = parseFloat(String(o.value));
      if (Number.isFinite(v)) { latest = o; break; }
    }
    if (!latest) return null;
    const value = parseFloat(String(latest.value));
    const date = String(latest.date ?? "");
    if (!date || !Number.isFinite(value)) return null;
    const isoDate = `${date}T00:00:00.000Z`;
    return {
      raw_value: value,
      observation_date: isoDate,
      source: `fred:${seriesId}`,
      freshness_seconds: freshnessSeconds(isoDate),
    };
  },
};

export async function fetchFred(seriesId: string, env: ConnectorEnv): Promise<FactorObservation | null> {
  const r = await fredConnector.fetch(seriesId, env);
  return r ? toFactorObservation(r, seriesId) : null;
}

// =====================================================================
// Yahoo Finance (price tier, VIX, gold futures)
// =====================================================================

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

interface YahooChartResponse {
  chart: {
    result?: Array<{
      meta: { symbol: string; regularMarketPrice: number; previousClose?: number; chartPreviousClose?: number; currency?: string };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{ close?: Array<number | null>; high?: Array<number | null>; low?: Array<number | null>; open?: Array<number | null>; volume?: Array<number | null> }>;
      };
    }>;
    error?: unknown;
  };
}

function buildYahooUrl(ticker: string, range = "1y", interval = "1d"): string {
  const params = new URLSearchParams({ range, interval });
  return `${YAHOO_BASE}/${encodeURIComponent(ticker)}?${params.toString()}`;
}

export const yahooConnector: Connector = {
  sourceId: "yahoo",
  description: "Yahoo Finance — price, sector, VIX, gold futures (GC=F).",
  async fetch(ticker: string, env: ConnectorEnv): Promise<FactorResult | null> {
    const fetchFn = env.fetchImpl ?? fetch;
    return backoff(async () => {
      const res = await fetchFn(buildYahooUrl(ticker), {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "User-Agent": "plumbline-pulse/1.0 (https://plumbline.app)",
        },
      });
      if (res.status === 429 || !res.ok) return null;
      const json = await res.json() as YahooChartResponse;
      return yahooConnector.parse(json, ticker);
    }, { maxAttempts: 3, baseMs: 800 });
  },
  parse(body: unknown, ticker: string): FactorResult | null {
    const chart = (body as YahooChartResponse)?.chart;
    if (!chart?.result?.[0]) return null;
    const result = chart.result[0]!;
    const price = result.meta.regularMarketPrice;
    if (!Number.isFinite(price)) return null;
    const ts = result.timestamp?.[result.timestamp.length - 1];
    const isoDate = ts ? new Date(ts * 1000).toISOString() : new Date().toISOString();
    return {
      raw_value: price,
      observation_date: isoDate,
      source: `yahoo:${ticker}`,
      freshness_seconds: freshnessSeconds(isoDate),
    };
  },
};

export async function fetchYahoo(ticker: string, env: ConnectorEnv): Promise<FactorObservation | null> {
  const r = await yahooConnector.fetch(ticker, env);
  return r ? toFactorObservation(r, ticker) : null;
}

export async function fetchYahooHistory(ticker: string, env: ConnectorEnv): Promise<number[] | null> {
  const fetchFn = env.fetchImpl ?? fetch;
  return backoff(async () => {
    const res = await fetchFn(buildYahooUrl(ticker, "1y", "1d"), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "plumbline-pulse/1.0 (https://plumbline.app)",
      },
    });
    if (!res.ok) return null;
    const json = await res.json() as YahooChartResponse;
    const result = json.chart.result?.[0];
    if (!result?.indicators?.quote?.[0]?.close) return null;
    return result.indicators.quote[0].close.filter((c): c is number => Number.isFinite(c));
  }, { maxAttempts: 3, baseMs: 800 });
}

export async function fetchYahooBatch(
  tickers: string[],
  env: ConnectorEnv,
  concurrency = 8,
): Promise<Map<string, number[] | null>> {
  const results = new Map<string, number[] | null>();
  const queue = [...tickers];
  async function worker() {
    while (queue.length > 0) {
      const t = queue.shift();
      if (!t) return;
      results.set(t, await fetchYahooHistory(t, env));
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, tickers.length) }, worker);
  await Promise.all(workers);
  return results;
}

// =====================================================================
// Bank of Canada Valet (F5 — BoC overnight rate proxy)
// =====================================================================

const BOC_BASE = "https://www.bankofcanada.ca/valet/observations/group/FX_RATES_DAILY/json";
const BOC_FALLBACK_START = "2020-01-01";

interface BocObservation {
  d: string;
  FXUSDCAD?: { v: string };
  FXCADUSD?: { v: string };
}
interface BocResponse { observations?: BocObservation[]; }

export const bocConnector: Connector = {
  sourceId: "boc",
  description: "Bank of Canada Valet — FX_RATES_DAILY group (FXUSDCAD + rate proxy).",
  async fetch(_param: string, env: ConnectorEnv): Promise<FactorResult | null> {
    const fetchFn = env.fetchImpl ?? fetch;
    return backoff(async () => {
      const res = await fetchFn(`${BOC_BASE}?start_date=${BOC_FALLBACK_START}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });
      if (!res.ok) return null;
      const json = await res.json() as BocResponse;
      return bocConnector.parse(json, _param);
    });
  },
  parse(body: unknown, _param: string): FactorResult | null {
    const obs = (body as BocResponse).observations;
    if (!obs || obs.length === 0) return null;
    const latest = obs[obs.length - 1]!;
    const cad = latest.FXCADUSD?.v ?? latest.FXUSDCAD?.v;
    if (!cad) return null;
    const value = parseFloat(cad);
    if (!Number.isFinite(value)) return null;
    const isoDate = `${latest.d}T00:00:00.000Z`;
    return {
      raw_value: value,
      observation_date: isoDate,
      source: `boc:FX_RATES_DAILY`,
      freshness_seconds: freshnessSeconds(isoDate),
    };
  },
};

export async function fetchBoc(_param: string, env: ConnectorEnv): Promise<FactorObservation | null> {
  const r = await bocConnector.fetch(_param, env);
  return r ? toFactorObservation(r, _param) : null;
}

// =====================================================================
// GDELT 2.0 (news lane)
// =====================================================================

const GDELT_BASE = "https://api.gdeltproject.org/api/v2/doc/doc";

const GDELT_DISAMBIGUATION: Record<string, string[]> = {
  apple:   ["aapl", "apple.com", "appleinc"],
  amazon:  ["amzn", "amazon.com"],
  meta:    ["meta", "fb.com", "facebook.com", "metaplatforms"],
  tesla:   ["tsla", "tesla.com", "teslamotors"],
  oracle:  ["orcl", "oracle.com"],
  visa:    ["v", "visa.com"],
  nvidia:  ["nvda", "nvidia.com"],
};

interface GdeltArticle {
  url?: string; title?: string; language?: string;
  seendate?: string; domain?: string; sourceCommonName?: string;
  tone?: number | string;
}
interface GdeltResponse { articles?: GdeltArticle[]; }

function queryFor(tickerOrName: string): string {
  if (/^[A-Z^=\-]+$/.test(tickerOrName)) return tickerOrName;
  return `"${tickerOrName}"`;
}

export const gdeltConnector: Connector = {
  sourceId: "gdelt",
  description: "GDELT 2.0 — news tone, event volume, story direction, spike detection.",
  async fetch(tickerOrName: string, env: ConnectorEnv): Promise<FactorResult | null> {
    const fetchFn = env.fetchImpl ?? fetch;
    return backoff(async () => {
      const url = new URL(GDELT_BASE);
      url.searchParams.set("query", queryFor(tickerOrName));
      url.searchParams.set("mode", "ArtList");
      url.searchParams.set("maxrecords", "250");
      url.searchParams.set("format", "json");
      const res = await fetchFn(url.toString(), {
        method: "GET",
        headers: { "Accept": "application/json" },
      });
      if (!res.ok) return null;
      const json = await res.json();
      return gdeltConnector.parse(json, tickerOrName);
    }, { maxAttempts: 3, baseMs: 1200 });
  },
  parse(body: unknown, tickerOrName: string): FactorResult | null {
    const articles = (body as GdeltResponse).articles;
    if (!Array.isArray(articles)) return null;
    const key = tickerOrName.toLowerCase().split(/[ .\-]/)[0]!;
    const required = GDELT_DISAMBIGUATION[key];
    let qualifyingCount = 0;
    for (const a of articles) {
      if (required) {
        const haystack = `${a.title ?? ""} ${a.domain ?? ""} ${a.sourceCommonName ?? ""} ${a.url ?? ""}`.toLowerCase();
        if (!required.some((r) => haystack.includes(r))) continue;
      }
      qualifyingCount++;
    }
    const now = new Date().toISOString();
    return {
      raw_value: qualifyingCount,
      observation_date: now,
      source: `gdelt:${tickerOrName}`,
      freshness_seconds: freshnessSeconds(now),
    };
  },
};

export async function fetchGdelt(tickerOrName: string, env: ConnectorEnv): Promise<FactorObservation | null> {
  const r = await gdeltConnector.fetch(tickerOrName, env);
  return r ? toFactorObservation(r, tickerOrName) : null;
}

// =====================================================================
// Exchangerate (CAD/USD) — open.er-api.com primary, exchangerate.host fallback, FRED DEXCAUS last
// =====================================================================

const OPEN_ER_API_URL = "https://open.er-api.com/v6/latest/USD";
const EXCHANGERATE_HOST_URL = "https://api.exchangerate.host/latest?base=USD&symbols=CAD";

export const exchangerateConnector: Connector = {
  sourceId: "exchangerate",
  description: "open.er-api.com + exchangerate.host + FRED DEXCAUS — CAD/USD.",
  async fetch(_param: string, env: ConnectorEnv): Promise<FactorResult | null> {
    const fetchFn = env.fetchImpl ?? fetch;
    const r1 = await backoff(async () => {
      const res = await fetchFn(OPEN_ER_API_URL, { headers: { "Accept": "application/json" } });
      if (!res.ok) return null;
      const json = await res.json() as { rates?: { CAD?: number } };
      const v = json.rates?.CAD;
      return Number.isFinite(v) ? { value: v!, source: "open.er-api.com:CAD" } : null;
    }, { maxAttempts: 2 });
    if (r1 !== null) {
      const now = new Date().toISOString();
      return { raw_value: r1.value, observation_date: now, source: r1.source, freshness_seconds: freshnessSeconds(now) };
    }
    const r2 = await backoff(async () => {
      const res = await fetchFn(EXCHANGERATE_HOST_URL, { headers: { "Accept": "application/json" } });
      if (!res.ok) return null;
      const json = await res.json() as { rates?: { CAD?: number } };
      const v = json.rates?.CAD;
      return Number.isFinite(v) ? { value: v!, source: "exchangerate.host:CAD" } : null;
    }, { maxAttempts: 2 });
    if (r2 !== null) {
      const now = new Date().toISOString();
      return { raw_value: r2.value, observation_date: now, source: r2.source, freshness_seconds: freshnessSeconds(now) };
    }
    if (env.FRED_API_KEY) {
      const r3 = await backoff(async () => {
        const res = await fetchFn(
          `https://api.stlouisfed.org/fred/series/observations?series_id=DEXCAUS&api_key=${env.FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`,
          { headers: { "Accept": "application/json" } },
        );
        if (!res.ok) return null;
        const json = await res.json() as { observations?: Array<{ date: string; value: string }> };
        const obs = json.observations?.[0];
        return obs ? parseFloat(obs.value) : null;
      }, { maxAttempts: 2 });
      if (r3 !== null && Number.isFinite(r3)) {
        const now = new Date().toISOString();
        return { raw_value: r3, observation_date: now, source: "fred:DEXCAUS", freshness_seconds: freshnessSeconds(now) };
      }
    }
    return null;
  },
  parse(body: unknown, _param: string): FactorResult | null {
    const obj = body as { rates?: { CAD?: number } };
    const value = obj.rates?.CAD;
    if (!Number.isFinite(value)) return null;
    const now = new Date().toISOString();
    return { raw_value: value!, observation_date: now, source: "exchangerate:CAD", freshness_seconds: freshnessSeconds(now) };
  },
};

export async function fetchExchangerate(env: ConnectorEnv): Promise<FactorObservation | null> {
  const r = await exchangerateConnector.fetch("CAD/USD", env);
  return r ? toFactorObservation(r, "CAD/USD") : null;
}

// =====================================================================
// Prediction markets (Polymarket + Kalshi + PredictIt) — F29
// =====================================================================

const POLYMARKET_URL = "https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=20";
const KALSHI_URL = "https://trading-api.kalshi.com/v2/markets?status=open&limit=50";
const PREDICTIT_URL = "https://www.predictit.org/api/markets";

async function fetchPolyMarkets(fetchFn: typeof fetch): Promise<number[] | null> {
  return backoff(async () => {
    const res = await fetchFn(POLYMARKET_URL, { headers: { "Accept": "application/json" } });
    if (!res.ok) return null;
    const json = await res.json() as Array<{ outcomePrices?: string | string[] }>;
    return json
      .map((m) => {
        if (typeof m.outcomePrices === "string") {
          try {
            const parsed = JSON.parse(m.outcomePrices) as string[];
            const p = parseFloat(parsed[0] ?? "0");
            return Number.isFinite(p) ? p : null;
          } catch { return null; }
        }
        if (Array.isArray(m.outcomePrices)) {
          const p = parseFloat(m.outcomePrices[0] ?? "0");
          return Number.isFinite(p) ? p : null;
        }
        return null;
      })
      .filter((p): p is number => p !== null);
  }, { maxAttempts: 2 });
}

async function fetchKalshiMarkets(fetchFn: typeof fetch): Promise<number[] | null> {
  return backoff(async () => {
    const res = await fetchFn(KALSHI_URL, { headers: { "Accept": "application/json" } });
    if (!res.ok) return null;
    const json = await res.json() as { markets?: Array<{ yes_bid?: number; yes_ask?: number; last_price?: number }> };
    if (!Array.isArray(json.markets)) return null;
    return json.markets.map((m) => {
      const p = m.last_price ?? ((m.yes_bid ?? 0) + (m.yes_ask ?? 0)) / 2;
      return Number.isFinite(p) ? p / 100 : null;
    }).filter((p): p is number => p !== null);
  }, { maxAttempts: 2 });
}

async function fetchPredictItMarkets(fetchFn: typeof fetch): Promise<number[] | null> {
  return backoff(async () => {
    const res = await fetchFn(PREDICTIT_URL, { headers: { "Accept": "application/json" } });
    if (!res.ok) return null;
    const json = await res.json() as { markets?: Array<{ contracts?: Array<{ lastTradePrice?: number }> }> };
    if (!Array.isArray(json.markets)) return null;
    const probs: number[] = [];
    for (const m of json.markets) {
      for (const c of m.contracts ?? []) {
        if (Number.isFinite(c.lastTradePrice)) probs.push(c.lastTradePrice!);
      }
    }
    return probs;
  }, { maxAttempts: 2 });
}

export async function fetchPredictionMarkets(env: ConnectorEnv): Promise<FactorObservation | null> {
  const fetchFn = env.fetchImpl ?? fetch;
  const [poly, kal, pred] = await Promise.all([
    fetchPolyMarkets(fetchFn), fetchKalshiMarkets(fetchFn), fetchPredictItMarkets(fetchFn),
  ]);
  const all = [...(poly ?? []), ...(kal ?? []), ...(pred ?? [])];
  if (all.length === 0) return null;
  let sum = 0, n = 0;
  for (const p of all) {
    if (p >= 0 && p <= 1) { sum += Math.abs(p - 0.5); n++; }
  }
  if (n === 0) return null;
  const raw = sum / n;
  const now = new Date().toISOString();
  return {
    raw_value: raw,
    observation_date: now,
    source: "predmkt:polymarket+kalshi+predictit",
    freshness_seconds: freshnessSeconds(now),
  };
}

// =====================================================================
// EIA + OFAC — F17 oil supply (placeholder until EIA key wired)
// =====================================================================

const PLACEHOLDER_EMBARGOED_SHARE = 0.045;

export async function fetchOilSupplyRisk(_env: ConnectorEnv): Promise<FactorObservation | null> {
  // v1.0 placeholder. Returns the last-known annual embargoed share.
  const now = new Date().toISOString();
  return {
    raw_value: PLACEHOLDER_EMBARGOED_SHARE,
    observation_date: now,
    source: "eia+ofac:annual_share_placeholder",
    freshness_seconds: 0,
  };
}