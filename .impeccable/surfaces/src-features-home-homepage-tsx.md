---
version: 1
slug: "src-features-home-homepage-tsx"
primary_target: "src/features/home/HomePage.tsx"
related_targets: ["src/App.tsx"]
---

# Inicio (dashboard) — app de finanzas personales

Scope: home screen of the PWA plus the shared shell (tab bar, add sheet) every other screen inherits. Mode: Operate. Phone-first (390×844), dark only.

Audience/job: the owner opens it on her iPhone to see how this week and this month are going, then logs a cash expense or clears Wallet payments waiting for review.

Constraints: colones only; dark always; Wallet inbox must be findable in one glance; quick add under five seconds.

## Direction contract

THESIS: The category standard, executed straight at Apple Wallet / Health finish. It refuses nothing about the category arrangement; it refuses sloppiness: misaligned numbers, generic web chrome, browser-default controls.

OWN-WORLD: iOS dark system: pure black ground, #1C1C1E grouped cards, system colors (green, blue, orange, purple, pink, teal) as category series, SF system type with large bold titles, tabular numerals, translucent blurred tab bar, inset grouped lists with hairline separators.

STORY: She sees money spent vs budget, knows what remains, scans categories, acts on pending Wallet items, adds an expense.

FIRST VIEWPORT: large title "Resumen", Semana/Mes segmented control, total spent as the dominant number with "quedan ₡X" in green below, a card with the category donut and its legend, a Wallet "por revisar" row when pending, recent movements list; floating translucent tab bar with a centered add button.

FORM: canon (category standard), chosen by the user after three rounds; reference products Apple Wallet and Apple Health. seed:de60ffb6a64943c1

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
