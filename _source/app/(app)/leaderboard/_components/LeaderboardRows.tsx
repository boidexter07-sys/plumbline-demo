"use client";

/* =========================================================================
   LeaderboardRows — Phase 2 wired to /data.json leaderboard block.

   data.json ships { as_of, window, metric, top_10 }. Until v1.1 when enough
   users exist to make this meaningful, the snapshot script can populate
   top_10 from the universe templates ranked by composite. For now we render
   whatever the snapshot provides (gracefully empty if absent).
   ========================================================================= */

import { useRuntime } from "@/lib/pulse/runtime";

export function LeaderboardRows() {
  const rt = useRuntime();

  if (rt.status === "loading") {
    return <div className="lb-table" aria-busy="true"><div className="hold-empty-note">Loading leaderboard…</div></div>;
  }
  if (rt.status === "error") {
    return (
      <div className="lb-table">
        <div className="hold-empty-note" role="status">Leaderboard unavailable: {rt.message}</div>
      </div>
    );
  }

  const lb = rt.data.leaderboard;
  const rows = lb?.top_10 ?? [];

  if (rows.length === 0) {
    return (
      <div className="lb-table">
        <div className="hold-empty-note">
          Leaderboard lights up once enough friends have run the snapshot. Until then, the
          Sandbox is the best place to compare hypothetical portfolios side-by-side.
        </div>
      </div>
    );
  }

  return (
    <div className="lb-table">
      <div className="lb-head">
        <span>#</span>
        <span>Sandbox</span>
        <span style={{ textAlign: "right" }}>3M</span>
        <span style={{ textAlign: "right" }}>Sharpe</span>
        <span style={{ textAlign: "right" }}>Pulse</span>
      </div>
      {rows.map((r, i) => (
        <div className="lb-row" key={r.name ?? i}>
          <span className="lb-rank">{r.rank ?? i + 1}</span>
          <span className="lb-name">{r.name ?? `Portfolio ${i + 1}`}</span>
          <span className="lb-ret">{formatNumber(r.ret3m)}</span>
          <span className="lb-sharpe">{formatNumber(r.sharpe, 2)}</span>
          <span className="lb-pulse">{formatPulse(r.pulse, r.band)}</span>
        </div>
      ))}
    </div>
  );
}

function formatNumber(v: unknown, digits = 1): string {
  if (typeof v === "number" && Number.isFinite(v)) return v.toFixed(digits);
  if (typeof v === "string") return v;
  return "—";
}

function formatPulse(pulse: unknown, band?: string): string {
  const score = typeof pulse === "number" ? pulse.toFixed(2) : "—";
  return band ? `${band} · ${score}` : score;
}
