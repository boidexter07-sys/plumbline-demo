import { NextResponse } from "next/server";

/* =========================================================================
   POST /api/auth-stub — Phase 2 placeholder.

   In Phase 1 the site ships as a Next.js static export (output: 'export'),
   which means API routes do not run. The inline trial form on the marketing
   pages catches that case locally and returns a "trial activated" message
   without a network round-trip.

   This file exists so that when Phase 2 turns Clerk on (and we keep the
   API route layer), the real backend can be filled in here without having
   to remember the URL the front-end already targets.

   Decision 37: no payment gate.
   Decision 38: email + magic link only.
   ========================================================================= */

export const dynamic = "auto";

export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: string };
    email = (body.email ?? "").trim();
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { status: "error", message: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  // Phase 2 will hand this off to Clerk's sign-in magic-link flow.
  return NextResponse.json({
    status: "ok",
    message:
      "Trial activated. Check " + email + " for a magic link to finish signing in.",
  });
}
