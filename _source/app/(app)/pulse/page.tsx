export const metadata = { title: "Pulse — Plumbline" };

export default function PulsePage() {
  return (
    <section style={{ padding: "40px 20px", maxWidth: 720, margin: "0 auto" }}>
      <div className="eyebrow"><span className="num">02</span> · Phase 2 placeholder</div>
      <h1>Pulse</h1>
      <p className="lede">
        The full Pulse screen ships in Phase 2 with the v1.0 model integration: conic-gradient pulse ring, 27/29 coverage chip, N_eff display, 29-factor ranked table, asset-class applicability mask, and the 5-band display. The 29-factor legend (PulseLegend) is static and live on this page in Phase 2.
      </p>
      <div className="locked-disclaimer">
        Plumbline is for observation only. Not investment advice. Pulse is a measure of market conditions, not a recommendation. Plumbline cannot be held liable for any investment outcome resulting from information surfaced by the service.
      </div>
    </section>
  );
}
