import type { Metadata } from "next";
import { StaticGate } from "../_components/StaticGate";
import { SandboxGrid } from "./_components/SandboxGrid";

export const metadata: Metadata = {
  title: "Sandbox — Plumbline",
  description: "Three paper portfolios. Real Pulse, no real money.",
  alternates: { canonical: "/sandbox/" },
};

export default function SandboxPage() {
  return (
    <StaticGate>
      <section className="app-page app-page-wide">
        <header className="app-page-header">
          <div className="eyebrow"><span className="num">05</span> · Sandbox</div>
          <h1 className="app-page-h1">
            My <span className="app-page-h1-em">Sandbox</span>.
          </h1>
          <div className="app-page-accent" aria-hidden="true" />
          <p className="app-page-lede">
            A rehearsal room, not a recommendation engine. Three paper portfolios, real
            Pulse, no real money.
          </p>
        </header>

        <SandboxGrid />

        <p className="locked-disclaimer">
          Plumbline is for observation only. Not investment advice.
        </p>
      </section>
    </StaticGate>
  );
}
