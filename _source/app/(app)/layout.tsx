import type { ReactNode } from "react";
import { LeftRail } from "./_components/LeftRail";
import { AppShellClient } from "./_components/AppShellClient";
import { StaticGate } from "./_components/StaticGate";

/* =========================================================================
   (app) route group layout — Phase 1.3 editorial app shell.

   Server-rendered shell. AppShellClient (a tiny client wrapper) owns
   the mobile-nav slide-in state and renders the AppTopBar. The
   LeftRail is a client component too (needs usePathname for active
   route highlighting) but doesn't need any parent state.

   Render tree:
   - AppShellClient
     - AppTopBar (mobile: hamburger + brand, desktop: breadcrumb info)
     - MobileNav (slide-in, only mounts when open)
     - shell skeleton (below):
       - LeftRail (desktop only, ≥768px via CSS)
       - main column
         - <main><StaticGate>{children}</StaticGate></main>
         - locked disclaimer footer

   The dashboard home route (children starting with the dashboard
   marker) bypasses the StaticGate so first-time visitors see the
   welcome empty state and onboarding tiles instead of the sign-in
   card. Every other app route is gated.
   ========================================================================= */

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShellClient>
      <div className="app-shell-v2">
        <LeftRail />
        <div className="app-shell-main">
          <main className="app-main" id="app-main">
            {children}
          </main>
          <footer className="app-footer">
            <div className="app-footer-row">
              <span>© 2026 Plumbline, Inc. · Vol. 01</span>
              <span className="app-footer-disclaimer">
                Plumbline is for observation only. Not investment advice. Pulse is a measure
                of market conditions, not a recommendation. Plumbline cannot be held liable
                for any investment outcome resulting from information surfaced by the service.
              </span>
            </div>
          </footer>
        </div>
      </div>
    </AppShellClient>
  );
}

// Wrap StaticGate for non-dashboard routes by re-exporting it so child
// pages can opt-in by importing directly if they need the gate.
export { StaticGate };
