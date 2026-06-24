import type { Metadata } from "next";
import { MarketingPage, LockedDisclaimer } from "../../_components/MarketingChrome";

export const metadata: Metadata = {
  title: "About — Plumbline",
  description:
    "Plumbline is one team, one question — what does the 30-to-40 active-but-not-professional investor actually need?",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    url: "https://boidexter07-sys.github.io/plumbline-demo/about/",
    title: "Plumbline — About",
    description: "Built for the reader who treats investing as a practice, not a feed.",
    images: [{ url: "/plumbline-demo/assets/og-image.png", width: 1200, height: 630 }],
  },
};

export default function AboutPage() {
  return (
    <MarketingPage currentPath="/about">
      <section style={{ padding: "96px 20px 48px" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="eyebrow"><span className="num">i.</span> · About Plumbline</div>
          <h1>Built for the reader who treats investing as a <span style={{ color: "var(--accent)", fontStyle: "italic" }}>practice</span>, not a feed.</h1>
          <p className="lede">
            Plumbline is one person, one team, one question — what does the 30-to-40 active-but-not-professional investor actually need? The answer is not more data. The answer is one number, in plain language, that tells you what is happening to the position you already own.
          </p>
        </div>
      </section>

      <section style={{ padding: "48px 20px", background: "var(--bg-muted)", borderTop: "var(--rule)", borderBottom: "var(--rule)" }}>
        <div className="container" style={{ maxWidth: 880 }}>
          <div className="eyebrow"><span className="num">ii</span> · Is this for you</div>
          <h2 style={{ maxWidth: "24ch" }}>Six conditions. <span style={{ color: "var(--accent)", fontStyle: "italic" }}>Most readers land on four or five.</span></h2>
          <div className="fit-grid">
            {FIT_ITEMS.map((it) => (
              <div key={it.letter} className="fit-tile">
                <div className="fit-letter">{it.letter}</div>
                <div>
                  <strong>{it.title}</strong>
                  <span>{it.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "64px 20px" }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="eyebrow"><span className="num">iii</span> · Five convictions</div>
          <h2 style={{ maxWidth: "22ch" }}>What we believe, in five lines.</h2>
          <ol className="convictions">
            {CONVICTIONS.map((c, i) => (
              <li key={i}>
                <div className="conviction-num">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <strong>{c.title}</strong>
                  <span>{c.desc}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section style={{ padding: "48px 20px" }}>
        <div className="container"><LockedDisclaimer /></div>
      </section>

      <style>{`
        .fit-grid { display: grid; grid-template-columns: 1fr; gap: 0; margin-top: 32px; background: var(--border-subtle); border: 1px solid var(--border-subtle); }
        .fit-tile { background: var(--bg-surface); padding: 28px 32px; display: flex; gap: 18px; align-items: flex-start; }
        .fit-letter { width: 32px; height: 32px; border: 1.5px solid var(--accent); display: grid; place-items: center; color: var(--accent); font-weight: 700; flex: 0 0 32px; }
        .fit-tile strong { display: block; font-size: 15px; margin-bottom: 6px; letter-spacing: -0.005em; color: var(--text-primary); }
        .fit-tile span { font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; }
        @media (min-width: 768px) {
          .fit-grid { grid-template-columns: 1fr 1fr; }
        }
        .convictions { list-style: none; padding: 0; margin: 32px 0 0; counter-reset: c; }
        .convictions li { display: grid; grid-template-columns: auto 1fr; gap: 24px; padding: 24px 0; border-top: var(--rule); }
        .convictions li:last-child { border-bottom: var(--rule); }
        .conviction-num { font-size: 32px; font-weight: 800; letter-spacing: -0.04em; color: var(--accent); font-variant-numeric: tabular-nums; line-height: 1; }
        .convictions strong { display: block; font-size: 1.0625rem; margin-bottom: 8px; letter-spacing: -0.005em; }
        .convictions span { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
      `}</style>
    </MarketingPage>
  );
}

const FIT_ITEMS = [
  { letter: "a", title: "You hold across more than one platform.", desc: "The brokerage app, the crypto exchange, the TSX account, the Roth IRA, the spreadsheet. They don\u2019t talk to each other." },
  { letter: "b", title: "You want one number per holding.", desc: "A single Pulse that says how much attention a position is asking for, today, in plain terms." },
  { letter: "c", title: "You know the basics already.", desc: "P/E, dividend yield, beta. The vocabulary is in your head. The terms don\u2019t need to be re-explained." },
  { letter: "d", title: "Investing is a practice for you.", desc: "Something you work on \u2014 not a set-and-forget account. The decisions compound, and so does the discipline." },
  { letter: "e", title: "You read the financial press.", desc: "The Globe, the FT, Bloomberg\u2019s daily, the occasional substack. You don\u2019t read day-trader feeds." },
  { letter: "f", title: "You want fewer signals, better translated.", desc: "Not more data. The 29 factors are pre-filtered; the bands pre-named. The work is already done for you." },
];

const CONVICTIONS = [
  { title: "Observation, not recommendation.", desc: "Pulse is a read on conditions. It does not tell you to buy, sell, trim, or add. The bands describe how much is happening \u2014 not whether the happening is good or bad. The 29-factor model is built around this conviction, not the other way around." },
  { title: "Free data, public methods.", desc: "Every source Pulse reads is free and public \u2014 Canadian public datasets, central-bank APIs, the free tier of major US data providers, and a few well-known open news and prediction-market feeds. The full factor table, weights, and equations live on the Model Details page. Nothing is hidden behind a settings toggle. Nothing is proprietary." },
  { title: "The model is honest about its limits.", desc: "Crypto doesn\u2019t read Canadian-domestic macro. The mask is built into the model. Today\u2019s reading might reflect only 12 independent signals out of 29, and we show you that. A factor that doesn\u2019t apply is masked, not applied and hoped for." },
  { title: "One number, then the translation.", desc: "Pulse is real, then the parenthetical. The model says the holding is at 0.72 \u2014 that is, in the Strong band, the 92nd percentile of conditions. The translation is in the same place. The language is plain. The jargon is opt-in." },
  { title: "The price is the price. The rest is free.", desc: "$4.99 CAD per month. The data costs us $0/month because the sources are public. The price is what it is. There is no annual tier that auto-renews in the background. There is no enterprise plan with a sales call." },
];
