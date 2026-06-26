"use client";

/* =========================================================================
   BriefStory — Phase 2 wired to /data.json daily_brief editorial block.

   The snapshot script writes headline + paragraphs + per-signal metadata
   (label, factor ids, impact string). Phase 3 (Muse's editorial round)
   will replace the placeholder copy; the structure stays the same.
   ========================================================================= */

import { useRuntime } from "@/lib/pulse/runtime";

export function BriefStory() {
  const rt = useRuntime();

  if (rt.status === "loading") {
    return (
      <article className="brief-card" aria-busy="true">
        <div className="brief-card-meta">
          <span className="brief-tag">Brief</span>
          <span className="brief-when">Loading…</span>
        </div>
        <h2 className="brief-card-title">Today&apos;s story</h2>
        <p className="brief-card-dek">Fetching the live editorial…</p>
      </article>
    );
  }
  if (rt.status === "error") {
    return (
      <article className="brief-card">
        <div className="brief-card-meta">
          <span className="brief-tag">Brief</span>
          <span className="brief-when">Unavailable</span>
        </div>
        <p className="brief-card-dek">Editorial snapshot couldn&apos;t load: {rt.message}</p>
      </article>
    );
  }

  const brief = rt.data.daily_brief;
  const signals = brief.signals ?? [];

  return (
    <article className="brief-card">
      <div className="brief-card-meta">
        <span className="brief-tag">Brief · {brief.date}</span>
        <span className="brief-when">
          Snapshot · {new Date(brief.computed_at).toUTCString().slice(0, 22)} UTC
        </span>
      </div>
      <h2 className="brief-card-title">{brief.headline}</h2>
      {brief.paragraphs?.map((p, i) => (
        <p className="brief-card-dek" key={i}>{p}</p>
      ))}
      {signals.length > 0 && (
        <ul className="brief-signals" aria-label="Live signals from today's snapshot">
          {signals.map((s, i) => (
            <li key={i}>
              <strong>{s.label}</strong>{" "}
              <span className="brief-factors">[{s.factors.join(", ")}]</span>
              {" — "}
              <span>{s.impact}</span>
            </li>
          ))}
        </ul>
      )}
      {brief.disclaimer && (
        <p className="brief-card-note">{brief.disclaimer}</p>
      )}
    </article>
  );
}
