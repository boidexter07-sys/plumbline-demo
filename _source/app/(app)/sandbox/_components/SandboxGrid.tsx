"use client";

/* =========================================================================
   SandboxGrid — 3 paper portfolios in a 3-column grid. Phase 1.3
   placeholder with sample portfolios; Phase 3 wires real CRUD.
   ========================================================================= */

const SAMPLE = [
  {
    name: "Energy tilt — 2026",
    blurb: "Energy and pipeline names. Higher beta to crude.",
    rows: [
      { tk: "ENB", pct: "40%" },
      { tk: "CNQ", pct: "30%" },
      { tk: "SU",  pct: "20%" },
      { tk: "CASH", pct: "10%" },
    ],
    pulse: "Active · 0.51",
  },
  {
    name: "Banks only — 2026",
    blurb: "The Big Six, equal-weighted. A read on credit.",
    rows: [
      { tk: "RY",  pct: "20%" },
      { tk: "TD",  pct: "20%" },
      { tk: "BNS", pct: "20%" },
      { tk: "BMO", pct: "20%" },
      { tk: "CASH", pct: "20%" },
    ],
    pulse: "Light · 0.36",
  },
  {
    name: "Defensive cash + gold",
    blurb: "Risk-off rehearsal. Gold 60%, cash 40%.",
    rows: [
      { tk: "GLD", pct: "60%" },
      { tk: "CASH", pct: "40%" },
    ],
    pulse: "Quiet · 0.22",
  },
];

export function SandboxGrid() {
  return (
    <div className="sandbox-grid">
      {SAMPLE.map((s) => (
        <article className="sandbox-card" key={s.name}>
          <header className="sandbox-card-head">
            <h3>{s.name}</h3>
            <p>{s.blurb}</p>
          </header>
          <ul className="sandbox-rows">
            {s.rows.map((r) => (
              <li key={r.tk}>
                <span>{r.tk}</span>
                <span className="sandbox-pct">{r.pct}</span>
              </li>
            ))}
          </ul>
          <footer className="sandbox-card-foot">
            <span className="sandbox-pulse">{s.pulse}</span>
          </footer>
        </article>
      ))}
    </div>
  );
}
