export const metadata = { title: "Leaderboard — Plumbline" };

export default function LeaderboardPage() {
  return (
    <section style={{ padding: "40px 20px", maxWidth: 720, margin: "0 auto" }}>
      <div className="eyebrow"><span className="num">06</span> · Phase 4 placeholder</div>
      <h1>Leaderboard</h1>
      <p className="lede">
        The Leaderboard ships in Phase 4 with the public-sandbox opt-in flow. Top 15 of 218 public sandboxes, ranked by risk-adjusted return (Sharpe). 1M / 3M / 6M / 1Y timeframe toggle. The user&apos;s row is highlighted.
      </p>
      <div className="locked-disclaimer">
        Plumbline is for observation only. Not investment advice. Pulse is a measure of market conditions, not a recommendation. Plumbline cannot be held liable for any investment outcome resulting from information surfaced by the service.
      </div>
    </section>
  );
}
