"use client";

/* =========================================================================
   HoldingsTable — Phase 1 placeholder. Renders the editorial table
   header (TODAY / PULSE columns per the spec) and 4 sample rows so
   the structure is visible. Phase 3 wires the real positions list.
   ========================================================================= */

const SAMPLE_ROWS = [
  { tk: "SHOP", nm: "Shopify · TSX",      chg: "+2.1%", pulse: "Strong",  score: 0.72, bandCls: "s" },
  { tk: "RY",   nm: "Royal Bank · TSX",    chg: "+0.4%", pulse: "Light",   score: 0.34, bandCls: "l" },
  { tk: "ENB",  nm: "Enbridge · TSX",      chg: "−0.6%", pulse: "Active",  score: 0.58, bandCls: "a" },
  { tk: "BTC",  nm: "Bitcoin · 0.18",      chg: "−1.4%", pulse: "Intense", score: 0.86, bandCls: "i" },
];

export function HoldingsTable() {
  return (
    <div className="hold-table">
      <div className="hold-table-head">
        <span>Holding</span>
        <span style={{ textAlign: "right" }}>Today</span>
        <span style={{ textAlign: "right" }}>Pulse</span>
      </div>
      {SAMPLE_ROWS.map((r) => (
        <div className="hold-table-row" key={r.tk}>
          <span className="hold-tk">
            <span className="hold-tk-sym">{r.tk}</span>
            <span className="hold-tk-nm">{r.nm}</span>
          </span>
          <span className={`hold-chg ${r.chg.startsWith("−") ? "warn" : ""}`}>{r.chg}</span>
          <span className="hold-pulse">
            <span className={`hold-band hold-band--${r.bandCls}`}>{r.pulse}</span>
            <span className="hold-score">{r.score.toFixed(2)}</span>
          </span>
        </div>
      ))}
      <div className="hold-empty-note">
        Phase 1 placeholder — Phase 3 wires real positions and cost basis.
      </div>
    </div>
  );
}
