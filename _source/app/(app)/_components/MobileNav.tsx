"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "../../_components/MarketingChrome";
import { useSessionInfo } from "./sessionInfo";

/* =========================================================================
   MobileNav — slide-in panel for viewports < 768px.

   - Hamburger button in AppTopBar opens the panel from the left.
   - Same content as LeftRail but rendered in cream (#F5F1E8) with
     deep ink text — the opposite colour treatment makes the rail
     feel like a brand inversion on mobile.
   - Close button (X) in the top right of the panel.
   - Esc and overlay-click both close.
   - Body scroll is locked while open.
   ========================================================================= */

const LINKS = [
  { href: "/dashboard/",   group: "PORTFOLIO",     label: "Dashboard",    num: "01" },
  { href: "/holdings/",     group: "PORTFOLIO",     label: "Holdings",     num: "02" },
  { href: "/pulse/",        group: "PORTFOLIO",     label: "Pulse",        num: "03" },
  { href: "/brief/",        group: "PORTFOLIO",     label: "Daily Brief",  num: "04" },
  { href: "/markets/",      group: "PORTFOLIO",     label: "Markets Now",  num: "05" },
  { href: "/sandbox/",      group: "PORTFOLIO",     label: "Sandbox",      num: "06" },
  { href: "/leaderboard/",  group: "PORTFOLIO",     label: "Leaderboard",  num: "07" },
  { href: "/model-details/", group: "V1.0 · ROBUST", label: "Model Details", num: "08" },
  { href: "/settings/",     group: "V1.0 · ROBUST", label: "Settings",      num: "09" },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href);
}

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname() || "/";
  const session = useSessionInfo();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Close panel on route change.
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!open) return null;

  const portfolio = LINKS.filter((l) => l.group === "PORTFOLIO");
  const v1 = LINKS.filter((l) => l.group === "V1.0 · ROBUST");

  const initials = session?.initials ?? "··";
  const displayName = session?.firstName
    ? `${session.firstName.charAt(0).toUpperCase()}${session.firstName.slice(1)} H.`
    : "Guest";
  const email = session?.email ?? "guest@plumbline.example";

  return (
    <div className="mobile-nav" role="dialog" aria-modal="true" aria-label="Navigation">
      <button
        type="button"
        className="mobile-nav-overlay"
        aria-label="Close navigation"
        onClick={onClose}
      />
      <div className="mobile-nav-panel">
        <div className="mobile-nav-top">
          <Link href="/" className="left-rail-brand" onClick={onClose}>
            <span>Plumbline</span>
            <BrandMark size={22} />
          </Link>
          <button
            type="button"
            className="mobile-nav-close"
            aria-label="Close menu"
            onClick={onClose}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="mobile-nav-body" aria-label="Primary mobile">
          <div className="left-rail-section">
            <div className="left-rail-heading">PORTFOLIO</div>
            <ul>
              {portfolio.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={
                      isActive(pathname, l.href)
                        ? "left-rail-link is-active"
                        : "left-rail-link"
                    }
                  >
                    <span className="left-rail-num">{l.num}</span>
                    <span className="left-rail-label">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="left-rail-section">
            <div className="left-rail-heading">V1.0 · ROBUST</div>
            <ul>
              {v1.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={
                      isActive(pathname, l.href)
                        ? "left-rail-link is-active"
                        : "left-rail-link"
                    }
                  >
                    <span className="left-rail-num">{l.num}</span>
                    <span className="left-rail-label">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="left-rail-user">
          <div className="left-rail-avatar left-rail-avatar--ink" aria-hidden="true">
            {initials}
          </div>
          <div className="left-rail-user-meta">
            <div className="left-rail-user-name">TH {displayName}</div>
            <div className="left-rail-user-email">{email}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
