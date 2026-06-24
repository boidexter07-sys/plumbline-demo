import type { Metadata } from "next";
import { MarketingPage } from "../../_components/MarketingChrome";

export const metadata: Metadata = {
  title: "Privacy — Plumbline",
  description: "Where your data goes, and where it doesn't. Built on free public data.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    url: "https://boidexter07-sys.github.io/plumbline-demo/privacy/",
    title: "Plumbline — Privacy",
    description: "Where your data goes, and where it doesn't.",
    images: [{ url: "/plumbline-demo/assets/og-image.png", width: 1200, height: 630 }],
  },
};

export default function PrivacyPage() {
  return (
    <MarketingPage currentPath="/privacy">
      <section style={{ padding: "96px 20px 48px" }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="eyebrow"><span className="num">§</span> · Privacy</div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", maxWidth: "18ch" }}>Where your data goes, <span className="em">and where it doesn&apos;t.</span></h1>
          <p className="lede">Last updated 2026-06-24. Plumbline is built on free public data. We don&apos;t sell what you put into it, and we don&apos;t take more than the Service needs.</p>
        </div>
      </section>

      <section style={{ padding: "48px 20px" }}>
        <div className="container legal-doc" style={{ maxWidth: 760, fontSize: 14.5, color: "var(--text-secondary)", lineHeight: 1.75 }}>
          <h2>1. What we collect</h2>
          <p>To run Pulse on the holdings you enter, the Service reads third-party market data and stores: (a) the tickers and quantities of positions you add, (b) cost basis and acquisition date per position, (c) your email address and authentication data (handled by Clerk), (d) subscription status (handled by Stripe), (e) your sandboxes and paper transactions, (f) anonymised Leaderboard participation if you opt in.</p>

          <h2>2. The data flow (v1.0)</h2>
          <p>Six free public data sources feed the 29-factor Pulse:</p>
          <div className="data-flow-grid">
            <div className="data-flow-tile"><strong>Statistics Canada · WDS</strong><span>F13 CPI, F14 gas, F18 renewables, F19 auto, F20 GDP, F23 labour, F24 shelter, F25 trade</span></div>
            <div className="data-flow-tile"><strong>FRED (Federal Reserve)</strong><span>F21 Fed funds, F22 10y-2y spread, F26 breakeven 10y, F27 HY OAS</span></div>
            <div className="data-flow-tile"><strong>Yahoo Finance</strong><span>F1, F2, F3, F4 price lane · F6+16 FX proxy · F7 commodity · F15 gold · F28 VIX</span></div>
            <div className="data-flow-tile"><strong>BoC Valet API</strong><span>F5 · Bank of Canada overnight rate</span></div>
            <div className="data-flow-tile"><strong>GDELT 2.0</strong><span>F9 tone, F10 events, F11 story, F12 alignment, F30 spike</span></div>
            <div className="data-flow-tile"><strong>Polymarket + Kalshi + PredictIt</strong><span>F29 · prediction-market sentiment overlay (5% dial)</span></div>
          </div>
          <p style={{ marginTop: 18, fontSize: 12.5 }}><strong>Plus (backtest only):</strong> ALFRED (FRED&apos;s archival feed) — vintage data for the v1.1 backtest integrity. Not used in production.</p>

          <h2>3. What we don&apos;t do</h2>
          <p>We don&apos;t sell your data. We don&apos;t share it with brokers, market-makers, or third-party advertisers. We don&apos;t run A/B tests that profile you across the web. We don&apos;t use Plumbline as a customer-acquisition surface for paid data products. The Service&apos;s revenue is the $4.99 monthly subscription. That is the only business model.</p>

          <h2>4. Data export and deletion</h2>
          <p>You can export every position, sandbox, and transaction as CSV from the account page at any time. You can delete your account from the same page. Deletion is permanent and takes effect within 30 days, except for data we are required to retain for legal or tax purposes.</p>

          <h2>5. Cookies and authentication</h2>
          <p>Authentication is handled by Clerk. We use one first-party session cookie. We do not use third-party advertising cookies. We do not use analytics cookies. We do not fingerprint your browser.</p>
        </div>
      </section>

      <style>{`
        .legal-doc h2 { font-size: 1.5rem; color: var(--text-primary); margin: 32px 0 14px; max-width: none; }
        .legal-doc h2:first-child { margin-top: 0; }
        .legal-doc p { margin: 0 0 14px; }
        .legal-doc strong { color: var(--text-primary); }
        .data-flow-grid { display: grid; grid-template-columns: 1fr; gap: 1px; background: var(--border-subtle); border: 1px solid var(--border-subtle); font-size: 13.5px; margin-top: 18px; }
        @media (min-width: 768px) {
          .data-flow-grid { grid-template-columns: 1fr 1fr; }
        }
        .data-flow-tile { background: var(--bg-surface); padding: 18px 20px; display: flex; flex-direction: column; gap: 4px; }
        .data-flow-tile strong { display: block; color: var(--text-primary); }
        .data-flow-tile span { font-size: 12.5px; color: var(--text-secondary); }
      `}</style>
    </MarketingPage>
  );
}
