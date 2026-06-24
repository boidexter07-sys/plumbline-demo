import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "../_components/SignInForm";

export const metadata: Metadata = {
  title: "Sign in — Plumbline",
  description: "Sign in to your Plumbline account.",
  alternates: { canonical: "/auth/sign-in/" },
};

export default function SignInPage() {
  return (
    <div className="auth-form-wrap">
      <div className="auth-form-inner">
        <div className="eyebrow">
          <span className="num">·</span> Sign in
        </div>

        <h1 className="auth-h1">
          Welcome<br />
          <span className="auth-h1-em">back.</span>
        </h1>

        <p className="auth-lede">
          Pick up where you left off. Same email, same dashboard.
        </p>

        <SignInForm />

        <div className="auth-foot">
          Don&apos;t have an account?{" "}
          <Link href="/auth/" className="auth-link">
            Sign up
          </Link>
        </div>
      </div>

      <p className="auth-cream-disclaimer">
        Plumbline is for observation only. Not investment advice. Pulse is a measure of
        market conditions, not a recommendation.
      </p>
    </div>
  );
}
