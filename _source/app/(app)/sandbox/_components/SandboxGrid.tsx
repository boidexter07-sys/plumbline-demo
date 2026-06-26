"use client";

/* =========================================================================
   SandboxGrid — Phase 2 wired to the live Pulse runtime.

   The 3 sample paper portfolios below (Energy tilt, Banks only, Defensive
   cash + gold) each run through computePulse() against the live /data.json
   snapshot. The displayed band + composite score is therefore real, not a
   placeholder — it updates each time the cron refreshes the snapshot.

   Why not full CRUD now: the add/remove/save UI for hypothetical positions
   is Phase 3 scope. The Pulse math, snapshot adapter, and rendering path
   are exercised end-to-end here so Phase 3 only adds the input form.
   ========================================================================= */

import { computePulse } from "@/lib/pulse/pulse";
import { bandClass, fmtPulse, useRuntime } from "@/lib/pulse/runtime";
import type { Position } from "@/lib/pulse/types";

interface PaperPortfolio {
  name: string;
  blurb: string;
  positions: Array<{ symbol: string; weight: number }>;
}

const SAMPLES: PaperPortfolio[] = [
  {
    name: "Energy tilt — 2026",
    blurb: "Energy and pipeline names. Higher beta to crude.",
    positions: [
      { symbol: "ENB", weight: 0.4 },
      { symbol: "CNQ", weight: 0.3 },
      { symbol: "SU",  weight: 0.2 },
      { symbol: "CASH", weight: 0.1 },
    ],
  },
  {
    name: "Banks only — 2026",
    blurb: "The Big Six, equal-weighted. A read on credit.",
    positions: [
      { symbol: "RY",  weight: 0.2 },
      { symbol: "TD",  weight: 0.2 },
      { symbol: "BNS", weight: 0.2 },
      { symbol: "BMO", weight: 0.2 },
      { symbol: "CASH", weight: 0.2 },
    ],
  },
  {
    name: "Defensive cash + gold",
    blurb: "Risk-off rehearsal. Gold 60%, cash 40%.",
    positions: [
      { symbol: "GLD",  weight: 0.6 },
      { symbol: "CASH", weight: 0.4 },
    ],
  },
];

export function SandboxGrid() {
  const rt = useRuntime();

  if (rt.status === "loading") {
    return <div className="sandbox-grid" aria-busy="true"><div className="hold-empty-note">Loading sandbox…</div></div>;
  }
  if (rt.status === "error") {
    return (
      <div className="sandbox-grid">
        <div className="hold-empty-note" role="status">Sandbox unavailable: {rt.message}</div>
      </div>
    );
  }

  const snapshot = rt.snapshot;

  return (
    <div className="sandbox-grid">
      {SAMPLES.map((s) => {
        // Cast positions to Position[] for the engine. Asset class is inferred
        // from the symbol: ENB/CNQ/SU/RY/TD/BNS/BMO are equity_ca; GLD is
        // commodity; CASH is a synthetic placeholder the engine treats as
        // missing-observation (correct behaviour for paper portfolios).
        const positions: Position[] = s.positions.map((p) => ({
          symbol: p.symbol,
          weight: p.weight,
          asset_class: inferAssetClass(p.symbol),
        }));
        const result = computePulse({ positions }, snapshot);
        const composite = result.portfolio.composite;
        const band = result.portfolio.band ?? labelFromCutpoints(composite, snapshot.band_cutpoints);
        return (
          <article className={`sandbox-card sandbox-card--${bandClass(band)}`} key={s.name}>
            <header className="sandbox-card-head">
              <h3>{s.name}</h3>
              <p>{s.blurb}</p>
            </header>
            <ul className="sandbox-rows">
              {s.positions.map((r) => (
                <li key={r.symbol}>
                  <span>{r.symbol}</span>
                  <span className="sandbox-pct">{`${(r.weight * 100).toFixed(0)}%`}</span>
                </li>
              ))}
            </ul>
            <footer className="sandbox-card-foot">
              <span className={`sandbox-pulse sandbox-pulse--${bandClass(band)}`}>
                {band} · {fmtPulse(composite)}
              </span>
              <span className="sandbox-compute" title="Computed client-side against the live snapshot">
                {result.compute_duration_ms}ms
              </span>
            </footer>
          </article>
        );
      })}
    </div>
  );
}

function inferAssetClass(symbol: string): Position["asset_class"] {
  if (["CASH", "GLB"].includes(symbol)) return "equity_us"; // synthetic placeholder
  if (["BTC-USD", "ETH-USD", "SOL-USD"].includes(symbol)) return "crypto";
  if (["GLD", "GC=F", "SI=F", "CL=F", "WTI"].includes(symbol)) return "commodity";
  if (["RY", "TD", "BNS", "BMO", "ENB", "CNQ", "SU", "SHOP"].includes(symbol)) return "equity_ca";
  return "equity_us";
}

function labelFromCutpoints(
  c: number,
  cp: { quiet_max: number; light_max: number; active_max: number; strong_max: number; intense_max: number },
): "Quiet" | "Light" | "Active" | "Strong" | "Intense" {
  if (c <= cp.quiet_max) return "Quiet";
  if (c <= cp.light_max) return "Light";
  if (c <= cp.active_max) return "Active";
  if (c <= cp.strong_max) return "Strong";
  return "Intense";
}
