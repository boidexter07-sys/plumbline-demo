# Pulse Signal Legend — 12-Factor Specification (v1.0)

**Decision:** 15 (signal legend) + 16 (signal filtering)
**Owner:** Taha Hasnain · **Built by:** Thor (technology director)
**Locked:** 2026-06-23
**Source-of-truth file:** `/assets/css/plumbline.css` (tokens `--pulse-1` … `--pulse-12`)

This document is the canonical reference for the 12 factors in the Pulse model. It governs how the legend renders on every page where signals appear (Decision 15), and how the filter control behaves on every Pulse surface (Decision 16).

---

## 1. What this spec governs

- The visible PulseLegend on every page where signals are shown.
- The 12 distinct (colour, glyph) pairs that identify each factor.
- The grouping into **3 categories** for the filter `type` axis.
- The score-band strength axis (5 → 1) for the filter `strength` axis.
- The plain-language name + one-line definition for each factor (real term first, then the translation — Decision 11 Quiet edge voice).

The actual factor computation is owned by Phase 3 (app rebuild). The marketing surface shows these 12 factors statically, with mocked `data-strength` and `data-type` attributes that the Phase 1 JS reads.

---

## 2. The 12 factors

| # | Real term (name) | Plain-language one-line definition | Category | Band (strength) | Colour | Glyph |
|---|---|---|---|---|---|---|
| 1 | **Return — 1 day** | How the holding moved in today's session, expressed as a percentage from yesterday's close. | valuation | 5 | `#1B1A17` (deep ink) | circle |
| 2 | **Return vs. sector** | How the holding moved today against the average of the sector it lives in. | valuation | 4 | `#B8542B` (burnt sienna) | square |
| 3 | **Volatility** | How big the holding's day-to-day swings have been over the recent window. | valuation | 3 | `#B89346` (ochre) | triangle |
| 4 | **Drawdown depth** | How far the holding has fallen from its recent peak, expressed as a percentage of that peak. | valuation | 2 | `#4A6E3A` (olive) | diamond |
| 5 | **Bank of Canada overnight rate** | The BoC policy rate and the direction it is moving, weighted by how rate-sensitive the holding is. | macro | 4 | `#2E6B7A` (deep teal) | hexagon |
| 6 | **Currency (CAD)** | The move in the Canadian dollar against the holding's listing currency, weighted by the holding's currency exposure. | macro | 2 | `#5C7A8C` (slate) | rhombus |
| 7 | **Commodity pressure** | How the commodity complex relevant to the holding (energy, metals, grains) has moved over the recent window. | macro | 3 | `#8C6F3F` (bronze) | pentagon |
| 8 | **Sector rotation** | How the holding's sector has performed against the broader market over the recent window. | macro | 4 | `#6B5B95` (plum) | octagon |
| 9 | **News tone shift** | The change in tone (positive / negative / neutral) across the curated set of stories that mention the holding, over a rolling window. | news | 4 | `#C26456` (brick) | arrow-up |
| 10 | **Event volume** | The number of distinct news events that mention the holding in the recent window, normalised against the holding's typical baseline. | news | 2 | `#8E9FAA` (steel) | plus |
| 11 | **Story direction** | Whether the dominant narrative around the holding has shifted (favourable ↔ unfavourable), tracked across stories rather than within any single one. | news | 3 | `#4D8B6E` (pine) | arrow-down |
| 12 | **News vs. macro alignment** | Whether the news tone and the macro signals are pointing the same way — agreement reinforces, contradiction softens. | news | 1 | `#56524A` (warm grey) | minus |

---

## 3. The colour palette (Decision 15 sub-decision)

The 12 colours extend the Option C token palette. They were picked from a colour-blind-safe qualitative ramp (Okabe-Ito family, then retuned to sit naturally on cream paper and to stay distinct under deuteranopia and protanopia). Each factor pair (colour + glyph) is independently identifiable — a colour-blind reader can rely on glyph shape alone.

**Locked hex values** (also pinned as `--pulse-1` … `--pulse-12` in `assets/css/plumbline.css`):

```
--pulse-1:  #1B1A17   deep ink       (price: return 1d)
--pulse-2:  #B8542B   burnt sienna   (price: return vs sector)
--pulse-3:  #B89346   ochre          (price: volatility)
--pulse-4:  #4A6E3A   olive          (price: drawdown)
--pulse-5:  #2E6B7A   deep teal      (macro: BoC rate)
--pulse-6:  #5C7A8C   slate          (macro: currency)
--pulse-7:  #8C6F3F   bronze         (macro: commodity)
--pulse-8:  #6B5B95   plum           (macro: sector rotation)
--pulse-9:  #C26456   brick          (news: tone shift)
--pulse-10: #8E9FAA   steel          (news: event volume)
--pulse-11: #4D8B6E   pine           (news: story direction)
--pulse-12: #56524A   warm grey      (news: macro alignment)
```

The 5-band palette (Quiet / Light / Active / Strong / Intense) is **separate** from the 12-factor palette and is built from the Option C tokens (`--status-pos`, `--status-watch`, `--status-radar`, plus sienna and ink accents). The 12-factor palette is for *which factor*; the band palette is for *how much attention*.

---

## 4. The glyph shapes (Decision 15)

