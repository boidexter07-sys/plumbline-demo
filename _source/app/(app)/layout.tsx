import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "../_components/MarketingChrome";
import { StaticGate } from "./_components/StaticGate";

const HAS_CLERK = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/* =========================================================================
   (app) route group layout
   Wraps every /app/* route in:
   - An app shell (header with brand + nav, main grid, footer)
   - A client-side auth gate
   - The mobile-first responsive grid (.pl-grid)

   Phase 1 placeholder: tiles render "Phase {N} placeholder" cards.

   When Clerk env is provisioned (Phase 2), <RequireAuth /> provides real
   auth gating. Until then, <StaticGate /> renders the same visual gate
   without depending on the Clerk client context (which would crash
   prerender in static-export mode).
   ========================================================================= */

const APP_TILES = [
  { slug: "/holdings/", num: "01", title: "My Holdings", tile: "holdings", phase: 3, desc: "The positions you hold, with cost basis and Pulse band per row." },
  { slug: "/pulse/", num: "02", title: "Pulse", tile: "pulse", phase: 2, desc: "The flagship 29-factor composite, with the 5-band system." },
  { slug: "/brief/", num: "03", title: "Daily Brief", tile: "brief", phase: 4, desc: "3–5 stories curated for the positions you hold." },
  { slug: "/markets/", num: "04", title: "Markets Now", tile: "markets", phase: 2, desc: "12 headlines, each tappable to a position detail page." },
  { slug: "/sandbox/", num: "05", title: "My Sandbox", tile: "sandbox", phase: 3, desc: "Three paper portfolios. Real Pulse, no real money." },
  { slug: "/leaderboard/", num: "06", title: "Leaderboard", tile: "leaderboard", phase: 4, desc: "Public sandboxes, risk-adjusted return, 3M default." },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link href="/" className="brand" style={{ fontSize: 20 }}>
          <span>Plumbline</span>
          <BrandMark size={20} />
        </Link>
        <nav style={{ display: "flex", gap: 16, fontSize: 13.5, fontWeight: 500, flexWrap: "wrap", justifyContent: "flex-end" }} aria-label="App">
          {APP_TILES.map((t) => (
            <Link key={t.slug} href={t.slug} style={{ color: "var(--text-secondary)" }}>
              {t.title}
            </Link>
          ))}
        </nav>
      </header>

      <main style={{ flex: 1 }}>
        <StaticGate>
          <div className="pl-grid">
            <div className="pl-tile--pulse">
              <PulseTileCard />
            </div>
            <div className="pl-tile--holdings">
              <TileCard {...APP_TILES[0]} />
            </div>
            <div className="pl-tile--brief">
              <TileCard {...APP_TILES[2]} />
            </div>
            <div className="pl-tile--markets">
              <TileCard {...APP_TILES[3]} />
            </div>
            <div className="pl-tile--sandbox">
              <TileCard {...APP_TILES[4]} />
            </div>
            <div className="pl-tile--leaderboard">
              <TileCard {...APP_TILES[5]} />
            </div>
          </div>
          {children}
        </StaticGate>
      </main>

      <footer className="site-footer" style={{ marginTop: 0 }}>
        <div className="legal-row">
          <span>© 2026 Plumbline, Inc. · Vol. 01</span>
          <span>Plumbline is for observation only. Not investment advice.</span>
        </div>
      </footer>
    </div>
  );
}

function TileCard({ slug, num, title, tile, phase, desc }: typeof APP_TILES[number]) {
  return (
    <Link href={slug} className="app-tile" style={{ display: "flex", textDecoration: "none" }}>
      <span className="tile-placeholder-badge">Phase {phase} placeholder</span>
      <div className="tile-num">{num} · {tile}</div>
      <div className="tile-glyph">
        <TileGlyph name={tile} />
      </div>
      <div className="tile-title">{title}</div>
      <div className="tile-meta">{desc}</div>
    </Link>
  );
}

function PulseTileCard() {
  return (
    <div className="app-tile" style={{ minHeight: 360 }}>
      <span className="tile-placeholder-badge">Phase 2 placeholder</span>
      <div className="tile-num">02 · pulse</div>
      <div className="pulse-ring" style={{ margin: "12px auto 0" }}>
        <svg viewBox="0 0 220 220" fill="none" style={{ position: "absolute", inset: 0 }}>
          <circle cx="110" cy="110" r="100" stroke="var(--border-subtle)" strokeWidth="1" />
          <circle cx="110" cy="110" r="80" stroke="var(--border-subtle)" strokeWidth="1" />
          <circle cx="110" cy="110" r="60" stroke="var(--border-subtle)" strokeWidth="1" />
        </svg>
        <div style={{ position: "relative", textAlign: "center" }}>
          <div className="score" style={{ color: "var(--text-primary)" }}>0.72</div>
          <div className="band" style={{ color: "var(--accent)" }}>Strong</div>
          <div className="label">92nd pct · 27/29</div>
        </div>
      </div>
      <div className="tile-meta" style={{ marginTop: 12, textAlign: "center" }}>
        The flagship composite. Built from 29 factors, normalised by intensity. The PulseLegend component is rendered statically on this tile in Phase 2.
      </div>
    </div>
  );
}

function TileGlyph({ name }: { name: string }) {
  // Each tile gets a simple glyph in sienna, drawn from the 29-factor legend style.
  const props = {
    width: 32,
    height: 32,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
  };
  switch (name) {
    case "holdings":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="4" fill="currentColor" />
          <rect x="3" y="10" width="18" height="4" fill="currentColor" opacity="0.5" />
          <rect x="3" y="17" width="18" height="4" fill="currentColor" opacity="0.3" />
        </svg>
      );
    case "pulse":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" fill="currentColor" />
        </svg>
      );
    case "brief":
      return (
        <svg {...props}>
          <path d="M4 4h12l4 4v12H4z" />
          <path d="M16 4v4h4" />
          <path d="M8 12h8M8 16h6" />
        </svg>
      );
    case "markets":
      return (
        <svg {...props}>
          <path d="M3 18l5-6 4 3 5-7 4 5" />
        </svg>
      );
    case "sandbox":
      return (
        <svg {...props}>
          <rect x="3" y="6" width="18" height="14" />
          <path d="M3 10h18M9 6v14" />
        </svg>
      );
    case "leaderboard":
      return (
        <svg {...props}>
          <path d="M4 21h16M6 21V11M11 21V7M16 21V13M21 21V9" />
        </svg>
      );
    default:
      return null;
  }
}
