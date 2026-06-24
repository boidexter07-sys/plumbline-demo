import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Verify your email — Plumbline",
  description: "Verify your email address to finish signing up.",
  alternates: { canonical: "/auth/verify/" },
};

export default function VerifyPage() {
  return (
    <div className="auth-form-wrap">
      <div className="auth-form-inner auth-form-narrow">
        <div className="auth-verify-icon" aria-hidden="true">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="6" y="14" width="44" height="30" />
            <path d="M6 14l22 16 22-16" />
          </svg>
        </div>

        <div className="eyebrow" style={{ justifyContent: "center" }}>
          <span className="num">·</span> One more step
        </div>

        <h1 className="auth-h1 auth-h1-center">
          Verify your<br /><span className="auth-h1-em">email.</span>
        </h1>

        <p className="auth-lede auth-lede-center">
          Phase 1 ships with instant access — but the full Plumbline sign-up will
          verify your address before activating the trial. Check your inbox for a
          link from <strong>hello@plumbline.example</strong>.
        </p>

        <Link href="/auth/" className="btn-primary auth-cta">
          Back to sign-up
        </Link>
      </div>
    </div>
  );
}
