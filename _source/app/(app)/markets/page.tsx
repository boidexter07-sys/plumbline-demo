export const metadata = { title: "Markets Now — Plumbline" };

export default function MarketsPage() {
  return (
    <section style={{ padding: "40px 20px", maxWidth: 720, margin: "0 auto" }}>
      <div className="eyebrow"><span className="num">04</span> · Phase 2 placeholder</div>
      <h1>Markets Now</h1>
      <p className="lede">
        Markets Now ships in Phase 2 with the v1.0 data layer. 12 headlines, each tappable to a position detail page when one of your holdings is tagged. The Holdings-only / Watch-only / All filter is a Phase 3 feature; for now all headlines are public sources.
      </p>
      <div className="locked-disclaimer">
        Plumbline is for observation only. Not investment advice. Pulse is a measure of market conditions, not a recommendation. Plumbline cannot be held liable for any investment outcome resulting from information surfaced by the service.
      </div>
    </section>
  );
}
