export const metadata = { title: "Daily Brief — Plumbline" };

export default function BriefPage() {
  return (
    <section style={{ padding: "40px 20px", maxWidth: 720, margin: "0 auto" }}>
      <div className="eyebrow"><span className="num">03</span> · Phase 4 placeholder</div>
      <h1>Daily Brief</h1>
      <p className="lede">
        The Daily Brief ships in Phase 4 with the Muse copy pipeline. 3–5 stories per morning, curated, each tagged to a holding. The brief copy is generated once per day and lives in the same dark-cream editorial style as the rest of Plumbline.
      </p>
      <div className="locked-disclaimer">
        Plumbline is for observation only. Not investment advice. Pulse is a measure of market conditions, not a recommendation. Plumbline cannot be held liable for any investment outcome resulting from information surfaced by the service.
      </div>
    </section>
  );
}
