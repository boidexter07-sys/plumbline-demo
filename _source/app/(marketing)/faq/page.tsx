import type { Metadata } from "next";
import { MarketingPage, LockedDisclaimer } from "../../_components/MarketingChrome";

export const metadata: Metadata = {
  title: "FAQ — Plumbline",
  description:
    "Five answers to the questions readers ask most often about the 29-factor Pulse.",
  alternates: { canonical: "/faq" },
  openGraph: {
    type: "website",
    url: "https://boidexter07-sys.github.io/plumbline-demo/faq/",
    title: "Plumbline — FAQ",
    description: "Five answers to the questions readers actually ask.",
    images: [{ url: "/plumbline-demo/assets/og-image.png", width: 1200, height: 630 }],
  },
};

const FAQ_ITEMS = [
  {
    q: "How is Pulse built, and what does it actually measure?",
    a: (
      <>
        <p>Pulse is a single number between zero and one, rebuilt once a day at 14:00 ET. It blends twenty-nine measurable inputs — price, macro, FX, news, and prediction-market sentiment — into one read on <em>how much is happening</em> around each holding you own. The number is a magnitude, not a direction: a move in either direction raises the score by the same amount. The five bands — Quiet, Light, Active, Strong, Intense — describe intensity of conditions, not whether conditions are good or bad.</p>
        <p>Twelve of the 29 factors are price-and-macro signals you&apos;ve heard of. Seventeen are the things that quietly shape every position in your book whether you&apos;re watching them or not — Bank of Canada policy, Canadian headline inflation, gold as a risk-off hedge, the credit spread, the VIX. If a factor doesn&apos;t apply to a holding (crypto doesn&apos;t read Canadian-domestic macro, for example), the model masks it. Today&apos;s reading might rest on 27 of 29 factors; the model shows you which factors are live.</p>
        <p>The full factor table, weights, and equations live on the Model Details page. Nothing is hidden behind a settings toggle.</p>
      </>
    ),
  },
  {
    q: "What are the 29 factors?",
    a: (
      <>
        <p>Twenty-nine measurable inputs, organised in five lanes: price (4 factors), macro-FX (1 factor), macro-rest (17 factors), news (5 factors), sentiment (1 factor). The full table lives on the Model Details page. Some highlights, real term first, then the translation:</p>
        <ul className="factor-callouts">
          <li><strong>F1 · Return 1d</strong> — how the holding moved today vs. yesterday&apos;s close</li>
          <li><strong>F5 · BoC overnight rate</strong> — the Bank of Canada&apos;s policy rate and the direction it&apos;s moving</li>
          <li><strong>F9 · News tone shift</strong> — whether the tone of recent stories has shifted positive or negative, 7d window</li>
          <li><strong>F22 · 10y − 2y spread</strong> — the difference between US 10y and 2y yields; inverted for &gt;1 quarter precedes recessions</li>
          <li><strong>F27 · Credit Spread (HY OAS)</strong> — extra yield junk-rated US borrowers pay over US Treasuries</li>
          <li><strong>F28 · VIX</strong> — what the options market is pricing for S&amp;P 500 volatility over the next 30 days</li>
        </ul>
      </>
    ),
  },
  {
    q: "Why 5 bands, and what does each band mean?",
    a: (
      <>
        <p>Because conditions aren&apos;t a one-dimensional thing, and forcing them into &ldquo;good&rdquo; or &ldquo;bad&rdquo; throws away the nuance Pulse is meant to capture. The five bands describe <em>how much is happening</em>, not whether it is good or bad. A Quiet holding can be quietly in trouble. An Intense holding can be Intense for reasons you already understand and have a thesis on.</p>
        <p><strong>Quiet</strong> (below ~50th pct) — the holding is doing what it usually does. <strong>Light</strong> (50th–75th) — something small has shifted. <strong>Active</strong> (75th–90th) — conditions are in motion. <strong>Strong</strong> (90th–98th) — several signals are lined up. <strong>Intense</strong> (top ~2%) — most or all factors are signalling. Rare by construction.</p>
      </>
    ),
  },
  {
    q: "What does the asset-class mask do?",
    a: (
      <>
        <p>It stops the model from applying factors that don&apos;t transmit to the holding. Canadian-domestic macro factors (F13 CPI, F14 gas, F18 renewables, F19 auto sales, F20 GDP per capita, F23 labour, F24 shelter, F25 trade balance) don&apos;t carry a signal to a Bitcoin holding. Under a uniform-factor model, the macro lane would have inflated crypto&apos;s reading with factors that don&apos;t apply. The mask turns those factors off for crypto. Equities get the full 29. Commodities get 27 (F1 and F2 dialed down because there&apos;s no sector-peers line for crude).</p>
        <p>The factors that do apply carry more weight within the smaller set. The reading is more honest for a token, not less.</p>
      </>
    ),
  },
  {
    q: "Why is the price $4.99 CAD per month?",
    a: (
      <p>Because the data costs us $0/month. Every source Pulse reads is free and public — Canadian public datasets, central-bank APIs, the free tier of major US data providers, and a few well-known open news and prediction-market feeds. There is no margin pressure on the data side, so the price is what it is. The 7-day free trial has no card on file. Cancel anytime in two clicks.</p>
    ),
  },
];

export default function FAQPage() {
  return (
    <MarketingPage currentPath="/faq">
      <section style={{ padding: "96px 20px 48px" }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="eyebrow"><span className="num">$</span> · The 29-factor Pulse · explained</div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", maxWidth: "18ch" }}>Five answers to the questions <span className="em">readers actually ask.</span></h1>
          <p className="lede">How Pulse is built, what the 29 factors are, why five bands, what the asset-class mask does, and why the price is $4.99.</p>
        </div>
      </section>

      <section style={{ padding: "48px 20px" }}>
        <div className="container faq-list" style={{ maxWidth: 780 }}>
          {FAQ_ITEMS.map((item, i) => (
            <details key={i} open={i === 0} className="faq-item">
              <summary>
                <span className="faq-num">{String(i + 1).padStart(2, "0")}</span>
                <span>{item.q}</span>
              </summary>
              <div className="faq-body">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section style={{ padding: "48px 20px" }}>
        <div className="container"><LockedDisclaimer /></div>
      </section>

      <style>{`
        .faq-item { border-top: var(--rule); padding: 24px 0; }
        .faq-item:last-of-type { border-bottom: var(--rule); }
        .faq-item summary { cursor: pointer; display: flex; gap: 18px; align-items: flex-start; font-size: clamp(1rem, 1.6vw, 1.125rem); font-weight: 600; letter-spacing: -0.01em; list-style: none; color: var(--text-primary); }
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item summary::after { content: '+'; margin-left: auto; color: var(--accent); font-size: 1.5rem; font-weight: 300; line-height: 1; }
        .faq-item[open] summary::after { content: '−'; }
        .faq-num { color: var(--accent); font-weight: 700; font-variant-numeric: tabular-nums; flex: 0 0 32px; }
        .faq-body { padding: 18px 0 0 50px; font-size: 14.5px; color: var(--text-secondary); line-height: 1.7; }
        .faq-body p { margin: 0 0 14px; }
        .faq-body p:last-child { margin-bottom: 0; }
        .faq-body strong { color: var(--text-primary); }
        .factor-callouts { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: 1fr; gap: 14px 32px; }
        @media (min-width: 768px) {
          .factor-callouts { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </MarketingPage>
  );
}
