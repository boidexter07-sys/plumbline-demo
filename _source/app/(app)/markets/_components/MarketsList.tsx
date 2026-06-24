"use client";

/* =========================================================================
   MarketsList — 12 sample headlines. Phase 1 placeholder.
   ========================================================================= */

const HEADLINES = [
  { tk: "SHOP", nm: "Shopify",         chg: "+2.1%",  dir: "up"   },
  { tk: "RY",   nm: "Royal Bank",      chg: "+0.4%",  dir: "up"   },
  { tk: "ENB",  nm: "Enbridge",        chg: "−0.6%",  dir: "down" },
  { tk: "BTC",  nm: "Bitcoin",         chg: "−1.4%",  dir: "down" },
  { tk: "CNQ",  nm: "Canadian Natural", chg: "+2.2%", dir: "up"   },
  { tk: "SU",   nm: "Suncor",          chg: "+0.9%",  dir: "up"   },
  { tk: "TD",   nm: "TD Bank",         chg: "−0.3%",  dir: "down" },
  { tk: "BNS",  nm: "Bank of Nova Scotia", chg: "+0.1%", dir: "up" },
  { tk: "XIU",  nm: "iShares S&amp;P/TSX 60", chg: "+0.3%", dir: "up" },
  { tk: "GLD",  nm: "Gold (USD/oz)",   chg: "+0.5%",  dir: "up"   },
  { tk: "WTI",  nm: "WTI Crude",       chg: "+1.8%",  dir: "up"   },
  { tk: "CAD",  nm: "CAD/USD",         chg: "−0.1%",  dir: "down" },
];

export function MarketsList() {
  return (
    <div className="markets-list">
      {HEADLINES.map((h) => (
        <a className="markets-row" key={h.tk} href={`/holdings/`}>
          <span className="markets-tk">{h.tk}</span>
          <span className="markets-nm">{h.nm}</span>
          <span className={`markets-chg ${h.dir === "down" ? "warn" : ""}`}>{h.chg}</span>
          <span className="markets-arrow" aria-hidden="true">→</span>
        </a>
      ))}
    </div>
  );
}
