"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";

/* =========================================================================
   RequireAuth — client-side auth gate for static-export Phase 1.

   In Phase 1, /app/* routes deploy as static HTML on GitHub Pages.
   Clerk's authMiddleware cannot run in static export (it needs a server
   runtime). So we gate client-side: when useUser() reports the user
   isn't loaded/loaded but signed out, show the gate card with a sign-in
   prompt. When Clerk env vars are not set (Phase 1 default), useUser
   returns isLoaded=true and isSignedIn=undefined → the gate is shown.

   When Phase 2 provisions Clerk keys (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY +
   CLERK_SECRET_KEY), the same component switches to real auth and signed-in
   users see the children.

   This is documented as a Phase 1 deviation: client-side gating is the
   honest trade-off for static export.
   ========================================================================= */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();

  // Clerk env not set → isLoaded stays true but user is undefined. Show gate.
  // Clerk env set + signed out → show gate.
  // Clerk env set + signed in → render children.
  if (isLoaded && isSignedIn) {
    return <>{children}</>;
  }

  return (
    <div className="auth-gate">
      <div className="gate-card">
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          <span className="num">·</span> Sign in to continue
        </div>
        <h2>This tile is part of the <span style={{ color: "var(--accent)", fontStyle: "italic" }}>app surface</span>.</h2>
        <p className="lede" style={{ margin: "0 auto 16px", textAlign: "center" }}>
          {isLoaded
            ? "Sign in or start the 7-day free trial to access your holdings, Pulse, the Daily Brief, and the rest of the dashboard."
            : "Authentication is loading. If this screen persists, Clerk keys have not been provisioned yet for this deploy — this is expected on the static Phase 1 build."}
        </p>
        <div className="gate-actions">
          <Link href="/pricing/" className="btn-primary">
            Start 7-day free trial
          </Link>
          <Link href="/" className="btn-secondary">
            Back to marketing
          </Link>
        </div>
      </div>
    </div>
  );
}
