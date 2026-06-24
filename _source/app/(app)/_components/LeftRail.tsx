"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "../../_components/MarketingChrome";
import { useSessionInfo } from "./sessionInfo";

/* =========================================================================
   LeftRail — persistent desktop navigation rail for /app/* routes.

   Matches the visual spec (PDF pages 18-28):
   - Deep ink #1B1A17 background, cream text.
   - 240px wide on desktop (≥768px viewport).
   - Wordmark + sienna cross at top.
   - "PORTFOLIO" section heading + 7 nav items.
   - "V1.0 · ROBUST" section heading + 2 nav items.
   - User card at the bottom (avatar circle + name + email).
   - Active route highlighted with cream pill background + burnt
     sienna text.

   Hidden on mobile (the (app) layout swaps in MobileNav below 768px).
   ========================================================================= */

const PORTFOLIO_LINKS = [
  { href: "/dashboard/",   label: "Dashboard",    num: "01" },
  { href: "/holdings/",   label: "Holdings",     num: "02" },
  { href: "/pulse/",      label: "Pulse",        num: "03" },
  { href: "/brief/",      label: "Daily Brief",  num: "04" },
  { href: "/markets/",    label: "Markets Now",  num: "05" },
  { href: "/sandbox/",    label: "Sandbox",      num: "06" },
  { href: "/leaderboard/", label: "Leaderboard", num: "07" },
];

const V1_LINKS = [
  { href: "/model-details/", label: "Model Details", num: "08" },
  { href: "/settings/",      label: "Settings",      num: "09" },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href);
}

export function LeftRail() {
  const pathname = usePathname() || "/";
  const session = useSessionInfo();
  const initials = session?.initials ?? "··";
  const displayName = session?.firstName
    ? `${session.firstName.charAt(0).toUpperCase()}${session.firstName.slice(1)} H.`
    : "Guest";
  const email = session?.email ?? "guest@plumbline.example";

  return (
    <aside className="left-rail" aria-label="App navigation">
      <div className="left-rail-top">
        <Link href="/dashboard/" className="left-rail-brand">
          <span>Plumbline</span>
          <BrandMark size={22} />
        </Link>
      </div>

      <nav className="left-rail-nav" aria-label="Primary">
        <div className="left-rail-section">
          <div className="left-rail-heading">PORTFOLIO</div>
          <ul>
            {PORTFOLIO_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={
                    isActive(pathname, l.href) ? "left-rail-link is-active" : "left-rail-link"
                  }
                  aria-current={isActive(pathname, l.href) ? "page" : undefined}
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
            {V1_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={
                    isActive(pathname, l.href) ? "left-rail-link is-active" : "left-rail-link"
                  }
                  aria-current={isActive(pathname, l.href) ? "page" : undefined}
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
        <div className="left-rail-avatar" aria-hidden="true">
          {initials}
        </div>
        <div className="left-rail-user-meta">
          <div className="left-rail-user-name">TH {displayName}</div>
          <div className="left-rail-user-email">{email}</div>
        </div>
      </div>
    </aside>
  );
}
