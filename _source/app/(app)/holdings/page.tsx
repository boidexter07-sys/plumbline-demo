export const metadata = { title: "Holdings — Plumbline" };

export default function HoldingsPage() {
  return (
    <section style={{ padding: "40px 20px", maxWidth: 720, margin: "0 auto" }}>
      <div className="eyebrow"><span className="num">01</span> · Phase 3 placeholder</div>
      <h1>My Holdings</h1>
      <p className="lede">
        The tile-level card on the dashboard is the Phase 1 view. The full Holdings screen — a 6-position table with ticker, name, qty, cost basis, current value, day, total, Pulse band, plus a book-value / today / composite summary — ships in Phase 3 with the v1.0 data layer.
      </p>
      <div className="locked-disclaimer">
        Plumbline is for observation only. Not investment advice. Pulse is a measure of market conditions, not a recommendation. Plumbline cannot be held liable for any investment outcome resulting from information surfaced by the service.
      </div>
    </section>
  );
}
