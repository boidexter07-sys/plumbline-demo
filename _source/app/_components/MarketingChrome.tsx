import Link from "next/link";
import type { ReactNode } from "react";
import { StartTrialButton } from "./StartTrialButton";

/* =========================================================================
   Plumbline brand mark — the asterisk plumb-line (4 directions, optional)
   Used in nav and footer. SVG, no external request, color via currentColor.
   ========================================================================= */
export function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      >
        <path d="M12 2v18" />
        <path d="M5 9h14" strokeDasharray="2 2" />
        <path d="M9 22h6" />
      </svg>
    </span>
  );
}

/* =========================================================================
   Editorial ribbon — top strip on every marketing page
   ========================================================================= */
export function Ribbon({
  left,
  rightHref,
  rightLabel,
}: {
  left: string;
  rightHref?: string;
  rightLabel?: string;
}) {
  return (
    <div className="ribbon">
      <span className="left">{left}</span>
      {rightHref && rightLabel ? (
        <span className="right">
          <Link href={rightHref}>{rightLabel}</Link>
        </span>
      ) : null}
    </div>
  );
}

/* =========================================================================
   Top nav — same on every marketing page
   Mobile: collapses to toggle (mobile-menu-open is a Phase 2 visual).
   Phase 1: just hides nav-links below 768px and keeps the CTA visible.
   ========================================================================= */
export function Nav({ currentPath = "" }: { currentPath?: string }) {
  return (
    <header className="nav-wrap">
      <nav className="nav" aria-label="Primary">
        <Link href="/" className="brand">
          <span>Plumbline</span>
          <BrandMark size={22} />
        </Link>
        <div className="nav-links">
          <Link href="/#legend" aria-current={currentPath === "/" ? "page" : undefined}>Pulse</Link>
          <Link href="/#method">Method</Link>
          <Link href="/#legend">Legend</Link>
          <Link href="/pricing/">Pricing</Link>
          <Link href="/faq/">FAQ</Link>
        </div>
        <span className="nav-spacer" style={{ flex: 1 }} />
        <div className="nav-cta">
          <StartTrialButton variant="nav">
            Start 7-day free trial <span aria-hidden="true">→</span>
          </StartTrialButton>
        </div>
        <button
          className="nav-toggle"
          aria-label="Open menu"
          aria-controls="mobile-drawer"
          aria-expanded="false"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </nav>
    </header>
  );
}

/* =========================================================================
   Footer — same on every marketing page
   Decision 27: locked disclaimer is rendered here, in full.
   ========================================================================= */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <div className="brand" style={{ fontSize: "18px" }}>
            <span>Plumbline</span>
            <BrandMark size={18} />
          </div>
          <div style={{ fontSize: "11.5px", letterSpacing: "0.04em", color: "var(--text-secondary)", marginTop: "18px", lineHeight: 1.6 }}>
            A driver&apos;s-seat view of your investments.
            <br />
            Built in Canada. Available where you are.
          </div>
        </div>
        <div>
          <h4>Product</h4>
          <ul>
            <li><Link href="/#pulse">Pulse</Link></li>
            <li><Link href="/#brief">Daily Brief</Link></li>
            <li><Link href="/#sandbox">Sandbox</Link></li>
            <li><Link href="/#leaderboard">Leaderboard</Link></li>
            <li><Link href="/#model">Model Details</Link></li>
          </ul>
        </div>
        <div>
          <h4>Method</h4>
          <ul>
            <li><Link href="/faq/">The 29-factor Pulse</Link></li>
            <li><Link href="/faq/">The five bands</Link></li>
            <li><Link href="/faq/">Asset-class mask</Link></li>
            <li><Link href="/faq/">Correlation map</Link></li>
            <li><Link href="/faq/">Backtest notes</Link></li>
          </ul>
        </div>
        <div>
          <h4>Plumbline</h4>
          <ul>
            <li><Link href="/about/">About</Link></li>
            <li><Link href="/pricing/">Pricing</Link></li>
            <li><Link href="/faq/">FAQ</Link></li>
            <li><Link href="/terms/">Terms</Link></li>
            <li><Link href="/privacy/">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="legal-row">
        <span>© 2026 Plumbline, Inc. · Vol. 01</span>
        <span>Plumbline is for observation only. Not investment advice.</span>
      </div>
    </footer>
  );
}

/* =========================================================================
   Locked disclaimer — appears on every relevant surface (Decision 27).
   Plain-text component, full locked wording.
   ========================================================================= */
export function LockedDisclaimer() {
  return (
    <p className="locked-disclaimer">
      Plumbline is for observation only. Not investment advice. Pulse is a measure of market conditions, not a recommendation. Plumbline cannot be held liable for any investment outcome resulting from information surfaced by the service.
    </p>
  );
}

/* =========================================================================
   MarketingPage — wraps ribbon + nav + main + footer
   Use this in every app/(marketing)/[page]/page.tsx.
   ========================================================================= */
export function MarketingPage({
  currentPath,
  ribbonLeft,
  ribbonRightHref,
  ribbonRightLabel,
  children,
}: {
  currentPath?: string;
  ribbonLeft?: string;
  ribbonRightHref?: string;
  ribbonRightLabel?: string;
  children: ReactNode;
}) {
  return (
    <>
      <Ribbon
        left={ribbonLeft ?? "Vol. 01 · The Plumbline Method · Issue 1 · 2026-06-24"}
        rightHref={ribbonRightHref}
        rightLabel={ribbonRightLabel}
      />
      <Nav currentPath={currentPath} />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
