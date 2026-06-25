// Quick inspector for data.json — run with `node scripts/inspect-data-json.mjs`
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, "..", "public", "data.json");
const d = JSON.parse(fs.readFileSync(dataPath, "utf8"));

console.log("=== Size ===");
const sizeKb = (JSON.stringify(d).length / 1024).toFixed(1);
console.log(`  ${sizeKb} KB`);

console.log("\n=== Top-level keys ===");
for (const k of Object.keys(d)) console.log(`  ${k}`);

console.log("\n=== Meta ===");
for (const [k, v] of Object.entries(d.meta)) {
  if (Array.isArray(v)) console.log(`  ${k}: [${v.length} items]`);
  else console.log(`  ${k}: ${v}`);
}

console.log("\n=== Pulse universe ===");
for (const [k, v] of Object.entries(d.pulse_universe)) {
  if (Array.isArray(v)) console.log(`  ${k}: [${v.length} items]`);
  else if (typeof v === "object") console.log(`  ${k}: {${Object.keys(v).length} keys}`);
  else console.log(`  ${k}: ${v}`);
}

console.log("\n=== Holdings observations (AAPL) ===");
const aapl = d.holdings_observations.AAPL || {};
console.log(`  factors: ${Object.keys(aapl).length}`);
for (const fid of ["F1", "F3", "F4", "F10", "F13", "F28"]) {
  const obs = aapl[fid];
  if (obs) console.log(`  ${fid}: ${obs.raw_value} (${obs.source})`);
  else console.log(`  ${fid}: missing`);
}

console.log("\n=== Composite stats ===");
console.log("  ", JSON.stringify(d.pulse_universe.composite_stats));

console.log("\n=== Asset-class summaries ===");
for (const s of d.pulse_universe.asset_class_summaries) {
  console.log(`  ${s.asset_class}: n=${s.count}, mean=${s.mean_pulse.toFixed(3)}`);
}

console.log("\n=== Top movers ===");
console.log("  rises: " + d.pulse_universe.top_movers.biggest_rises.map((r) => `${r.symbol}(${r.band}, ${r.pulse.toFixed(3)})`).join(", "));
console.log("  drops: " + d.pulse_universe.top_movers.biggest_drops.map((r) => `${r.symbol}(${r.band}, ${r.pulse.toFixed(3)})`).join(", "));

console.log("\n=== Markets now (sample) ===");
console.log("  equities_us[0..3]:", d.markets_now.equities_us.slice(0, 3).map((q) => q.symbol).join(", "));
console.log("  crypto[0..3]:", d.markets_now.crypto_top_10.slice(0, 3).map((q) => q.symbol).join(", "));
console.log("  commodities[0..3]:", d.markets_now.commodities.slice(0, 3).map((q) => q.symbol).join(", "));

console.log("\n=== Daily brief ===");
console.log("  headline:", d.daily_brief.headline);
console.log("  signals:", d.daily_brief.signals.map((s) => s.label).join(", "));

console.log("\n=== Factor legend ===");
console.log(`  total: ${d.factor_legend.total_factors}`);
console.log("  first 3:", d.factor_legend.factors.slice(0, 3).map((f) => f.name).join(", "));
console.log("  last 3:", d.factor_legend.factors.slice(-3).map((f) => f.name).join(", "));

console.log("\n=== Portfolio template ===");
for (const t of d.pulse_portfolio_templates) {
  console.log(`  ${t.id}: composite=${t.composite.toFixed(3)}, band=${t.band}, coverage=${t.coverage.toFixed(3)}, n=${t.positions.length}`);
}