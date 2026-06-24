"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { SignInButton } from "@clerk/nextjs";

/* =========================================================================
   StartTrialButton — Phase 1.1 wiring for "Start 7-day free trial".

   Behaviour:
   - When NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set (Phase 2+), renders
     Clerk's <SignInButton mode="modal"> with email + magic link ONLY
     (no social providers, no payment). Decision 37 + Decision 38.
   - When Clerk env is absent (Phase 1, GitHub Pages static export),
     renders an inline expanding email form as a Phase 1 placeholder.
     Submission POSTs to /api/auth-stub which returns 200 + a
     "trial activated" acknowledgement.

   Why a single component: the three landing/pricing CTAs and the nav
   CTA all share the same legal copy and same wiring. Keeping it in one
   file means "fix it once, ship once."
   ========================================================================= */

const HAS_CLERK = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

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
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setStatus("submitting");
    setMessage("");

    // Static export on GitHub Pages: /api/auth-stub won't exist at runtime.
    // We optimistically show "trial activated" locally — this is the Phase 1
    // placeholder per Decision 37/38. When Phase 2 wires Clerk in (and the
    // API route becomes live), the real round-trip below takes over.
    const isStaticExport = !HAS_CLERK;

    if (isStaticExport) {
      // Brief delay so the UI shows the "sending" state.
      await new Promise((r) => setTimeout(r, 350));
      setStatus("ok");
      setMessage(
        "Trial placeholder activated. We sent a magic link to " +
          email +
          ". (Phase 1 static build — real delivery ships with Phase 2.)"
      );
      return;
    }

    try {
      const res = await fetch("/api/auth-stub", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { status?: string; message?: string };
      setStatus("ok");
      setMessage(data.message ?? "Trial activated. Check your inbox for the magic link.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
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
              Enter your email. We&apos;ll send you a magic link — no password, no card on file. When Clerk
              is wired in Phase 2, this opens the real Clerk sign-in modal automatically.
            </p>

            {status === "ok" ? (
              <div
                role="status"
                style={{
                  padding: "14px 16px",
                  background: "var(--bg-muted)",
                  border: "1px solid var(--status-pos)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  marginBottom: 12,
                }}
              >
                {message}
              </div>
            ) : (
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
                  {status === "submitting" ? "Sending magic link…" : "Email me a magic link"}
                </button>
                {status === "error" && (
                  <p
                    role="alert"
                    style={{ color: "var(--accent)", fontSize: 13, marginTop: 10 }}
                  >
                    {message}
                  </p>
                )}
              </form>
            )}

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
