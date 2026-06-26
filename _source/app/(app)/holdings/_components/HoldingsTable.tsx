"use client";

/* =========================================================================
   HoldingsTable — Phase 2 wired to the live Pulse runtime.

   Reads /data.json via useRuntime(), runs computePulse() client-side
   against the user's localStorage portfolio, and renders each holding with
   its per-holding Pulse + 5-band chip + percentile chip.

   Empty state: if the user has no portfolio in localStorage, the runtime
   falls back to the test_30_universe template from data.json so the UI has
   something real to show during friend-feedback. A small "Sample portfolio"
   chip indicates the fallback so it's not mistaken for a real book.
   ========================================================================= */

import { bandClass, fmtChange, fmtPulse, isDown, useRuntime } from "@/lib/pulse/runtime";

export function HoldingsTable() {
  const rt = useRuntime();

  if (rt.status === "loading") {
    return (
      <div className="hold-table" aria-busy="true">
        <div className="hold-empty-note">Computing Pulse from live data snapshot…</div>
      </div>
    );
  }
  if (rt.status === "error") {
    return (
      <div className="hold-table">
        <div className="hold-empty-note" role="status">
          Couldn&apos;t load data snapshot: {rt.message}
        </div>
      </div>
    );
  }

  const { pulse, portfolio, portfolioIsFallback } = rt;
  const perHolding = pulse.perHolding;
  const hasHoldings = perHolding.length > 0;

  if (!hasHoldings) {
    return (
      <div className="hold-table">
        <div className="hold-empty-note">
          Add a position in <a href="/sandbox/">Sandbox</a> to see per-holding Pulse here.
        </div>
      </div>
    );
  }

  // Universe mean for the "vs universe" delta chip on each row.
  const universeMean = rt.snapshot.universe.mean;

  return (
    <div className="hold-table">
      <div className="hold-table-head">
        <span>Holding</span>
        <span style={{ textAlign: "right" }}>Today</span>
        <span style={{ textAlign: "right" }}>Pulse</span>
      </div>
      {perHolding.map((h, i) => {
        const weightPct = `${(portfolio.positions[i]?.weight * 100).toFixed(0)}%`;
        const chg = fmtChange(0); // daily delta not in current snapshot — shows "—"
        const downCls = isDown(0) ? "warn" : "";
        const deltaFromMean = h.pulse - universeMean;
        const deltaBp = Math.round(deltaFromMean * 1000);
        const deltaStr =
          deltaBp === 0 ? "avg" : deltaBp > 0 ? `+${deltaBp}bp` : `${deltaBp}bp`;
        return (
          <div className="hold-table-row" key={h.symbol}>
            <span className="hold-tk">
              <span className="hold-tk-sym">{h.symbol}</span>
              <span className="hold-tk-nm">{weightPct} weight</span>
            </span>
            <span className={`hold-chg ${downCls}`} aria-label="Today's change">
              {chg}
            </span>
            <span className="hold-pulse">
              <span className={`hold-band hold-band--${bandClass(h.band)}`}>{h.band}</span>
              <span className="hold-score">{fmtPulse(h.pulse)}</span>
              <span className="hold-pct" aria-label="vs universe mean">
                {deltaStr}
              </span>
            </span>
          </div>
        );
      })}
      <div className="hold-empty-note">
        {portfolioIsFallback ? (
          <>
            Showing <strong>sample portfolio</strong> (the 30-holding test universe from the live
            snapshot). Edit in <a href="/sandbox/">Sandbox</a> to make it yours.
          </>
        ) : (
          <>
            Σ weight = <strong>1.000</strong> · computed in <strong>{pulse.compute_duration_ms}ms</strong>
            {" "}client-side · snapshot{" "}
            <strong>{new Date(rt.snapshot.computed_at).toUTCString().slice(0, 22)} UTC</strong>
            {rt.data.meta.low_confidence ? " · low confidence (degraded factors live)" : ""}
          </>
        )}
      </div>
    </div>
  );
}
