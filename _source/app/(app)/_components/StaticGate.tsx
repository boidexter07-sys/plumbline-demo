"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

/* =========================================================================
   StaticGate — Phase 1 client-side auth gate that does NOT depend on
   @clerk/nextjs context. The static-export build on GitHub Pages ships
   with no Clerk env vars, so ClerkProvider is never mounted and any
   `useUser()` call would crash prerender.

   Phase 1.2 (instant-access):
   - On mount, checks localStorage for `plumbline_session` (set by
     StartTrialButton when the user submits the email form).
   - If a session is present, renders the children (the tile placeholder
     content) immediately.
   - If no session is present, renders the sign-in card.

   Why client-side: we cannot tell on the server whether the user has a
   localStorage session, so the gate is "open until proven otherwise".
   Direct visitors to /holdings/ who haven't entered an email will still
   see the sign-in card; users who came in through StartTrialButton are
   routed through with no wait.

   Phase 2 reconciliation note:
   The local UUID in `plumbline_session.userId` is the only identifier
   until Clerk is wired in. When Phase 2 provisions Clerk keys:
     1. After Clerk sign-in succeeds, read
        `localStorage.getItem('plumbline_session')` and pull out the
        pre-Clerk userId.
     2. Set `localStorage.setItem('plumbline_clerk_user_id', clerkUser.id)`.
     3. Persist the mapping (preClerkUserId -> clerkUserId) in your
        backend so the user's trial state survives the upgrade.
     4. This component can then gate on either key, or fall back to
        Clerk's useUser() once <RequireAuth /> is mounted.

   Decision 38: email-only sign-in via Clerk. No social login.
   ========================================================================= */

const SESSION_KEY = "plumbline_session";

function hasSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { userId?: string; email?: string };
    return !!parsed.userId && !!parsed.email;
  } catch {
    return false;
  }
}

export function StaticGate({ children }: { children: ReactNode }) {
  // Default to "gated" so the server-rendered HTML is the safe gate.
  // Only flip to "open" after the client mounts and confirms a session.
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOpen(hasSession());
  }, []);

  if (mounted && open) {
    return <>{children}</>;
  }

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
