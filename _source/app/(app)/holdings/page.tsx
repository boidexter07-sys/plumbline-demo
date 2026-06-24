import type { Metadata } from "next";
import { StaticGate } from "../_components/StaticGate";
import { HoldingsTable } from "./_components/HoldingsTable";

export const metadata: Metadata = {
  title: "Holdings — Plumbline",
  description: "Your positions, with cost basis and Pulse band per row.",
  alternates: { canonical: "/holdings/" },
};

export default function HoldingsPage() {
  return (
    <StaticGate>
      <section className="app-page app-page-wide">
        <header className="app-page-header">
          <div className="eyebrow"><span className="num">01</span> · Holdings</div>
          <h1 className="app-page-h1">
            My <span className="app-page-h1-em">Holdings</span>.
          </h1>
          <div className="app-page-accent" aria-hidden="true" />
          <p className="app-page-lede">
            Each holding appears once, with the things that actually matter in plain
            sight — ticker, exchange, today&apos;s move, and the Pulse band.
          </p>
        </header>

        <HoldingsTable />

        <p className="locked-disclaimer">
          Plumbline is for observation only. Not investment advice. Pulse is a measure of
          market conditions, not a recommendation. Plumbline cannot be held liable for any
          investment outcome resulting from information surfaced by the service.
        </p>
      </section>
    </StaticGate>
  );
}
