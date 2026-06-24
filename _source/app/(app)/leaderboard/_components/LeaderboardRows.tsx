"use client";

/* =========================================================================
   LeaderboardRows — 5 sample rows. Phase 1 placeholder.
   ========================================================================= */

const ROWS = [
  { rank: 1, name: "Energy tilt — 2026",     sharpe: 1.92, ret3m: "+12.4%", pulse: "Strong · 0.78" },
  { rank: 2, name: "Banks only — 2026",      sharpe: 1.71, ret3m: "+9.1%",  pulse: "Active · 0.62" },
  { rank: 3, name: "Defensive cash + gold",  sharpe: 1.48, ret3m: "+4.2%",  pulse: "Light · 0.38"  },
  { rank: 4, name: "Tech tilt — Q1",         sharpe: 1.22, ret3m: "+18.6%", pulse: "Strong · 0.74" },
  { rank: 5, name: "Yield curve play",       sharpe: 1.08, ret3m: "+6.7%",  pulse: "Active · 0.58" },
];

export function LeaderboardRows() {
  return (
    <div className="lb-table">
      <div className="lb-head">
        <span>#</span>
        <span>Sandbox</span>
        <span style={{ textAlign: "right" }}>3M</span>
        <span style={{ textAlign: "right" }}>Sharpe</span>
        <span style={{ textAlign: "right" }}>Pulse</span>
      </div>
      {ROWS.map((r) => (
        <div className="lb-row" key={r.rank}>
          <span className="lb-rank">{r.rank}</span>
          <span className="lb-name">{r.name}</span>
          <span className="lb-ret">{r.ret3m}</span>
          <span className="lb-sharpe">{r.sharpe.toFixed(2)}</span>
          <span className="lb-pulse">{r.pulse}</span>
        </div>
      ))}
    </div>
  );
}
