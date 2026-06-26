# AstroLaabh — Gemstone Efficacy Meter

A 9-step interactive web tool that scores how astrologically effective a customer's
current gemstone is, with a per-pillar breakdown and a context-aware hand-off to
AstroLaabh's services. Built to the PRD (`AstroLaabh_EfficacyMeter_PRD.md`).

> *Find out how well your gemstone is actually working — in 9 questions.*

## Running it

No build step, no dependencies, no internet required (web fonts degrade gracefully).
Serve the folder over HTTP (ES modules need `http://`, not `file://`):

```bash
cd "Astro Laabh efficacy checker"
python3 serve.py            # http://localhost:8765 (custom port: python3 serve.py 3000)
```

`serve.py` is a thin wrapper around Python's static server that disables caching,
so edits to the ES modules always show up on reload. Plain
`python3 -m http.server 8765` also works, but then the browser may cache the
modules — do a hard refresh (Cmd/Ctrl+Shift+R) after edits.

Any static host works in production (the PRD's existing AstroLaabh web stack / CDN).

## Architecture

Config-driven, framework-free. Everything content/scoring lives in data so
astrology & product can tune wording and point values **without code changes**
(PRD §10.5).

| File | Responsibility |
|---|---|
| `index.html` | Shell, fonts, sacred-geometry watermark mount |
| `styles.css` | Design system wired to the brand tokens (PRD §5) |
| `src/config.js` | **Single source of truth** — stones, 9 steps, options, points, hints, gap copy, verdict bands, scoring constants |
| `src/scoring.js` | **Pure scoring engine** (PRD §8/§10.3/§10.4) — no DOM, fully testable |
| `src/illustrations.js` | Brand-styled instructional SVGs per step (stand-ins for the prescribed photography) + the logo mark |
| `src/analytics.js` | Analytics event shim (PRD §10.6) + `sessionStorage` persistence (§10.1) |
| `src/app.js` | State, rendering, linear navigation, keyboard a11y, lead capture |
| `src/yantra.svg` | Low-opacity yantra / compass-rose background ornament |

## Design

Luxury Vedic / celestial per the brand deck: Travertine cream surfaces, Deep Olive
text, Champagne Gold accents (progress, selected state, score ring), an elegant
high-contrast serif (Cormorant Garamond / Marcellus) for display and a humanist
sans (Mulish) for UI, an octagonal faceted-gem logo mark, and a faint yantra
watermark. Mobile-first, with desktop polish.

**Imagery:** photography was not available for this build, so each step ships a
brand-styled **instructional SVG** that serves the step's stated purpose. The
Step 4 transparency 4-panel and Step 5 luster 4-panel — the PRD's most important
visuals — are rendered as backlit / surface-reflection calibration strips in the
selected stone's colour. Swap these `<figure>` contents for the real reference
photos when production art is ready; alt text is already authored in
`illustrations.js`.

## Scoring (sign-off decisions, PRD §13)

These were the open decisions; the defaults below are baked in and easy to change
in `src/config.js → SCORING`:

- **§13.1 Normalization** — percentage of the 120-pt maximum (preserves the brief's
  exact factor weights). Pillar maxes 65 / 35 / 20.
- **§13.3 "Don't know" partial credit** — metal = 3 pts (`METAL_DONTKNOW_POINTS`);
  carat "Don't know" = 3 pts; energising "Don't know" = 1 pt (per §7). Step 7
  adds a "Yes – unknown lab" tier (1 pt) between Indian-lab and no-cert. Step 8's
  finger options offer Thumb (always a wrong finger → 0 pts) in place of "Don't know".
- **§13.4 Lead capture** — optional, offered after the result, never a gate.
- **§13.8 Worst-case cap** — option **(a)**, weights as-is (recommended). The
  *typical* treated + opaque stone scores **24%** and compliance-only caps at
  **17%**, both < 30%, satisfying the constraint. To switch to option (b) — hard-cap
  any opaque / fracture-filled stone at 29% — set `SCORING.HARD_GATE = true`.

Step 1's selection drives Step 8's correct metal/finger and all planet/stone copy
(PRD §10.4): Yellow Sapphire→gold/index, Blue Sapphire→silver|panchdhatu/middle,
Ruby→gold/ring, Emerald→gold|silver/little.

## Acceptance tests (PRD §12)

The pure engine is verified by 28 assertions covering AC2–AC5 (max = 100%, Step-8
dynamic correctness for all four stones, the < 30% constraint cases, verdict-band
boundaries at 30/55/80, gap breakdown, CTA selection). All pass. See
`tests.html` — open it in the browser to run them live, or they run headless via
JavaScriptCore.

## Production wiring (left as integration points)

- **`src/analytics.js → track()`** pushes to `window.dataLayer` + console. Point it
  at GA4 / Segment.
- **Lead submit** (`app.js → wireLead`) currently fires `lead_submit` and shows a
  thank-you. Add the POST to your CRM / WhatsApp Business there.
- **Result CTAs** (`recommendCta` in `scoring.js`) carry a `key` (energising /
  consultation / certification / upgrade / services). Wire each to the real
  AstroLaabh destination (PRD §13.5).
- **Stone set** is the four-stone v1 (PRD §13.6); add stones by extending `STONES`
  and the dynamic Step 8 logic.
