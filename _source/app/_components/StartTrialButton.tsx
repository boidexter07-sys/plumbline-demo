"use client";

import Link from "next/link";
import { useEffect, type CSSProperties, type ReactNode } from "react";
import { SignInButton } from "@clerk/nextjs";

/* =========================================================================
   StartTrialButton — Phase 1.3 wiring for "Start 7-day free trial".

   Phase 1.3: the inline-modal auth is gone. The button now routes to
   the proper /auth/?intent=signup two-column auth screen. The
   SignUpForm on that page handles the instant-access pattern
   (localStorage + cookie → router.push("/holdings/")).

   Behaviour:
   - Phase 1 (no Clerk env): renders a plain <Link> to /auth/.
     The auth screen handles the rest.
   - Phase 2+ (Clerk env set): renders Clerk's <SignInButton
     mode="modal"> with email + magic link ONLY. Social providers are
     gated at the Clerk dashboard instance level (Authentication →
     Social Connections). See Decision 38.
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

/* ----------------------- Phase 1: link to /auth/ ------------------------ */

function StaticTrialButton({ variant, children, style, className }: Props) {
  const mergedStyle = { ...variantStyle[variant ?? "primary"], ...style };
  const mergedClass = `${className ?? ""} ${variantClass[variant ?? "primary"]}`.trim();
  return (
    <Link
      href="/auth/?intent=signup"
      className={mergedClass}
      style={mergedStyle}
      data-start-trial="static"
    >
      {children ?? "Start 7-day free trial"}
    </Link>
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
