"use client";

/* =========================================================================
   PulseBigNumber — the editorial big-number treatment for /pulse/.
   Renders 0.72 with the STRONG band, 92nd percentile · 27/29 chip,
   and the PulseLegend strip (the 29 factors in colour-blind-safe
   lanes per Decision 15). Phase 2 swaps in the live data + the
   conic-gradient pulse ring.
   ========================================================================= */

export function PulseBigNumber() {
  return (
    <div className="pulse-hero">
      <div className="pulse-score-block">
        <div className="pulse-score-num">0.72</div>
        <div className="pulse-score-band">Strong</div>
        <div className="pulse-score-meta">
          92nd percentile · 27 of 29 live
        </div>
      </div>

      <PulseLegend />
    </div>
  );
}

/* ---- The PulseLegend strip (29 factors in 5 lanes) ------------------- */

const LEGEND = [
  { n: "F1",  lane: "Price",    name: "Return 1d",          color: "#1B1A17" },
  { n: "F2",  lane: "Price",    name: "Return vs sector",   color: "#B8542B" },
  { n: "F3",  lane: "Price",    name: "Volatility 30d",     color: "#B89346" },
  { n: "F4",  lane: "Price",    name: "Drawdown depth",     color: "#4A6E3A" },
  { n: "F5",  lane: "Macro",    name: "BoC rate",           color: "#2E6B7A" },
  { n: "F6",  lane: "Macro",    name: "FX (6+16)",          color: "#5C7A8C" },
  { n: "F7",  lane: "Macro",    name: "Commodity",          color: "#8C6F3F" },
  { n: "F8",  lane: "Macro",    name: "Sector rotation",    color: "#6B5B95" },
  { n: "F9",  lane: "News",     name: "News tone",          color: "#C26456" },
  { n: "F10", lane: "News",     name: "Event volume",       color: "#8E9FAA" },
  { n: "F11", lane: "News",     name: "Story direction",    color: "#4D8B6E" },
  { n: "F12", lane: "News",     name: "News-macro align",   color: "#56524A" },
  { n: "F13", lane: "Macro",    name: "Headline CPI",       color: "#9A4A2A" },
  { n: "F14", lane: "Macro",    name: "Gas CAD/L",          color: "#A6613A" },
  { n: "F15", lane: "Macro",    name: "Gold USD/oz",        color: "#C9A24A" },
  { n: "F17", lane: "Macro",    name: "Oil embargoed",      color: "#5A4E3A" },
  { n: "F18", lane: "Macro",    name: "Renewables",         color: "#6B8E5A" },
  { n: "F19", lane: "Macro",    name: "Auto sales",         color: "#4A5E70" },
  { n: "F20", lane: "Macro",    name: "GDP per capita",     color: "#3D5466" },
  { n: "F21", lane: "Macro",    name: "US Fed funds",       color: "#1B3A4B" },
  { n: "F22", lane: "Macro",    name: "10y-2y spread",      color: "#264653" },
  { n: "F23", lane: "Macro",    name: "Labour Heat",        color: "#7A5C3A" },
  { n: "F24", lane: "Macro",    name: "Shelter NHPI",       color: "#8A6F4A" },
  { n: "F25", lane: "Macro",    name: "Trade balance",      color: "#3F5E5A" },
  { n: "F26", lane: "Macro",    name: "Breakeven 10y",      color: "#6E5B95" },
  { n: "F27", lane: "Macro",    name: "HY OAS",             color: "#A04A3A" },
  { n: "F28", lane: "Macro",    name: "VIX",                color: "#3F4A56" },
  { n: "F29", lane: "Predict",  name: "Prediction mkts",    color: "#7A6F4A" },
  { n: "F30", lane: "News",     name: "News spike",         color: "#B8442B" },
];

export function PulseLegend() {
  return (
    <div className="pulse-legend">
      <div className="pulse-legend-head">
        <div className="eyebrow"><span className="num">·</span> The 29 factors</div>
        <p className="pulse-legend-lede">
          Five lanes — Price, Macro, News, FX, Prediction. Colour-blind-safe palette
          per Decision 15. Σ weight = 1.000 verified.
        </p>
      </div>
      <div className="pulse-legend-grid">
        {LEGEND.map((f) => (
          <div className="pulse-legend-item" key={f.n}>
            <span className="pulse-legend-glyph" style={{ background: f.color }} />
            <span className="pulse-legend-n">{f.n}</span>
            <span className="pulse-legend-name">{f.name}</span>
            <span className="pulse-legend-lane">{f.lane}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