12 distinct shapes, all rendered as inline SVG inside the legend swatch. The shapes were chosen so each is unambiguous at 16px and so no two share a silhouette category (curve, polygon, axis-aligned).

| Glyph | SVG (inline, simplified) |
|---|---|
| circle | `<circle cx="9" cy="9" r="6.5" fill="currentColor"/>` |
| square | `<rect x="2.5" y="2.5" width="13" height="13" fill="currentColor"/>` |
| triangle | `<polygon points="9,2 16,16 2,16" fill="currentColor"/>` |
| diamond | `<polygon points="9,2 16,9 9,16 2,9" fill="currentColor"/>` |
| hexagon | `<polygon points="9,2 15.5,5.5 15.5,12.5 9,16 2.5,12.5 2.5,5.5" fill="currentColor"/>` |
| rhombus (tall) | `<polygon points="9,2 14,9 9,16 4,9" fill="currentColor"/>` |
| pentagon | `<polygon points="9,2 16,8 13,16 5,16 2,8" fill="currentColor"/>` |
| octagon | `<polygon points="5,2 13,2 17,6 17,12 13,16 5,16 1,12 1,6" fill="currentColor"/>` |
| arrow-up | `<path d="M9 3 L15 11 L11 11 L11 16 L7 16 L7 11 L3 11 Z" fill="currentColor"/>` |
| plus | `<path d="M8 2 H10 V8 H16 V10 H10 V16 H8 V10 H2 V8 H8 Z" fill="currentColor"/>` |
| arrow-down | `<path d="M9 16 L15 8 L11 8 L11 3 L7 3 L7 8 L3 8 Z" fill="currentColor"/>` |
| minus | `<rect x="2" y="8" width="14" height="3" fill="currentColor"/>` |

---

## 5. Filter axes (Decision 16)

Two filter axes, both rendered as page controls (not settings screens). Default: all 12 visible.

### 5.1 Strength axis

Filter by **score band** (the band the factor tends to push toward — mocked for v1.0 marketing).

- `All` — default
- `4–5` — Strong + Intense band factors (the ones that move the score most)
- `2–3` — Light + Active band factors
- `1` — Quiet band factors (the most muted)

The pill values in the URL: `?strength=all|4-5|2-3|1`.

### 5.2 Type axis

Filter by **factor category**.

- `All` — default
- `valuation` — price-derived factors (#1–4)
- `macro` — macro context factors (#5–8)
- `news` — news tone factors (#9–12)

The pill values in the URL: `?type=all|valuation|macro|news`.

### 5.3 Why these axes (locked choice)

- **Strength by score band** (not magnitude) was chosen because the band vocabulary — Quiet / Light / Active / Strong / Intense — is the language the user already knows from the Pulse explainer. Asking them to think in raw "magnitude" would re-introduce vocabulary the product explicitly avoids.
- **Type by category** (not source) was chosen because the user thinks about *what the factor is measuring*, not *which vendor provides it*. The price-derived vs. macro vs. news split is the structural division of the model itself; a source split (price-derived vs. news-derived vs. GDELT-derived) would surface implementation detail the user does not need.

---

## 6. Where the legend renders (Decision 15)

The PulseLegend is a page-level control, not a tooltip. It appears:

- **On the landing page** — at the bottom of the `#pulse-explainer` section (where Pulse is most explained).
- **On the FAQ page** — at the top of the FAQ section (referenced from the existing Q&A, since FAQ Q03 names the 12 factors by category).
- **In the eventual app** — on the Pulse tile and on each position detail (Phase 3, out of scope here).

It does **not** appear on pricing, about, terms, privacy, or 404. Those pages reference Pulse conceptually but do not show the 12-factor grid.

---

## 7. Where the filter renders (Decision 16)

The filter control renders **directly above** the legend, in the same `#pulse-explainer` section on the landing page. It is a small horizontal block: two pill-button groups (Strength / Type), one reset link, editorial-styled to match Option C.

The filter is functional on the marketing site (clicking a pill toggles factor visibility), but the underlying data is mocked. Real data wiring happens in Phase 3.

Filter state persists in the URL: `?strength=4-5&type=valuation`. Sharing a filtered view = sharing that URL.

---

## 8. Accessibility

- Every swatch has a `role="img"` and an `aria-label` of the form `"Factor N: <real term> — <category>"`.
- Glyphs are not decorative — they carry meaning, so each is exposed to assistive tech via the swatch label.
- The filter pills are real `<button>` elements with `aria-pressed` reflecting active state.
- The legend grid collapses to 2 columns at ≤980px and 1 column at ≤640px. The filter control collapses to a stacked layout below 980px.
- Colour choices are colour-blind-safe (Okabe-Ito-derived). Glyph shapes give a redundant channel for users who cannot reliably distinguish the colours.

---

## 9. Open questions for Phase 3 (deferred)

- Whether the band a factor *tends* to push toward (column "Band (strength)" above) is meaningful for users, or whether the band assignment should be removed in favour of a flat list. Decision deferred to Phase 3 user testing.
- Whether the 12-factor list should ever change between marketing site and app. Locked today: same 12, same colours, same glyphs, in both surfaces.
- Whether `data-strength` values should be derived dynamically in the app (per-factor recent contribution) rather than statically assigned. Decision deferred.

None of these block Phase 1 (marketing surface) shipping.