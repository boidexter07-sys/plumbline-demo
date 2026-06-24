"use client";

import { useEffect, useState } from "react";
import { SESSION_KEY, type SessionShape } from "../../auth/_components/authShared";

/* =========================================================================
   useSessionInfo — reads the persisted plumbline_session from
   localStorage on mount and exposes { firstName, email, initials }.

   Phase 1 only ever has this on the client (no SSR session store), so
   the hook returns `null` on the first render to match the server HTML
   and avoids a hydration mismatch. The first useEffect tick fills in
   the live values.
   ========================================================================= */

export type SessionInfo = {
  firstName: string;
  email: string;
  initials: string;
};

function deriveInfo(session: SessionShape): SessionInfo {
  const email = session.email ?? "";
  const local = email.split("@")[0] ?? "";
  const trimmedName = (session.fullName ?? "").trim();
  let firstName = "there";
  if (trimmedName) {
    firstName = trimmedName.split(/\s+/)[0];
  } else if (local) {
    const cleaned = local.replace(/[._-]+/g, " ").replace(/\d+$/, "").trim();
    if (cleaned) firstName = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  const initials = firstName.slice(0, 2).toUpperCase();
  return { firstName, email, initials };
}

export function readSessionInfo(): SessionInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionShape;
    if (!parsed?.email) return null;
    return deriveInfo(parsed);
  } catch {
    return null;
  }
}

export function useSessionInfo(): SessionInfo | null {
  const [info, setInfo] = useState<SessionInfo | null>(null);
  useEffect(() => {
    setInfo(readSessionInfo());
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) setInfo(readSessionInfo());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return info;
}
