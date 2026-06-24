"use client";

import { useState } from "react";
import { EMAIL_RE } from "./authShared";

/* =========================================================================
   Forgot-password form — Phase 1 visual only. Phase 2 wires a real
   password-reset email flow.
   ========================================================================= */

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setStatus("submitting");
    setError("");
    // Phase 1: just confirm visually. Phase 2 will hit a real endpoint.
    setTimeout(() => {
      setStatus("idle");
      setSent(true);
    }, 500);
  }

  if (sent) {
    return (
      <div className="auth-sent" role="status">
        <strong>Check your inbox.</strong>
        <p>
          If <span className="auth-mono">{email}</span> matches an account, we&apos;ve
          sent a reset link. It expires in 30 minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="auth-form">
      <label className="auth-label" htmlFor="forgot-email">
        Email
      </label>
      <input
        id="forgot-email"
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

      <button
        type="submit"
        className="btn-primary auth-cta"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Send reset link"}
      </button>

      {error && (
        <p role="alert" className="auth-error">
          {error}
        </p>
      )}
    </form>
  );
}
