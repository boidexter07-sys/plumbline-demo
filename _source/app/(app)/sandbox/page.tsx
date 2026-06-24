export const metadata = { title: "My Sandbox — Plumbline" };

export default function SandboxPage() {
  return (
    <section style={{ padding: "40px 20px", maxWidth: 720, margin: "0 auto" }}>
      <div className="eyebrow"><span className="num">05</span> · Phase 3 placeholder</div>
      <h1>My Sandbox</h1>
      <p className="lede">
        The Sandbox is the most important tool in Plumbline. Three paper portfolios in a 3-column grid, each showing the &ldquo;what if&rdquo; hypothesis, the paper value, and the composite Pulse. The full Sandbox detail screen with transaction history ships in Phase 3.
      </p>
      <div className="locked-disclaimer">
        Plumbline is for observation only. Not investment advice. Pulse is a measure of market conditions, not a recommendation. Plumbline cannot be held liable for any investment outcome resulting from information surfaced by the service.
      </div>
    </section>
  );
}
