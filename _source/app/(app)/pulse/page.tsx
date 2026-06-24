import type { Metadata } from "next";
import { StaticGate } from "../_components/StaticGate";
import { PulseBigNumber } from "./_components/PulseBigNumber";

export const metadata: Metadata = {
  title: "Pulse — Plumbline",
  description: "The flagship 29-factor composite, with the five-band system.",
  alternates: { canonical: "/pulse/" },
};

export default function PulsePage() {
  return (
    <StaticGate>
      <section className="app-page">
        <header className="app-page-header">
          <div className="eyebrow"><span className="num">02</span> · Pulse</div>
          <h1 className="app-page-h1">
            The <span className="app-page-h1-em">Pulse</span>.
          </h1>
          <div className="app-page-accent" aria-hidden="true" />
          <p className="app-page-lede">
            A single number built from 29 measurable factors. Five named bands. One read on
            how much is happening, per holding.
          </p>
        </header>

        <PulseBigNumber />

        <p className="locked-disclaimer">
          Plumbline is for observation only. Not investment advice. Pulse is a measure of
          market conditions, not a recommendation.
        </p>
      </section>
    </StaticGate>
  );
}
