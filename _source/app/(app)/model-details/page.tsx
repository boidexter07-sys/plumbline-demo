import type { Metadata } from "next";
import Link from "next/link";
import { StaticGate } from "../_components/StaticGate";

export const metadata: Metadata = {
  title: "Model Details — Plumbline",
  description:
    "How the 29-factor Pulse is built — the bands, the asset-class mask, the correlation map, and the locked disclaimers.",
  alternates: { canonical: "/model-details/" },
};

export default function ModelDetailsPage() {
  return (
    <StaticGate>
      <section className="app-page app-page-wide">
        <header className="app-page-header">
          <div className="eyebrow">
            <span className="num">·</span> Model Details
          </div>
          <h1 className="app-page-h1">
            How the 29-factor <span className="app-page-h1-em">Pulse</span> is built.
          </h1>
          <div className="app-page-accent" aria-hidden="true" />
          <p className="app-page-lede">
            The single number called Pulse is the heart of Plumbline. Every score on the
            dashboard — every holding, every band, every story weight — traces back to the
            same 29 inputs and the same five-band system.
          </p>
        </header>

        <article className="app-prose">
          <h2>The 29 factors.</h2>
          <p>
            Twelve are price-and-macro signals you&apos;ve heard of — return, volatility,
            sector rotation, the VIX, the BoC overnight rate, US Fed funds, gold, oil.
            Seventeen are quieter things that shape every position whether you watch
            them or not — headline CPI, shelter NHPI, the trade balance, the breakeven
            10y, the HY OAS, labour-heat, prediction-market sentiment.
          </p>

          <h2>The five bands.</h2>
          <ul>
            <li><strong>Quiet</strong> — below ~50th percentile. Nothing is asking for attention.</li>
            <li><strong>Light</strong> — ~50th – 75th. Worth being aware of, not enough to act on.</li>
            <li><strong>Active</strong> — ~75th – 90th. A thoughtful look is reasonable.</li>
            <li><strong>Strong</strong> — ~90th – 98th. The story has shape.</li>
            <li><strong>Intense</strong> — top ~2%. Most or all factors are signalling.</li>
          </ul>

          <h2>The asset-class mask.</h2>
          <p>
            Not every factor applies to every position. Crypto does not have a sector
            rotation signal in the same way Canadian bank equities do. The asset-class
            mask drops the inapplicable factors per holding, re-normalises the score,
            and discloses coverage (e.g. &quot;27 of 29 live&quot;).
          </p>

          <h2>The correlation map.</h2>
          <p>
            Some of the 29 factors move together — the VIX and the HY OAS correlate
            tightly; gold and the loonie anti-correlate. The model penalises redundant
            signal weight so the composite is built from independent readings, not the
            same story told three times.
          </p>

          <h2>What this page is — and isn&apos;t.</h2>
          <p>
            Model Details is a description of the method. It is not a recommendation,
            and Pulse is not a forecast. Plumbline is for observation only.
          </p>

          <div className="app-prose-foot">
            <Link href="/" className="btn-ghost">← Back to dashboard</Link>
          </div>
        </article>

        <p className="locked-disclaimer">
          Plumbline is for observation only. Not investment advice. Pulse is a measure of
          market conditions, not a recommendation. Plumbline cannot be held liable for any
          investment outcome resulting from information surfaced by the service.
        </p>
      </section>
    </StaticGate>
  );
}
