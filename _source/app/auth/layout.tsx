import type { ReactNode } from "react";
import { BrandMark } from "../_components/MarketingChrome";

/* =========================================================================
   /auth/ — two-column layout shell.

   Matches the visual spec (PDF pages 17-18):
   - Left column: deep ink #1B1A17. Wordmark + cream sienna cross,
     "$4.99 CAD · 7-DAY FREE TRIAL" pill, tagline "A driver's-seat
     view of your investments.", 6 stat tiles (Holdings / Pulse /
     Daily Brief / Markets / Sandbox / Leaderboard), locked disclaimer.
   - Right column: cream #F5F1E8. The form panel renders here.
   - Mobile: stacked vertical (ink on top, cream below).

   No marketing nav / footer — this is a full-bleed editorial auth
   surface, not a marketing page.
   ========================================================================= */

const STAT_TILES = [
  { num: "01", name: "Holdings",    blurb: "Positions you hold, with cost basis and Pulse per row." },
  { num: "02", name: "Pulse",       blurb: "29-factor composite, normalised by intensity." },
  { num: "03", name: "Daily Brief", blurb: "3–5 stories curated for the positions you own." },
  { num: "04", name: "Markets",     blurb: "12 headlines, each tied to an asset you watch." },
  { num: "05", name: "Sandbox",     blurb: "Three paper portfolios. Real Pulse, no real money." },
  { num: "06", name: "Leaderboard", blurb: "Public sandboxes, risk-adjusted return, 3M default." },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      <aside className="auth-ink" aria-label="Plumbline overview">
        <a className="auth-brand" href="/welcome/">
          <span>Plumbline</span>
          <BrandMark size={26} />
        </a>

        <div className="auth-pill">
          <span className="dot" aria-hidden="true" />
          $4.99 CAD · 7-DAY FREE TRIAL
        </div>

        <h2 className="auth-tagline">
          A driver&apos;s-seat view<br />of your investments.
        </h2>
        <p className="auth-sub">
          Calm guidance for noisy markets — a dashboard, a daily brief, and a single
          number called Pulse that tells you how conditions are shifting. Not what
          to do. Just what is happening.
        </p>

        <div className="auth-stats" role="list">
          {STAT_TILES.map((s) => (
            <div className="auth-stat" key={s.num} role="listitem">
              <span className="num">{s.num}</span>
              <div>
                <div className="nm">{s.name}</div>
                <div className="blurb">{s.blurb}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="auth-ink-disclaimer">
          Plumbline is for observation only. Not investment advice. Pulse is a measure of
          market conditions, not a recommendation.
        </p>
      </aside>

      <main className="auth-cream">{children}</main>
    </div>
  );
}
