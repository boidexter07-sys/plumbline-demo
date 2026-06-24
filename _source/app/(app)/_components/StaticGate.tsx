import Link from "next/link";
import type { ReactNode } from "react";

/* =========================================================================
   StaticGate — Phase 1 client-side auth gate that does NOT depend on
   @clerk/nextjs context. The static-export build on GitHub Pages ships
   with no Clerk env vars, so ClerkProvider is never mounted and any
   `useUser()` call would crash prerender.

   This component renders the same visual gate as <RequireAuth /> (sign-in
   card with "Start 7-day free trial" CTA), but uses no Clerk hooks. When
   Phase 2 provisions Clerk keys and ClerkProvider mounts, <RequireAuth />
   takes over and signed-in users see children.

   Decision 38: email-only sign-in via Clerk. No social login.
   ========================================================================= */
export function StaticGate({ children }: { children: ReactNode }) {
  return (
    <div className="auth-gate">
      <div className="gate-card">
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          <span className="num">·</span> Sign in to continue
        </div>
        <h2>
          This is the <span style={{ color: "var(--accent)", fontStyle: "italic" }}>app surface</span>.
        </h2>
        <p className="lede" style={{ margin: "0 auto 16px", textAlign: "center" }}>
          Sign in or start the 7-day free trial to access your holdings, Pulse, the Daily
          Brief, and the rest of the dashboard.
        </p>
        <div className="gate-actions">
          <Link href="/pricing/" className="btn-primary">
            Start 7-day free trial
          </Link>
          <Link href="/" className="btn-secondary">
            Back to marketing
          </Link>
        </div>
        <p className="locked-disclaimer" style={{ marginTop: 24, fontSize: 12, opacity: 0.7 }}>
          Email-only sign-in. No social login. No card on file for the trial.
        </p>
      </div>
    </div>
  );
}
