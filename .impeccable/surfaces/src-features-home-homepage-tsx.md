---
version: 1
slug: "src-features-home-homepage-tsx"
primary_target: "src/features/home/HomePage.tsx"
related_targets: ["src/App.tsx"]
---

# Inicio (dashboard) — app de finanzas personales

Scope: home screen of the PWA plus the shared shell (tab bar, add sheet, grouped lists) every other screen inherits. Mode: Operate. Phone-first (390×844), dark only.

Audience/job: the owner opens it on her iPhone to see how this week and this month are going, then logs a cash expense or clears Wallet payments waiting for review.

Constraints: colones only; dark always; Wallet inbox findable in one glance; quick add under five seconds; budget keeps its single colour rule.

## Direction contract

THESIS: Discreet luxury of a private black card: the month is a matte-metal card you hold, not a dashboard tile. It refuses the category's saturated system colours and colour-tiled icons; colour appears only where it means something (budget state, income).

OWN-WORLD: Matte black ground, layered graphite surfaces, platinum as the single action colour (light metal fill with near-black text), steel greys for secondary, engraved tabular numerals, machined 1px top-edge highlight on raised surfaces, low-chroma category tints (bronze, sage, steel, taupe…) carried by icon strokes on graphite tiles. SF system type, light-weight large figures.

STORY: She reads the month on the black card (spent, remaining, budget groove), sees the stamped REVISAR row for Wallet items, checks the week bars, adds an expense from the platinum disc.

FIRST VIEWPORT: large title Resumen with round settings control; Semana/Mes segmented; the black card (month, % in budget tone, ₡ figure engraved at ~50px, remaining line, budget groove, INGRESOS/BALANCE as card fields); stamped Wallet review row; week bars; recientes; tab bar with centred platinum add disc.

FORM: user-steered grounded direction «Tarjeta negra» (American Express–style black metal card), replacing the dealt «Maletín a medida» after the round; seed:8834a543dfbed23c

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
