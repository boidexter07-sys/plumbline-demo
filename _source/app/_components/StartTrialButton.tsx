"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SignInButton } from "@clerk/nextjs";

/* =========================================================================
   StartTrialButton — Phase 1.2 wiring for "Start 7-day free trial".

   Behaviour:
   - When NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set (Phase 2+), renders
     Clerk's <SignInButton mode="modal"> with email + magic link ONLY
     (no social providers, no payment). Decision 37 + Decision 38.
   - When Clerk env is absent (Phase 1, GitHub Pages static export),
     renders an inline expanding email form as a Phase 1 placeholder.
     Phase 1.2: on submit, the user is given INSTANT ACCESS. We:
       1. generate a local UUID for this user
       2. save { userId, email, createdAt } to localStorage under
          `plumbline_session`
       3. mirror the userId to a `plumbline_session` cookie (30d) so
          any future SSR or Phase 2 backend can pick it up
       4. router.push("/holdings/") — no verification, no backend call
     StaticGate checks localStorage on mount and lets the user through.

   Why a single component: the three landing/pricing CTAs and the nav
   CTA all share the same legal copy and same wiring. Keeping it in one
   file means "fix it once, ship once."

   Phase 2 reconciliation note:
   The local userId written here is the only identifier until Clerk is
   wired in. When Phase 2 provisions Clerk keys, read the session out of
   localStorage (key: `plumbline_session`) and reconcile the
   pre-Clerk userId with Clerk's userId. See StaticGate.tsx for the
   matching reconciliation comment.
   ========================================================================= */

const HAS_CLERK = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const SESSION_KEY = "plumbline_session";
const COOKIE_NAME = "plumbline_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

type Variant = "primary" | "nav" | "cta-band";

type Props = {
  variant?: Variant;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
};

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  nav: "btn-primary",
  "cta-band": "btn-primary",
};

const variantStyle: Record<Variant, CSSProperties> = {
  primary: {},
  nav: {},
  "cta-band": {
    background: "var(--accent)",
    color: "var(--bg-deep)",
    borderColor: "var(--accent)",
    fontSize: 15,
    padding: "14px 28px",
  },
};

/* ----------------------- Phase 2+: Clerk modal branch ---------------------- */

function ClerkTrialButton({ variant, children, style, className }: Props) {
  const mergedStyle = { ...variantStyle[variant ?? "primary"], ...style };
  const mergedClass = `${className ?? ""} ${variantClass[variant ?? "primary"]}`.trim();
  return (
    <SignInButton
      mode="modal"
      // Decision 38: email + magic link ONLY. No social. No payment.
      // Social providers are gated at the Clerk dashboard instance level
      // (Authentication → Social Connections). This component assumes the
      // dashboard has only email + email-link enabled — see Decision 38.
    >
      <button
        type="button"
        className={mergedClass}
        style={mergedStyle}
        data-start-trial="clerk"
      >
        {children ?? "Start 7-day free trial"}
      </button>
    </SignInButton>
  );
}

/* ----------------------- Phase 1: inline static fallback ------------------ */

function StaticTrialButton({ variant, children, style, className }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string>("");
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const mergedStyle = { ...variantStyle[variant ?? "primary"], ...style };
  const mergedClass = `${className ?? ""} ${variantClass[variant ?? "primary"]}`.trim();

  // Lock body scroll when the inline panel is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    emailRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email.");
      return;
    }
    setStatus("submitting");
    setError("");

    // Phase 1.2: instant access. No backend round-trip, no verification.
    // Generate a stable per-browser userId, persist it locally and in a
    // cookie, then route straight into the app. StaticGate watches the
    // same localStorage key on mount and lets the user through.
    const userId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `pl-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    try {
      window.localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ userId, email: trimmed, createdAt: Date.now() })
      );
    } catch {
      // localStorage may be unavailable (private mode, etc.). We still
      // route the user — the cookie alone is enough to carry the session.
    }

    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
      userId
    )}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;

    router.push("/holdings/");
  }

  function onTrigger(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        className={mergedClass}
        style={mergedStyle}
        onClick={onTrigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-start-trial="static"
      >
        {children ?? "Start 7-day free trial"}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="start-trial-title"
          className="start-trial-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 14, 12, 0.55)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            ref={dialogRef}
            className="start-trial-panel"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--text-primary)",
              padding: 28,
              maxWidth: 440,
              width: "100%",
              color: "var(--text-primary)",
              font: "inherit",
              boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
            }}
          >
            <div
              id="start-trial-title"
              style={{
                fontSize: 11.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--accent)",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Phase 1 · Sign-in placeholder
            </div>
            <h2 style={{ fontSize: "1.5rem", lineHeight: 1.2, marginBottom: 10 }}>
              Start your 7-day free trial.
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.5 }}>
              Enter your email to unlock the app. No password, no card on file — when Clerk
              is wired in Phase 2, this opens the real Clerk sign-in modal automatically.
            </p>

            <form onSubmit={onSubmit} noValidate>
              <label
                htmlFor="start-trial-email"
                style={{
                  display: "block",
                  fontSize: 11.5,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                Email address
              </label>
              <input
                ref={emailRef}
                id="start-trial-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "submitting"}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: 15,
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                  marginBottom: 14,
                  fontFamily: "inherit",
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={status === "submitting"}
                style={{ width: "100%", padding: "12px 16px", fontSize: 14 }}
              >
                {status === "submitting" ? "Opening the app…" : "Start trial"}
              </button>
              {error && (
                <p
                  role="alert"
                  style={{ color: "var(--accent)", fontSize: 13, marginTop: 10 }}
                >
                  {error}
                </p>
              )}
            </form>

            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                marginTop: 16,
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                fontSize: 13,
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ------------------------------ Public API -------------------------------- */

export function StartTrialButton(props: Props) {
  if (HAS_CLERK) {
    return <ClerkTrialButton {...props} />;
  }
  return <StaticTrialButton {...props} />;
}

export default StartTrialButton;
