"use client";

import { useSessionInfo } from "../../_components/sessionInfo";

/* =========================================================================
   SettingsPanel — view-only sections for Account, Subscription, and
   Data Sources. Reads the live session from localStorage for the
   email/name. Phase 2 fills in the editing forms.
   ========================================================================= */

const DATA_SOURCES = [
  { label: "Yahoo Finance",    use: "Price, return, volume — public equities & ETFs." },
  { label: "Bank of Canada",   use: "Overnight rate, CPI, NHPI, trade balance." },
  { label: "U.S. Fed (FRED)",  use: "Fed funds, 10y–2y spread, breakeven, HY OAS." },
  { label: "CBOE",             use: "VIX (intraday and EOD)." },
  { label: "LBMA",             use: "Gold spot USD/oz." },
  { label: "EIA",              use: "WTI crude, Canadian gas." },
  { label: "Statistics Canada", use: "Headline CPI, shelter NHPI, labour heat." },
  { label: "Polymarket",       use: "Prediction-market sentiment (one factor, gated)." },
];

export function SettingsPanel() {
  const session = useSessionInfo();
  const email = session?.email ?? "guest@plumbline.example";
  const displayName = session?.firstName
    ? `${session.firstName.charAt(0).toUpperCase()}${session.firstName.slice(1)} H.`
    : "Guest";

  return (
    <div className="settings-grid">
      <section className="settings-card">
        <div className="settings-card-head">
          <div className="eyebrow"><span className="num">·</span> Account</div>
          <h2>Account</h2>
        </div>
        <dl className="settings-dl">
          <div><dt>Name</dt><dd>{displayName}</dd></div>
          <div><dt>Email</dt><dd>{email}</dd></div>
          <div><dt>User ID</dt><dd className="settings-mono">phase-1.3-static</dd></div>
          <div><dt>Sign-in method</dt><dd>Email + password (static, Phase 1)</dd></div>
        </dl>
      </section>

      <section className="settings-card">
        <div className="settings-card-head">
          <div className="eyebrow"><span className="num">·</span> Subscription</div>
          <h2>Subscription</h2>
        </div>
        <dl className="settings-dl">
          <div><dt>Plan</dt><dd>Plumbline v1.0 · 7-day free trial</dd></div>
          <div><dt>Price</dt><dd>$4.99 CAD / month after trial</dd></div>
          <div><dt>Card on file</dt><dd>No — billing starts after trial</dd></div>
          <div><dt>Cancel</dt><dd>Cancel from this page in Phase 2</dd></div>
        </dl>
      </section>

      <section className="settings-card settings-card--wide">
        <div className="settings-card-head">
          <div className="eyebrow"><span className="num">·</span> Data sources</div>
          <h2>Data sources</h2>
          <p className="settings-card-lede">
            Every Plumbline input is a free public source. Total monthly data cost: $0.
            Missing factors are dropped from the composite and disclosed as coverage
            (e.g. 27 of 29 live).
          </p>
        </div>
        <ul className="settings-sources">
          {DATA_SOURCES.map((d) => (
            <li key={d.label}>
              <span className="settings-source-name">{d.label}</span>
              <span className="settings-source-use">{d.use}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
