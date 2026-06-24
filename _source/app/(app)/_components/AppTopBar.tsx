"use client";

import Link from "next/link";
import { BrandMark } from "../../_components/MarketingChrome";
import { useSessionInfo } from "./sessionInfo";

/* =========================================================================
   AppTopBar — sticky top strip inside the (app) layout.

   - Desktop (≥768px): thin bar with breadcrumb info
     "14:00 ET rebuild · 27 of 29 live · {user email}".
   - Mobile (<768px): Plumbline wordmark on the left + hamburger
     button on the right. The slide-in MobileNav opens from the
     hamburger.

   Cream background so it sits comfortably against the deep-ink rail.
   ========================================================================= */

export function AppTopBar({ onOpenNav }: { onOpenNav: () => void }) {
  const session = useSessionInfo();
  const email = session?.email ?? "guest@plumbline.example";

  return (
    <header className="app-topbar" aria-label="App top bar">
      <div className="app-topbar-inner">
        {/* Mobile: wordmark + hamburger */}
        <button
          type="button"
          className="app-topbar-hamburger"
          aria-label="Open navigation"
          onClick={onOpenNav}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <Link href="/" className="app-topbar-brand">
          <span>Plumbline</span>
          <BrandMark size={20} />
        </Link>

        {/* Desktop: breadcrumb info */}
        <div className="app-topbar-crumb" aria-live="polite">
          <span className="app-topbar-time">14:00 ET rebuild</span>
          <span className="app-topbar-sep" aria-hidden="true">·</span>
          <span className="app-topbar-live">
            <span className="app-topbar-dot" aria-hidden="true" />
            27 of 29 live
          </span>
          <span className="app-topbar-sep" aria-hidden="true">·</span>
          <span className="app-topbar-email">{email}</span>
        </div>
      </div>
    </header>
  );
}
