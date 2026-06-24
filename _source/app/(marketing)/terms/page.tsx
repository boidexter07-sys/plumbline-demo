import type { Metadata } from "next";
import { MarketingPage } from "../../_components/MarketingChrome";

export const metadata: Metadata = {
  title: "Terms — Plumbline",
  description: "Terms of service for Plumbline. What the Service does, and what it refuses to do.",
  alternates: { canonical: "/terms" },
  openGraph: {
    type: "website",
    url: "https://boidexter07-sys.github.io/plumbline-demo/terms/",
    title: "Plumbline — Terms",
    description: "What the Service does, and what it refuses to do.",
    images: [{ url: "/plumbline-demo/assets/og-image.png", width: 1200, height: 630 }],
  },
};

export default function TermsPage() {
  return (
    <MarketingPage currentPath="/terms">
      <section style={{ padding: "96px 20px 48px" }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="eyebrow"><span className="num">§</span> · Terms of service</div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", maxWidth: "18ch" }}>What Plumbline is, <span className="em">and what it refuses to do.</span></h1>
          <p className="lede">Last updated 2026-06-24. By using Plumbline, you agree to these terms. The terms are short on purpose. The locked disclaimer at the bottom of this page is part of these terms.</p>
        </div>
      </section>

      <section style={{ padding: "48px 20px" }}>
        <div className="container legal-doc" style={{ maxWidth: 760, fontSize: 14.5, color: "var(--text-secondary)", lineHeight: 1.75 }}>
          <h2>1. The service</h2>
          <p>Plumbline (the &ldquo;Service&rdquo;) is a read-only observational dashboard for investments you already hold, plus paper portfolios you build inside the Service for the purpose of rehearsing decisions. The Service runs a 29-factor composite called Pulse, rebuilt once per day at 14:00 ET, that describes how much attention each holding in your account is asking for, given the conditions around it.</p>

          <h2>2. What the Service does not do</h2>
          <p><strong>The Service does not provide investment advice.</strong> It does not recommend that you buy, sell, trim, add to, hold, rotate into, or rotate out of any security, asset class, portfolio, strategy, or position. The composite, the bands, the factors, the Daily Brief, the Markets Now tile, the Sandbox, and the Leaderboard are observational surfaces. They describe present conditions. They do not prescribe behaviour. The Service does not forecast prices, returns, or future market conditions.</p>
          <p>The Pulse bands — Quiet, Light, Active, Strong, Intense — describe <em>how much is happening</em> around a holding, not whether the happening is good or bad. A Quiet holding can be quietly in trouble. An Intense holding can be Intense for reasons you already understand and have a thesis on. The bands describe conditions. What those conditions mean for you, given your own book, your own time horizon, your own tax situation, and your own risk tolerance, is your call. The Service is one input among many. Treat it that way.</p>

          <h2>3. Data and accuracy</h2>
          <p>The Service reads from third-party sources — Canadian public datasets, central-bank APIs, the free tier of major US data providers, and a few well-known open news and prediction-market feeds. These sources are free and public but not under our control. Prices, factor readings, and Pulse values may be delayed, revised, or temporarily unavailable. We do not warrant the accuracy, completeness, or timeliness of any data surfaced by the Service.</p>

          <h2>4. Liability</h2>
          <p className="locked-disclaimer" style={{ margin: 0 }}>Plumbline is for observation only. Not investment advice. Pulse is a measure of market conditions, not a recommendation. Plumbline cannot be held liable for any investment outcome resulting from information surfaced by the service.</p>

          <h2>5. Subscriptions and refunds</h2>
          <p>Subscriptions are billed monthly at $4.99 CAD after a 7-day free trial. The trial does not require a card on file. If you are charged, you have 14 days from the charge to request a full refund from your account page. Subscriptions auto-renew until cancelled. Cancellation takes effect at the end of the current billing period. There is no proration for partial months. There is no retention call, no win-back offer, no dark pattern.</p>

          <h2>6. Termination</h2>
          <p>You may terminate your account at any time from the account page. We may suspend or terminate access for violation of these terms. Upon termination, your holdings, sandboxes, and account data are deleted within 30 days, with the exception of data we are required to retain for legal or tax purposes.</p>

          <h2>7. Changes</h2>
          <p>We may update these terms. Material changes are communicated by email at least 14 days before they take effect. Continued use of the Service after the effective date constitutes acceptance.</p>
        </div>
      </section>

      <style>{`
        .legal-doc h2 { font-size: 1.5rem; color: var(--text-primary); margin: 32px 0 14px; max-width: none; }
        .legal-doc h2:first-child { margin-top: 0; }
        .legal-doc p { margin: 0 0 14px; }
        .legal-doc strong { color: var(--text-primary); }
      `}</style>
    </MarketingPage>
  );
}
