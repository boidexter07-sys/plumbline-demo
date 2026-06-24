"use client";

import Link from "next/link";
import { useSessionInfo } from "./sessionInfo";

/* =========================================================================
   DashboardHome — interactive bits of the dashboard home page.

   Phase 1.3 ships three pieces:
   - <DashboardGreeting /> — "Welcome, Taha." rendered with a small
     accent line. Reads the persisted session first name from
     localStorage; falls back to "there" when there's no session
     (the StaticGate already prevents that case from showing this
     content, but the fallback keeps the SSR HTML stable).
   - <DashboardEmptyState /> — clock icon, "Start with one ticker.
     We'll watch the rest." headline with the second clause in burnt
     sienna, body copy, 2 CTAs (Add your first holding / Or browse a
     sample book).
   - <DashboardOnboardingTiles /> — 3-step onboarding:
     "01 Add a ticker / 02 Read the Pulse / 03 Tap for the 29 factors".
   ========================================================================= */

export function DashboardGreeting() {
  const session = useSessionInfo();
  const name = session?.firstName ?? "there";
  const display =
    name && name !== "there"
      ? `${name.charAt(0).toUpperCase()}${name.slice(1)}`
      : "there";
  return (
    <>
      Welcome, <span className="app-page-h1-em">{display}</span>.
    </>
  );
}

export function DashboardEmptyState() {
  return (
    <div className="dash-empty">
      <div className="dash-empty-icon" aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="32" cy="34" r="22" />
          <path d="M32 22v12l8 5" strokeLinecap="round" />
          <path d="M22 8h20M28 4v4M36 4v4" strokeLinecap="round" />
        </svg>
      </div>

      <h2 className="dash-empty-h2">
        Start with one ticker.{" "}
        <span className="dash-empty-em">We&apos;ll watch the rest.</span>
      </h2>

      <p className="dash-empty-body">
        Plumbline is built to work with one position or fifty. Add a single ticker to see
        the Pulse model live on a real holding — then grow your book at your own pace.
      </p>

      <div className="dash-empty-actions">
        <Link href="/holdings/" className="btn-primary">
          Add your first holding
        </Link>
        <Link href="/holdings/" className="btn-ghost">
          Or browse a sample book →
        </Link>
      </div>
    </div>
  );
}

export function DashboardOnboardingTiles() {
  const steps = [
    {
      n: "01",
      title: "Add a ticker",
      body: "Type a ticker, set a position, and watch Pulse light it up. Holdings is the front door.",
      cta: { href: "/holdings/", label: "Open Holdings →" },
    },
    {
      n: "02",
      title: "Read the Pulse",
      body: "Pulse blends 29 signals into a single number and a named band. Quiet, Light, Active, Strong, Intense.",
      cta: { href: "/pulse/", label: "Open Pulse →" },
    },
    {
      n: "03",
      title: "Tap for the 29 factors",
      body: "Every Pulse score breaks down to its 29 underlying factors. Tap a band to see which signals are driving it.",
      cta: { href: "/model-details/", label: "Read the method →" },
    },
  ];

  return (
    <div className="dash-onboard" role="list">
      {steps.map((s) => (
        <Link
          key={s.n}
          href={s.cta.href}
          className="dash-onboard-tile"
          role="listitem"
        >
          <div className="dash-onboard-num">{s.n}</div>
          <div className="dash-onboard-title">{s.title}</div>
          <div className="dash-onboard-body">{s.body}</div>
          <div className="dash-onboard-cta">{s.cta.label}</div>
        </Link>
      ))}
    </div>
  );
}
