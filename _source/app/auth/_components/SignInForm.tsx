"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  EMAIL_RE,
  generateUserId,
  persistSession,
} from "./authShared";

/* =========================================================================
   Sign-in form — same instant-access pattern as SignUpForm. Phase 1
   has no password store, so we accept any matching-format password
   for a known email and route straight to /holdings/. Phase 2 wires
   Clerk + real password verification.
   ========================================================================= */

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setStatus("submitting");
    setError("");

    persistSession({
      userId: generateUserId(),
      email: trimmedEmail,
      createdAt: Date.now(),
    });

    router.push("/holdings/");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="auth-form">
      <label className="auth-label" htmlFor="signin-email">
        Email
      </label>
      <input
        id="signin-email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "submitting"}
        placeholder="you@example.com"
        className="auth-input"
      />

      <div className="auth-label-row">
        <label className="auth-label" htmlFor="signin-password">
          Password
        </label>
        <Link href="/auth/forgot-password/" className="auth-link auth-link-sm">
          Forgot password?
        </Link>
      </div>
      <input
        id="signin-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={status === "submitting"}
        placeholder="••••••••"
        className="auth-input"
      />

      <button
        type="submit"
        className="btn-primary auth-cta"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Opening the app…" : "Sign in"}
      </button>

      {error && (
        <p role="alert" className="auth-error">
          {error}
        </p>
      )}
    </form>
  );
}
