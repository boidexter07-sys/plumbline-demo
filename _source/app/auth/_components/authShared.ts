/* =========================================================================
   Shared client-side session helpers for /auth/ forms.

   Phase 1.3 instant-access pattern (matches Phase 1.2 wiring in
   StartTrialButton.tsx):
     - Generate a local UUID for the user
     - Save { userId, email, createdAt } to localStorage under
       `plumbline_session`
     - Mirror userId to a `plumbline_session` cookie (30 days,
       SameSite=Lax, path=/) so any future SSR or Phase 2 backend
       can pick it up
     - Return `true` so the caller can router.push("/holdings/")

   Phase 2 reconciliation: when Clerk is wired in, read
   `localStorage.getItem('plumbline_session')` and reconcile the
   pre-Clerk userId with Clerk's userId. See StaticGate.tsx for the
   matching comment.
   ========================================================================= */

export const SESSION_KEY = "plumbline_session";
export const COOKIE_NAME = "plumbline_session";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type SessionShape = {
  userId: string;
  email: string;
  fullName?: string;
  createdAt: number;
};

export function persistSession(session: SessionShape) {
  const { userId } = session;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // localStorage may be unavailable (private mode, etc.). The cookie
    // alone is enough to carry the session for the rest of the visit.
  }
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
    userId
  )}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function generateUserId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `pl-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function deriveFirstName(email: string, fullName?: string): string {
  const trimmedName = (fullName ?? "").trim();
  if (trimmedName) {
    return trimmedName.split(/\s+/)[0];
  }
  const local = email.split("@")[0] ?? "";
  if (!local) return "there";
  // Capitalise first letter, drop trailing digits/symbols for a friendlier handle.
  const cleaned = local.replace(/[._-]+/g, " ").replace(/\d+$/, "").trim();
  if (!cleaned) return "there";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
