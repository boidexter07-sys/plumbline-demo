"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  EMAIL_RE,
  generateUserId,
  persistSession,
} from "./authShared";

/* =========================================================================
   Sign-up form — Phase 1.3.

   Wired identically to StartTrialButton's instant-access flow:
   email + full-name → generate UUID → localStorage + cookie →
   router.push("/holdings/").

   Google / Apple buttons are visible but disabled (Phase 2 — needs
   Clerk + per-provider OAuth setup). The disabled state is loud
   (cursor: not-allowed, opacity) and screen-reader-labelled.
   ========================================================================= */

export function SignUpForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
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
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setStatus("submitting");
    setError("");

    const userId = generateUserId();
    persistSession({
      userId,
      email: trimmedEmail,
      fullName: fullName.trim() || undefined,
      createdAt: Date.now(),
    });

    router.push("/holdings/");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="auth-form">
      <button
        type="button"
        className="auth-provider"
        disabled
        aria-disabled="true"
        title="Coming soon — Phase 2"
      >
        <span className="auth-provider-glyph" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.5 12.27c0-.78-.07-1.53-.2-2.27H12v4.51h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.22-4.74 3.22-8.32z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
            />
            <path
              fill="#FBBC04"
              d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.4c1.62 0 3.06.56 4.21 1.65l3.15-3.15C17.45 2.1 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.32 9.14 5.4 12 5.4z"
            />
          </svg>
        </span>
        Continue with Google
        <span className="auth-provider-soon">Coming soon</span>
      </button>

      <button
        type="button"
        className="auth-provider"
        disabled
        aria-disabled="true"
        title="Coming soon — Phase 2"
      >
        <span className="auth-provider-glyph" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.365 1.43c0 1.14-.42 2.23-1.13 3.02-.78.84-2.05 1.5-3.07 1.41-.13-1.1.42-2.27 1.13-3.04.78-.85 2.13-1.49 3.07-1.39zM21 17.31c-.49 1.13-.72 1.64-1.36 2.64-.88 1.39-2.13 3.13-3.68 3.14-1.38.02-1.74-.9-3.62-.89-1.88.01-2.27.91-3.66.89-1.55-.02-2.74-1.58-3.62-2.97-2.46-3.9-2.72-8.47-1.2-10.9 1.08-1.72 2.78-2.73 4.38-2.73 1.63 0 2.65.9 4 .9 1.31 0 2.11-.9 3.99-.9 1.42 0 2.93.78 4.01 2.12-3.52 1.93-2.95 6.96.76 8.7z" />
          </svg>
        </span>
        Continue with Apple
        <span className="auth-provider-soon">Coming soon</span>
      </button>

      <div className="auth-or">
        <span>OR</span>
      </div>

      <label className="auth-label" htmlFor="signup-name">
        Full name
      </label>
      <input
        id="signup-name"
        name="fullName"
        type="text"
        autoComplete="name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        disabled={status === "submitting"}
        placeholder="Taha H."
        className="auth-input"
      />

      <label className="auth-label" htmlFor="signup-email">
        Email
      </label>
      <input
        id="signup-email"
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

      <label className="auth-label" htmlFor="signup-password">
        Password
      </label>
      <input
        id="signup-password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={status === "submitting"}
        placeholder="8+ characters"
        className="auth-input"
      />

      <button
        type="submit"
        className="btn-primary auth-cta"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Opening the app…" : "Continue with email"}
      </button>

      {error && (
        <p role="alert" className="auth-error">
          {error}
        </p>
      )}
    </form>
  );
}
