import type { Metadata } from "next";
import { StaticGate } from "../_components/StaticGate";
import { BriefStory } from "./_components/BriefStory";

export const metadata: Metadata = {
  title: "Daily Brief — Plumbline",
  description: "3–5 stories curated for the positions you hold.",
  alternates: { canonical: "/brief/" },
};

export default function BriefPage() {
  return (
    <StaticGate>
      <section className="app-page app-page-wide">
        <header className="app-page-header">
          <div className="eyebrow"><span className="num">03</span> · Daily Brief</div>
          <h1 className="app-page-h1">
            The day&apos;s <span className="app-page-h1-em">story</span>.
          </h1>
          <div className="app-page-accent" aria-hidden="true" />
          <p className="app-page-lede">
            3–5 stories, hand-curated, each tied to a holding you actually own. No
            firehose. No hysteria.
          </p>
        </header>

        <BriefStory />

        <p className="locked-disclaimer">
          Plumbline is for observation only. Not investment advice. Pulse is a measure of
          market conditions, not a recommendation.
        </p>
      </section>
    </StaticGate>
  );
}
