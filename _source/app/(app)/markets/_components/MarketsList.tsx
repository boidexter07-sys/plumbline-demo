"use client";

/* =========================================================================
   MarketsList — Phase 2 wired to /data.json markets_now universe.

   Renders three lanes (US equities, crypto top 10, commodities) from the
   data-snapshot's markets_now block. Click-through routes to /holdings/
   for the matching ticker when the user has a position.
   ========================================================================= */

import { fmtChange, isDown, useRuntime, type MarketRow } from "@/lib/pulse/runtime";

export function MarketsList() {
  const rt = useRuntime();

  if (rt.status === "loading") {
    return <div className="markets-list" aria-busy="true"><div className="hold-empty-note">Loading markets…</div></div>;
  }
  if (rt.status === "error") {
    return (
      <div className="markets-list">
        <div className="hold-empty-note" role="status">Markets unavailable: {rt.message}</div>
      </div>
    );
  }

  const { data, pulse } = rt;
  const symbolsInBook = new Set(pulse.perHolding.map((h) => h.symbol));
  const us = data.markets_now.equities_us;
  const crypto = data.markets_now.crypto_top_10;
  const commodities = data.markets_now.commodities;
  const asOf = data.markets_now.as_of;

  return (
    <div className="markets-list" data-source={`as_of ${asOf}`}>
      <Section heading="US equities" rows={us} symbolsInBook={symbolsInBook} />
      <Section heading="Crypto · top 10" rows={crypto} symbolsInBook={symbolsInBook} />
      <Section heading="Commodities" rows={commodities} symbolsInBook={symbolsInBook} />
      <div className="hold-empty-note">
        Snapshot from {new Date(asOf).toUTCString().slice(0, 22)} UTC · {us.length + crypto.length + commodities.length} instruments · refreshed every 4h by the GitHub Action.
      </div>
    </div>
  );
}

function Section({
  heading,
  rows,
  symbolsInBook,
}: {
  heading: string;
  rows: MarketRow[];
  symbolsInBook: Set<string>;
}) {
  return (
    <>
      <div className="markets-section-head">
        <span className="eyebrow"><span className="num">·</span> {heading}</span>
      </div>
      {rows.map((r) => {
        const chg = fmtChange(r.change_pct);
        const inBook = symbolsInBook.has(r.symbol);
        return (
          <a className={`markets-row${inBook ? " markets-row--inbook" : ""}`} key={r.symbol} href={`/holdings/`}>
            <span className="markets-tk">{r.symbol}</span>
            <span className="markets-nm">{r.name}{inBook ? " · your book" : ""}</span>
            <span className={`markets-chg ${isDown(r.change_pct) ? "warn" : ""}`}>{chg}</span>
            <span className="markets-arrow" aria-hidden="true">→</span>
          </a>
        );
      })}
    </>
  );
}
