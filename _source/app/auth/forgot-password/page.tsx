import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "../_components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot your password — Plumbline",
  description: "Reset your Plumbline account password.",
  alternates: { canonical: "/auth/forgot-password/" },
};

export default function ForgotPasswordPage() {
  return (
    <div className="auth-form-wrap">
      <div className="auth-form-inner auth-form-narrow">
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          <span className="num">·</span> Reset password
        </div>

        <h1 className="auth-h1 auth-h1-center">
          Forgot your<br /><span className="auth-h1-em">password?</span>
        </h1>

        <p className="auth-lede auth-lede-center">
          Enter the email on your account and we&apos;ll send you a reset link.
        </p>

        <ForgotPasswordForm />

        <div className="auth-foot auth-foot-center">
          <Link href="/auth/sign-in/" className="auth-link">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
