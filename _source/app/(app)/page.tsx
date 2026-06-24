import type { Metadata } from "next";
import {
  DashboardGreeting,
  DashboardEmptyState,
  DashboardOnboardingTiles,
} from "./_components/DashboardHome";

export const metadata: Metadata = {
  title: "Dashboard — Plumbline",
  description: "Your Plumbline dashboard — Pulse, holdings, the day's story.",
  alternates: { canonical: "/" },
};

/* =========================================================================
   Dashboard home — Phase 1.3.

   Server-rendered stub: the meaty empty state + onboarding tiles live
   in DashboardHome client components so we can read the session
   first name and gate the greeting on the live session.
   ========================================================================= */

export default function DashboardPage() {
  return (
    <section className="app-page">
      <header className="app-page-header">
        <div className="eyebrow">
          <span className="num">·</span> Dashboard
        </div>
        <h1 className="app-page-h1">
          <DashboardGreeting />
        </h1>
        <div className="app-page-accent" aria-hidden="true" />
      </header>

      <DashboardEmptyState />

      <div className="app-page-subhead">
        <div className="eyebrow">
          <span className="num">·</span> Get started
        </div>
      </div>

      <DashboardOnboardingTiles />
    </section>
  );
}
