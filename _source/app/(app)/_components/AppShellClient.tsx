"use client";

import { useState, type ReactNode } from "react";
import { AppTopBar } from "./AppTopBar";
import { MobileNav } from "./MobileNav";

/* =========================================================================
   AppShellClient — owns the mobile-nav open/close state. Lives in a
   tiny client component so the rest of the (app) layout can stay
   server-rendered.

   Renders the AppTopBar (hamburger on mobile, breadcrumb info on
   desktop) and the MobileNav slide-in panel.
   ========================================================================= */

export function AppShellClient({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      <div className="app-topbar-wrap">
        <AppTopBar onOpenNav={() => setNavOpen(true)} />
      </div>
      {children}
      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}
