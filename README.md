# Plumbline v1.0 — Marketing Surface

Production marketing codebase for **Plumbline**, deployed to **Cloudflare Pages**.

This repo contains only the marketing surface: the landing page, seven marketing pages, four landing interaction states, the Pulse signal legend (Decision 15), and the Pulse signal filter (Decision 16). The app (Phase 3) lives elsewhere.

---

## Stack

- **Static HTML.** No build step. No framework. Vanilla CSS + tiny JS.
- **Cloudflare Pages** for hosting, CDN, and edge caching.
- **Google Fonts CDN** for Inter (Phase 4 swaps to self-hosted at scale).
- **Stripe** at launch for $4.99 CAD/mo subscriptions (handled outside this repo).
- **Clerk** at launch for auth (handled outside this repo).

The 16 locked decisions from `PROJECT-THREAD-HANDOFF.md` are the source of truth. All copy is in this repo. Do not re-litigate decisions.

---

## File layout

```
/
├── index.html                      # landing (/)
├── _pulse-legend-component.html    # standalone review surface (noindex)
├── 404.html                        # Cloudflare Pages default
├── sitemap.xml
├── robots.txt
├── _redirects                      # trailing-slash canonicalisation
├── _headers                        # security + caching headers
├── pulse-legend-spec.md            # canonical spec for the 12 factors
├── README.md
│
├── assets/
│   ├── css/plumbline.css           # shared Option C design system
│   └── js/plumbline.js             # mobile drawer, auth modal trigger, Pulse filter
│
├── pricing/index.html              # /pricing/
├── about/index.html                # /about/
├── faq/index.html                  # /faq/
├── terms/index.html                # /terms/
├── privacy/index.html              # /privacy/
│
└── states/                         # 4 landing interaction states (noindex)
    ├── landing-clerk-modal.html
    ├── landing-mobile-menu-open.html
    ├── landing-paywall-preview.html
    └── landing-trial-activated.html
```

---

## Routes (clean URLs)

| Path | File | Notes |
|---|---|---|
| `/` | `index.html` | landing |
| `/pricing/` | `pricing/index.html` | $4.99 CAD, 7-day trial |
| `/about/` | `about/index.html` | "This is for you if…" fit list |
| `/faq/` | `faq/index.html` | 25 questions, 3 groups |
| `/terms/` | `terms/index.html` | locked disclaimer |
| `/privacy/` | `privacy/index.html` | PIPEDA |
| `/404` | `404.html` | editorial 404 |
| `/states/landing-clerk-modal.html` | static | sign-in modal state |
| `/states/landing-mobile-menu-open.html` | static | mobile drawer state |
| `/states/landing-paywall-preview.html` | static | paywall state |
| `/states/landing-trial-activated.html` | static | post-trial-activated welcome |
| `/_pulse-legend-component.html` | static | review surface (noindex) |
| `/pulse-legend-spec.md` | static | spec doc |

---

## Cloudflare Pages setup

- **Build command:** empty (no build step).
- **Build output directory:** `/` (repo root).
- **Production branch:** `main`.
- **Environment variables:** none required at deploy time. (Stripe / Clerk env vars live in the app repo, not here.)

`_redirects` canonicalises `/pricing` → `/pricing/` etc. `_headers` sets strict security defaults and immutable caching for `/assets/*`.

---

## Local dev

The marketing surface is fully static. Open `index.html` in a browser, or run a tiny static server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then visit:
- `http://localhost:8080/` — landing
- `http://localhost:8080/_pulse-legend-component.html` — PulseLegend + filter review

---

## PulseLegend + filter (Decisions 15 + 16)

The full canonical spec is in [`pulse-legend-spec.md`](./pulse-legend-spec.md). Quick reference:

- **12 factors**, each with: real term (name), one-line plain-language definition (Quiet edge voice), distinct colour (12-step colour-blind-safe palette), distinct glyph (12 unique SVG shapes).
- **3 categories:** valuation (4 factors), macro (4 factors), news (4 factors).
- **5-band palette is separate** from the 12-factor palette: bands describe *how much* attention; colours describe *which* factor.
- **Filter axes:**
  - Strength: `All` / `4–5` (Strong + Intense) / `2–3` (Light + Active) / `1` (Quiet).
  - Type: `All` / `Valuation` / `Macro` / `News`.
- **State persists in URL** (`?strength=4-5&type=valuation`).
- **Renders on:** landing `#pulse-explainer` section, FAQ Q08 reference, standalone review at `/_pulse-legend-component.html`.

The legend is a `<div data-pulse-legend>` of `<div class="factor" data-strength data-type>` children. The filter is a `<div data-pulse-filter>` of `<button class="pill" data-axis-name data-value>` pills. The script at `/assets/js/plumbline.js` wires them together.

---

## What is NOT in this repo

- The 6-tile dashboard (Holdings, Pulse tile, Daily Brief, Markets Now, Sandbox, Leaderboard) — Phase 3.
- The real Pulse calculation engine — Phase 3.
- Clerk auth integration (real) — Phase 4.
- Stripe subscription integration (real) — Phase 4.
- MiniMax video — gated on 4 support questions (Taha owns).
- Friends/family preview list, demo seed scenario — Taha owns.

---

## Locked decisions (source: `PROJECT-THREAD-HANDOFF.md`)

1. Score name: **Pulse**
2. Tagline: **"A driver's-seat view of your investments."**
3. Positioning: **"See your investments clearly. Understand what they mean."**
4. Build target: **Web only.**
5. Crypto + commodities at v1.0: **Yes.**
6. Universe: **Full S&P 500 + top 10 crypto + 10 commodities.**
7. Pricing: **$4.99 CAD/mo, 7-day free trial** (Stripe).
8. Stack: **Cloudflare Pages + Workers + D1 + Clerk + Stripe.**
9. Design: **Option C, editorial** (cream + deep ink + burnt sienna).
10. Audience: **30–40-year-old Canadian active-but-not-professional hobbyist investors.**
11. Voice: **Quiet edge.**
12. Market: **Canada** — RRSP / TFSA / FHSA, BoC / OSC / CSA / CIRO, PIPEDA.
13. Anti-pattern: **No "they're like this" biography.** Address as "you" / "your."
14. Fit list: **"This is for you if: a, b, c, d…"** with 4–6 conditions.
15. Signal legend: **Visible on the page wherever signals appear.**
16. Signal filtering: **Two filter axes on every Pulse surface.** Strength + Type. URL-persisted.

---

*Built by Thor (Technology Director) for Plumbline v1.0 — June 2026.*