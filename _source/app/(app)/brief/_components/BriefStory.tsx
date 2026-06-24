"use client";

/* =========================================================================
   BriefStory — one curated editorial card. Phase 1.3 placeholder.
   ========================================================================= */

export function BriefStory() {
  return (
    <article className="brief-card">
      <div className="brief-card-meta">
        <span className="brief-tag">Brief · 01 of 03</span>
        <span className="brief-when">Globe &amp; Mail · 06:42 ET</span>
      </div>
      <h2 className="brief-card-title">
        Big Six banks brace for Q4 earnings amid persistent provisioning.
      </h2>
      <p className="brief-card-dek">
        Canada&apos;s chartered banks head into reporting season with PCL ratios still
        elevated and the BoC&apos;s next move uncertain. The Royal Bank position in
        your sample book sits in the <strong>Light</strong> band — the story has not
        moved the composite yet.
      </p>
      <div className="brief-card-pulse">
        <span className="brief-tag">RY</span>
        <span className="brief-pulse-band" style={{ color: "var(--status-pos)" }}>
          Light · 0.34
        </span>
      </div>
      <p className="brief-card-note">
        Phase 1 placeholder — Phase 4 wires the live Daily Brief pipeline (curated
        stories tied to your positions).
      </p>
    </article>
  );
}
