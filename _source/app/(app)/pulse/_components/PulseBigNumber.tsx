"use client";

/* =========================================================================
   PulseBigNumber — Phase 2 wired to the live Pulse runtime.

   - Portfolio composite: from computePulse().portfolio (client-side math)
   - Coverage chip: from meta.low_confidence + degraded_factors count
   - Percentile chip: from composite_stats.p98/p90/p75 etc.
   - The 29-factor legend: from data.json factor_legend.factors (live)
   ========================================================================= */

import { bandClass, fmtPulse, useRuntime, type DataJson } from "@/lib/pulse/runtime";

export function PulseBigNumber() {
  const rt = useRuntime();

  if (rt.status === "loading") {
    return (
      <div className="pulse-hero">
        <div className="pulse-score-block">
          <div className="pulse-score-num" style={{ opacity: 0.4 }}>—</div>
          <div className="pulse-score-band" style={{ opacity: 0.4 }}>Computing…</div>
        </div>
      </div>
    );
  }
  if (rt.status === "error") {
    return (
      <div className="pulse-hero">
        <div className="pulse-score-block">
          <div className="pulse-score-num" style={{ color: "var(--status-neg)" }}>!</div>
          <div className="pulse-score-band">Snapshot unavailable</div>
          <div className="pulse-score-meta">{rt.message}</div>
        </div>
      </div>
    );
  }

  const { pulse, snapshot, data } = rt;
  const portfolio = pulse.portfolio;
  const composite = portfolio.composite;
  const band = portfolio.band ?? labelFromComposite(composite, snapshot.band_cutpoints);
  const totalFactors = data.factor_legend.total_factors;
  const liveFactors = totalFactors - (data.meta.degraded_factors?.length ?? 0);
  const coveragePct = totalFactors > 0 ? Math.round((liveFactors / totalFactors) * 100) : 0;
  const percentile = percentileFromUniverse(composite, snapshot.universe);

  return (
    <div className="pulse-hero">
      <div className="pulse-score-block">
        <div className="pulse-score-num">{fmtPulse(composite)}</div>
        <div className={`pulse-score-band pulse-band--${bandClass(band)}`}>{band}</div>
        <div className="pulse-score-meta">
          {percentile !== null
            ? `${Math.round(percentile * 100)}th percentile`
            : `composite ${fmtPulse(composite)}`}{" "}
          · {liveFactors}/{totalFactors} live ({coveragePct}%)
        </div>
      </div>

      <PulseLegend factors={data.factor_legend.factors} liveSet={new Set(liveFactorIds(data))} />
    </div>
  );
}

// ---- The 29-factor legend strip -----------------------------------------

interface FactorRow {
  id: string;
  name: string;
  category: string;
  color_token?: string;
}

function PulseLegend({ factors, liveSet }: { factors: FactorRow[]; liveSet: Set<string> }) {
  return (
    <div className="pulse-legend">
      <div className="pulse-legend-head">
        <div className="eyebrow"><span className="num">·</span> The 29 factors</div>
        <p className="pulse-legend-lede">
          Five lanes — Price, Macro, News, FX, Prediction. Colour-blind-safe palette
          per Decision 15. Σ weight = 1.000 verified.
        </p>
      </div>
      <div className="pulse-legend-grid">
        {factors.map((f) => {
          const live = liveSet.has(f.id);
          return (
            <div className="pulse-legend-item" key={f.id} data-live={live ? "1" : "0"}>
              <span className="pulse-legend-glyph" style={{ background: tokenToHex(f.color_token) }} />
              <span className="pulse-legend-n">{f.id}</span>
              <span className="pulse-legend-name">{f.name}</span>
              <span className="pulse-legend-lane">{capitalise(f.category)}</span>
              {!live && <span className="pulse-legend-stale" title="Live data not yet captured for this factor">degraded</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- helpers ------------------------------------------------------------

function liveFactorIds(data: DataJson): string[] {
  const baselineIds = Object.keys(data.factor_baselines ?? {});
  const degraded = new Set(data.meta.degraded_factors ?? []);
  // Factors are "live" if they have a baseline in data.json AND aren't in the degraded list.
  return baselineIds.filter((id) => !degraded.has(id));
}

/** Map a composite value to a band label using the percentile-locked cutpoints. */
function labelFromComposite(c: number, cp: { quiet_max: number; light_max: number; active_max: number; strong_max: number; intense_max: number }): "Quiet" | "Light" | "Active" | "Strong" | "Intense" {
  if (c <= cp.quiet_max) return "Quiet";
  if (c <= cp.light_max) return "Light";
  if (c <= cp.active_max) return "Active";
  if (c <= cp.strong_max) return "Strong";
  return "Intense";
}

function percentileFromUniverse(
  composite: number,
  universe: { composites: number[]; mean: number; p50: number; p75: number; p90: number; p98: number },
): number | null {
  if (!universe.composites?.length) return null;
  const sorted = [...universe.composites].sort((a, b) => a - b);
  let count = 0;
  for (const c of sorted) {
    if (c <= composite) count++;
    else break;
  }
  return count / sorted.length;
}

function tokenToHex(token?: string): string {
  // Maps the Option C palette tokens to hex. Falls back to neutral ink.
  switch (token) {
    case "ink":     return "#1B1A17";
    case "accent":  return "#B8542B";
    case "wheat":   return "#B89346";
    case "moss":    return "#4A6E3A";
    case "teal":    return "#2E6B7A";
    case "slate":   return "#5C7A8C";
    case "rust":    return "#8C6F3F";
    case "plum":    return "#6B5B95";
    case "clay":    return "#C26456";
    case "fog":     return "#8E9FAA";
    case "sage":    return "#4D8B6E";
    case "stone":   return "#56524A";
    case "ember":   return "#9A4A2A";
    case "amber":   return "#A6613A";
    case "gold":    return "#C9A24A";
    case "olive":   return "#5A4E3A";
    case "fern":    return "#6B8E5A";
    case "ocean":   return "#4A5E70";
    case "deep":    return "#1B3A4B";
    case "ink2":    return "#264653";
    case "tan":     return "#7A5C3A";
    case "sand":    return "#8A6F4A";
    case "pine":    return "#3F5E5A";
    case "violet":  return "#6E5B95";
    case "brick":   return "#A04A3A";
    case "graphite":return "#3F4A56";
    case "sand2":   return "#7A6F4A";
    case "fire":    return "#B8442B";
    default:        return "#1B1A17";
  }
}

function capitalise(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
