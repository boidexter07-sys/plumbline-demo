import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "./_components/SignUpForm";

export const metadata: Metadata = {
  title: "Create your account — Plumbline",
  description:
    "Start your 7-day free trial of Plumbline — a driver's-seat view of your investments. $4.99 CAD/mo after trial.",
  alternates: { canonical: "/auth/" },
};

export default function SignUpPage() {
  return (
    <div className="auth-form-wrap">
      <div className="auth-form-inner">
        <div className="eyebrow">
          <span className="num">·</span> Create your account
        </div>

        <h1 className="auth-h1">
          Start your<br />
          <span className="auth-h1-em">7-day free trial.</span>
        </h1>

        <p className="auth-lede">
          Cancel anytime — no questions, no retention call, no dark patterns. Email-only
          sign-in. No card on file for the trial.
        </p>

        <SignUpForm />

        <p className="auth-legal">
          By creating your account, you agree to our{" "}
          <Link href="/terms/">Terms</Link> and{" "}
          <Link href="/privacy/">Privacy Policy</Link>.
        </p>

        <div className="auth-foot">
          Already have an account?{" "}
          <Link href="/auth/sign-in/" className="auth-link">
            Sign in
          </Link>
        </div>
      </div>

      <p className="auth-cream-disclaimer">
        Plumbline is for observation only. Not investment advice. Pulse is a measure of
        market conditions, not a recommendation. Plumbline cannot be held liable for any
        investment outcome resulting from information surfaced by the service.
      </p>
    </div>
  );
}
