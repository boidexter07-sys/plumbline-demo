import type { Metadata } from "next";
import { StaticGate } from "../_components/StaticGate";
import { LeaderboardRows } from "./_components/LeaderboardRows";

export const metadata: Metadata = {
  title: "Leaderboard — Plumbline",
  description: "Top Pulse scores. Public sandboxes, risk-adjusted return, 3M default.",
  alternates: { canonical: "/leaderboard/" },
};

export default function LeaderboardPage() {
  return (
    <StaticGate>
      <section className="app-page">
        <header className="app-page-header">
          <div className="eyebrow"><span className="num">06</span> · Leaderboard</div>
          <h1 className="app-page-h1">
            <span className="app-page-h1-em">Leaderboard</span>.
          </h1>
          <div className="app-page-accent" aria-hidden="true" />
          <p className="app-page-lede">
            Top Pulse scores from public sandboxes. Risk-adjusted return, 3-month default
            window.
          </p>
        </header>

        <LeaderboardRows />

        <p className="locked-disclaimer">
          Plumbline is for observation only. Not investment advice.
        </p>
      </section>
    </StaticGate>
  );
}
