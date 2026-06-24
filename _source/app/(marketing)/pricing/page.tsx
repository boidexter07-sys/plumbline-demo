import type { Metadata } from "next";
import { MarketingPage, LockedDisclaimer } from "../../_components/MarketingChrome";

export const metadata: Metadata = {
  title: "Pricing — Plumbline",
  description:
    "Plumbline is $4.99 CAD per month after a 7-day free trial. Cancel anytime. No card on file for the trial.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    type: "website",
    url: "https://boidexter07-sys.github.io/plumbline-demo/pricing/",
    title: "Plumbline — $4.99 CAD / month",
    description: "One price, no tiers, no add-ons. Cancel anytime.",
    images: [{ url: "/plumbline-demo/assets/og-image.png", width: 1200, height: 630 }],
  },
};

export default function PricingPage() {
  return (
    <MarketingPage currentPath="/pricing">
      <section style={{ padding: "96px 20px 48px", textAlign: "center" }}>
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: "center" }}><span className="num">$</span> · One price, no tiers, no add-ons</div>
          <h1 style={{ maxWidth: "18ch", margin: "0 auto 18px" }}>$4.99 CAD per month, <span className="em">after a 7-day free trial.</span></h1>
          <p className="lede" style={{ margin: "0 auto", textAlign: "center" }}>
            Cancel anytime. No card-on-file for the trial. No dark patterns, no retention call, no annual plan that auto-renews in the background.
          </p>
        </div>
      </section>

      <section style={{ padding: "0 20px 48px" }}>
        <div className="container" style={{ maxWidth: 880 }}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--text-primary)", padding: 32, display: "grid", gridTemplateColumns: "1fr", gap: 24, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 700, marginBottom: 14 }}>Plumbline · monthly</div>
              <div style={{ fontSize: "clamp(48px, 8vw, 64px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                <span style={{ color: "var(--accent)" }}>$4.99</span> <span style={{ fontSize: 20, color: "var(--text-secondary)", fontWeight: 500 }}>CAD / month</span>
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "18px 0 0", lineHeight: 1.6, maxWidth: "42ch" }}>
                Billed monthly after a 7-day free trial. Cancel from your account page in two clicks. 14-day money-back guarantee on first charge.
              </p>
            </div>
            <a className="btn-primary" href="#" style={{ fontSize: 15, padding: "14px 28px", justifyContent: "center" }}>Start 7-day free trial</a>
          </div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
            <div style={{ padding: "18px 20px", background: "var(--bg-muted)", fontSize: 13 }}>
              <strong style={{ display: "block", fontSize: 11.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 700, marginBottom: 6 }}>No card on file</strong>
              Try the full product for 7 days. We don&apos;t take a card up front.
            </div>
            <div style={{ padding: "18px 20px", background: "var(--bg-muted)", fontSize: 13 }}>
              <strong style={{ display: "block", fontSize: 11.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 700, marginBottom: 6 }}>No retention call</strong>
              Cancel from the account page. No email loop, no &ldquo;are you sure,&rdquo; no win-back offer.
            </div>
            <div style={{ padding: "18px 20px", background: "var(--bg-muted)", fontSize: 13 }}>
              <strong style={{ display: "block", fontSize: 11.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 700, marginBottom: 6 }}>No upsells</strong>
              One plan. Everything that&apos;s listed on the Model Details page is included.
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "64px 20px", background: "var(--bg-muted)", borderTop: "var(--rule)", borderBottom: "var(--rule)" }}>
        <div className="container">
          <div className="eyebrow"><span className="num">02</span> · What&apos;s in the $4.99</div>
          <h2>29 factors, applied to <span className="em">what you actually hold.</span></h2>
          <p className="lede">
            The new model is built around an asset-class applicability mask. Crypto doesn&apos;t read Canadian-domestic macro. Equities read the full set. Commodities read mostly full, with a couple of price-lane factors dialed down. The $4.99 is the same no matter what you hold.
          </p>

          <div className="asset-mask">
            <div className="asset-tile">
              <div className="asset-tile-label">Equities</div>
              <div className="asset-tile-big">29/29</div>
              <div className="asset-tile-desc">All 29 factors live. The default reading — what SHOP, NVDA, and the Big Six banks run on.</div>
            </div>
            <div className="asset-tile">
              <div className="asset-tile-label">Commodities</div>
              <div className="asset-tile-big">27/29</div>
              <div className="asset-tile-desc">All 29 factors evaluated; F1 + F2 dialed down because there is no &ldquo;sector peers&rdquo; line for crude. The macro lane dominates.</div>
            </div>
            <div className="asset-tile">
              <div className="asset-tile-label">Crypto</div>
              <div className="asset-tile-big">20/29</div>
              <div className="asset-tile-desc">Eight Canadian-domestic macro factors masked out (gas, auto, shelter, trade, labour, GDP, renewables, CPI) — they don&apos;t transmit to a token.</div>
            </div>
          </div>

          <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 24, maxWidth: "80ch" }}>
            The mask is honest about what the model is doing. Crypto doesn&apos;t get the same factors as a Canadian bank, and it shouldn&apos;t — those factors don&apos;t apply. The factors that do apply (USD strength, global risk, prediction-market sentiment, news) carry more weight within the smaller set, so the reading is more honest for a token, not less.
          </p>
        </div>
      </section>

      <section style={{ padding: "64px 20px" }}>
        <div className="container">
          <div className="eyebrow"><span className="num">03</span> · Compared to what</div>
          <h2>What $4.99 a month gets you that the free alternatives don&apos;t.</h2>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Capability</th>
                <th>Brokerage app</th>
                <th>Bloomberg</th>
                <th className="pl">Plumbline</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Single number, per holding, 0–1</td><td>—</td><td>—</td><td className="pl">✓</td></tr>
              <tr><td>29 factors · 5 bands · per-factor drill-down</td><td>—</td><td>paid add-on</td><td className="pl">✓</td></tr>
              <tr><td>Cross-platform portfolio view (not held by them)</td><td>—</td><td>—</td><td className="pl">✓</td></tr>
              <tr><td>Paper portfolio with real Pulse scores</td><td>—</td><td>—</td><td className="pl">✓</td></tr>
              <tr><td>Observational — never buy/sell language</td><td>—</td><td>—</td><td className="pl">✓</td></tr>
              <tr><td>Free public data sources · $0/month infrastructure</td><td>—</td><td>—</td><td className="pl">✓</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ padding: "48px 20px" }}>
        <div className="container"><LockedDisclaimer /></div>
      </section>

      <style>{`
        @media (min-width: 768px) {
          .asset-mask { grid-template-columns: repeat(3, 1fr) !important; }
        }
        .asset-mask { display: grid; grid-template-columns: 1fr; gap: 1px; background: var(--border-subtle); border: 1px solid var(--border-subtle); margin-top: 32px; }
        .asset-tile { background: var(--bg-surface); padding: 32px 28px; }
        .asset-tile-label { font-size: 11.5px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); font-weight: 700; margin-bottom: 14px; }
        .asset-tile-big { font-size: clamp(48px, 7vw, 64px); font-weight: 800; letter-spacing: -0.04em; line-height: 1; color: var(--accent); font-variant-numeric: tabular-nums; }
        .asset-tile-desc { font-size: 14px; color: var(--text-secondary); margin-top: 10px; line-height: 1.5; }
        .compare-table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 14px; }
        .compare-table th { text-align: center; padding: 14px 12px; font-size: 11.5px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 700; border-bottom: 2px solid var(--text-primary); }
        .compare-table th:first-child { text-align: left; }
        .compare-table th.pl { color: var(--accent); }
        .compare-table td { padding: 14px 12px; font-weight: 500; border-bottom: var(--rule); text-align: center; color: var(--text-secondary); }
        .compare-table td:first-child { text-align: left; color: var(--text-primary); }
        .compare-table td.pl { color: var(--accent); font-weight: 700; }
        .compare-table tbody tr:last-child td { border-bottom: none; }
      `}</style>
    </MarketingPage>
  );
}
