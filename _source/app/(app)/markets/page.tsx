import type { Metadata } from "next";
import { StaticGate } from "../_components/StaticGate";
import { MarketsList } from "./_components/MarketsList";

export const metadata: Metadata = {
  title: "Markets Now — Plumbline",
  description: "12 headlines, each tappable to a position detail page.",
  alternates: { canonical: "/markets/" },
};

export default function MarketsPage() {
  return (
    <StaticGate>
      <section className="app-page app-page-wide">
        <header className="app-page-header">
          <div className="eyebrow"><span className="num">04</span> · Markets Now</div>
          <h1 className="app-page-h1">
            Markets <span className="app-page-h1-em">Now</span>.
          </h1>
          <div className="app-page-accent" aria-hidden="true" />
          <p className="app-page-lede">
            12 headlines from the asset universe you watch. Each is tappable to a
            position detail page (Phase 3) or a Pulse breakdown.
          </p>
        </header>

        <MarketsList />

        <p className="locked-disclaimer">
          Plumbline is for observation only. Not investment advice.
        </p>
      </section>
    </StaticGate>
  );
}
