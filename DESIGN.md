---
name: Finanzas personales (nombre por definir)
description: A colones-first personal money tracker held like a private black metal card, dark only.
colors:
  bg: "#050505"
  card: "#111112"
  card-2: "#1b1b1d"
  card-3: "#29292c"
  black-card: "#0f0f10"
  groove: "#070708"
  fill: "rgb(150 150 160 / 0.14)"
  fill-2: "rgb(150 150 160 / 0.24)"
  sep: "#242427"
  label: "#ececef"
  label-2: "#9a9aa1"
  label-3: "#7c7c83"
  engraved: "#d6d6da"
  accent: "#dcdce0"
  on-accent: "#0a0a0b"
  steel: "#b4b4ba"
  green: "#a9bfae"
  orange: "#d4a04c"
  red: "#e0695a"
  blue: "#8497ab"
  indigo: "#7d86a8"
  teal: "#83a7a3"
  pink: "#ab8289"
  gray: "#85858b"
  c1-bronce: "#b28c62"
  c2-salvia: "#93a893"
  c3-acero-azul: "#8497ab"
  c4-topo: "#a08f7e"
  c5-champan: "#bcaa7a"
  c6-palo-de-rosa: "#ab8289"
  c7-lavanda: "#9187a6"
  c8-pizarra: "#73909e"
  c9-patina: "#83a7a3"
  c10-grafito: "#85858b"
typography:
  large-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: "41px"
    letterSpacing: "0.01em"
  amount-entry:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "56px"
    fontWeight: 300
    lineHeight: "62px"
    letterSpacing: "-0.035em"
    fontFeature: "tnum"
  amount-card:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "48px"
    fontWeight: 300
    lineHeight: "52px"
    letterSpacing: "-0.035em"
    fontFeature: "tnum"
  amount-hero:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 300
    lineHeight: "46px"
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  title3:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: "25px"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: "22px"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "22px"
  subhead:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "20px"
  footnote:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
  card-field:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "16px"
    letterSpacing: "0.12em"
  stamp:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: "14px"
    letterSpacing: "0.14em"
  tab-label:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
rounded:
  swatch: "3px"
  stamp: "4px"
  segment: "7px"
  tile: "8px"
  mini-card: "10px"
  inner: "12px"
  card: "14px"
  black-card: "18px"
  full: "9999px"
spacing:
  hairline: "0.5px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  card-inset: "20px"
  lg: "24px"
  target: "44px"
components:
  button-filled:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.headline}"
    rounded: "{rounded.inner}"
    padding: "0 20px"
    height: "50px"
  button-tinted:
    backgroundColor: "rgb(220 220 224 / 0.12)"
    textColor: "{colors.accent}"
    typography: "{typography.headline}"
    rounded: "{rounded.inner}"
    padding: "0 20px"
    height: "50px"
  button-destructive:
    backgroundColor: "rgb(224 105 90 / 0.15)"
    textColor: "{colors.red}"
    typography: "{typography.headline}"
    rounded: "{rounded.inner}"
    padding: "0 20px"
    height: "50px"
  button-plain:
    textColor: "{colors.accent}"
    typography: "{typography.body}"
    height: "44px"
  button-save-pill:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "36px"
  tab-bar-add:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.full}"
    size: "52px"
  black-card:
    backgroundColor: "{colors.black-card}"
    textColor: "{colors.label}"
    rounded: "{rounded.black-card}"
    padding: "20px 20px 16px"
  payment-mini-card:
    backgroundColor: "{colors.black-card}"
    textColor: "{colors.label-2}"
    typography: "{typography.footnote}"
    rounded: "{rounded.mini-card}"
    padding: "8px 10px"
    height: "64px"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.card}"
    padding: "16px"
  list-row:
    backgroundColor: "{colors.card}"
    textColor: "{colors.label}"
    typography: "{typography.body}"
    padding: "10px 16px"
    height: "44px"
  icon-plate:
    backgroundColor: "{colors.card-3}"
    rounded: "{rounded.tile}"
    size: "30px"
  category-key:
    backgroundColor: "{colors.card-3}"
    rounded: "{rounded.inner}"
    size: "44px"
  category-key-selected:
    backgroundColor: "{colors.fill-2}"
  stamp:
    textColor: "{colors.accent}"
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp}"
    padding: "1px 5px"
  segmented:
    backgroundColor: "{colors.card}"
    textColor: "{colors.label-2}"
    typography: "{typography.footnote}"
    rounded: "10px"
    padding: "2px"
  segmented-selected:
    backgroundColor: "{colors.card-3}"
    textColor: "{colors.label}"
    rounded: "{rounded.segment}"
    height: "32px"
  progress-groove:
    backgroundColor: "{colors.groove}"
    rounded: "{rounded.full}"
    height: "6px"
  toggle-on:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.full}"
    width: "51px"
    height: "31px"
  toggle-off:
    backgroundColor: "{colors.fill-2}"
  toast:
    backgroundColor: "{colors.card-2}"
    textColor: "{colors.label}"
    typography: "{typography.subhead}"
    rounded: "{rounded.full}"
    padding: "10px 20px 10px 14px"
  sheet:
    backgroundColor: "{colors.card}"
    rounded: "14px 14px 0 0"
---

# Design System: Finanzas personales

## Overview

**Creative North Star: "Tarjeta negra"**

The month is a private black metal card held in the hand, not a dashboard tile. The ground is a near-black matte (bg), surfaces are layered graphites, and the one light thing on the screen is platinum: a polished light-metal fill with near-black text that marks every action. Figures are set light-weight and engraved into the metal, with the colón sign stepped back as a quiet secondary mark so the number leads. Raised surfaces carry a machined edge: a 1px light catch on top and a hairline ring around.

Colour is withheld until it means something. Budget state (steel, amber, red) and income (sage green) are the only meaningful hues; categories get low-chroma tints (bronze, sage, steel, taupe, champagne…) carried only by icon strokes on graphite plates and by chart segments. The structure under the metal is still the iOS grouped-list grammar: large titles, inset grouped lists with hairlines, a translucent tab bar, bottom sheets, 44px targets. Motion is quiet and physical (slide, count, blur-swap) and collapses to instant under reduced motion.

Dark only, always. There is no light theme and no light-theme token. The world explicitly refuses the category's saturated system colours and colour-filled icon tiles.

**Key Characteristics:**
- Matte near-black ground with a graphite ladder (card, card-2, card-3) for nesting.
- Platinum is the single action colour: filled buttons, the add disc, plain text actions, focus ring, caret, toggles on, the selected ring.
- The black card is the signature surface: brushed matte gradient, machined edges, engraved figures, card-field labels.
- Light-weight engraved tabular figures with a quiet ₡.
- Category colour lives in the icon stroke, never as a filled tile.
- One budget colour rule shared by every bar, percentage and "Quedan" line.

## Colors

Graphite and platinum, with colour reserved for meaning and kept at low chroma so it sits beside the metal instead of shouting over it.

### Primary
- **Platinum** (accent): the single action colour. Filled buttons and the sheet "Guardar"/"Confirmar" pill (as a polished metal gradient), the centred add disc, plain text actions ("Ver todos", "Cancelar", "Definir un presupuesto"), month-nav chevrons, back link, focus ring and caret, toggle on, the selected ring on category keys and payment cards, today's bar in the week chart, the Wallet glyph, the REVISAR stamp text.
- **Near-Black Ink** (on-accent): text and icons sitting on platinum.

### Secondary
- **Steel** (steel): budget progress under 80 % and its percentage/"Quedan" tone.
- **Amber** (orange): budget at or past 80 %; the warning banner tint.
- **Oxide Red** (red): budget at or past 100 %, negative balance, destructive actions, error toast.
- **Sage** (green): money in. Income figures and bars, the success toast check, the ingreso amount entry, positive month-over-month change.

### Tertiary
- **Category tints** (c1-bronce to c10-grafito): category identity only, on icon strokes, donut segments, legend swatches and per-category bars. One literal hex set serves CSS, SVG and Recharts.
- **Account-type tints** (blue, indigo, teal, pink, gray): the icon stroke of account rows by type (débito, crédito, banco, ahorro) and neutral utility plates.

### Neutral
- **Matte Black** (bg): the page ground.
- **Graphite** (card): grouped lists, plain cards, the sheet surface, the segmented track, month nav.
- **Raised Graphite** (card-2): form groups and toast inside a sheet, row press state, skeletons.
- **Plate Graphite** (card-3): icon plates, category keys, the segmented thumb, the date pill, the sheet grabber.
- **Black Card Metal** (black-card): the base of the brushed black-card gradient (see Elevation).
- **Groove Black** (groove): the recessed track of every progress bar.
- **Translucent Fills** (fill, fill-2): future-day bars, toggle off, selected category key, disabled save pill.
- **Separator** (sep): hairlines and the machined ring.
- **Label / Label-2 / Label-3** (label, label-2, label-3): primary text; secondary text and metadata; placeholders, chevrons, inactive weekday initials.
- **Engraved Silver** (engraved): figures cut into metal (card amounts, card fields, last-four digits, the amount being typed).

### Named Rules
**The Platinum Rule.** Platinum means "you can act here" (or "this is selected / today"). It is never a heading colour, a category accent or decoration, and no other hue ever marks an action.

**The One Budget Rule.** Every budget expression uses one ratio rule: steel under 80 %, amber from 80 %, red at 100 % and over. Never pick a budget colour by hand; route it through the shared budget colour/tone helpers.

**The Stroke-Only Tint Rule.** Category and account tints colour an icon's stroke on a graphite plate, a chart segment, or a 10px legend swatch. They never fill a tile, a row or a card.

## Typography

**Display Font:** SF Pro via -apple-system (with BlinkMacSystemFont, Segoe UI, Roboto, system-ui)
**Body Font:** same stack
**Label/Mono Font:** same stack

**Character:** The platform's own type at Apple's text-style sizes, with one deliberate move: large money figures go light (300) and tight, engraved rather than bold, so they read like numerals cut into a card.

### Hierarchy
- **Large Title** (700, 34px/41px, 0.01em): one per screen, the screen name.
- **Amount Entry** (300, 56px/62px, -0.035em, tabular): the amount being typed in the add/edit sheet, with a 34px label-2 ₡ beside it.
- **Amount Card** (300, 48px/52px, -0.035em, tabular, engraved): the spent figure on the Resumen black card.
- **Amount Hero** (300, 40px/46px, -0.03em, tabular, engraved): the lead figure on the Estadísticas, Presupuesto and Cuentas summary cards.
- **Title 3** (700, 20px/25px): section headers above grouped lists; the daily average.
- **Headline** (600, 17px/22px): button labels, sheet titles, card titles, month name, card-field values (at 500).
- **Body** (400, 17px/22px): row titles, field labels and values, plain actions.
- **Subhead** (400 or 600, 15px/20px): row subtitles, group labels in sheets, legend, budget percentage, toast.
- **Footnote** (13px/18px): metadata, list footers, segmented labels (600), payment-card names (600).
- **Caption** (12px/16px): donut centre label, weekday initials (600), category key names.
- **Card Field** (600, 12px, 0.12em, uppercase): the field labels on the black card only ("INGRESOS", "BALANCE"), like the printed fields of a bank card.
- **Stamp** (700, 10px/14px, 0.14em, uppercase): the status stamp only ("REVISAR").
- **Tab Label** (500 inactive / 600 active, 11px): tab bar labels only.

### Named Rules
**The Tabular Money Rule.** Every amount uses tabular numerals and the shared colón formatter. No exceptions for small or secondary figures.

**The Quiet Colón Rule.** On large non-negative engraved figures the ₡ is set at 0.6em in a muted grey with no engraving, so the digits lead. Signed amounts keep the ₡ inline with the sign.

**The Engraved Light Rule.** Display figures are light (300), never bold; their weight comes from the engraving (dark cut above, faint light catch below), not from stroke thickness.

## Layout

Single column, max 576px centred, 16px side gutters. Screens start at the safe-area inset plus 12px; the large-title row is followed by a 16px gap. The black card sits 20px below the segmented control (16px below month nav); the Wallet row follows 12px under it; sections stack at 24px. Black cards pad 20px on the sides, 20px top and 16px bottom; plain cards pad 16px. Content reserves the tab bar height (56px plus safe-area bottom) plus 32px. Every tappable target is at least 44px. Section headers and list footers indent 16px to align with row text. Bottom sheets share the max width and cap at viewport height minus safe top minus 12px. Inside the add sheet, categories lay out as a 4-column grid (all visible, no horizontal scroll) and payment methods as a 3-column grid of mini black cards.

## Elevation & Depth

Hybrid: tonal layering for structure, plus a physical metal vocabulary of inset highlights and soft drop shadows for raised and machined surfaces. Grouped lists and plain cards stay flat in tone but carry the machined edge; the black card, platinum controls and floating layers cast real shadow.

### Shadow Vocabulary
- **Machined edge** (`box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.06), 0 0 0 1px var(--color-sep)`): grouped-list cards and the Wallet review row.
- **Black card** (`box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.1), inset 0 -1px 0 rgb(0 0 0 / 0.8), 0 10px 28px rgb(0 0 0 / 0.55), 0 0 0 1px #232326`; background `repeating-linear-gradient(100deg, rgb(255 255 255 / 0.012) 0 1px, transparent 1px 3px), linear-gradient(155deg, #1c1c1e 0%, #0e0e0f 55%, #121213 100%)`): the black card and the payment mini cards.
- **Platinum metal** (`background-image: linear-gradient(180deg, #f3f3f5, #c8c8cd); box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.85), inset 0 -1px 0 rgb(0 0 0 / 0.18), 0 2px 6px rgb(0 0 0 / 0.5)`): filled buttons and the save pill.
- **Add disc** (`background: radial-gradient(120% 120% at 30% 20%, #ffffff 0%, #d7d7db 45%, #a9a9ae 100%); box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.8), inset 0 -2px 3px rgb(0 0 0 / 0.25), 0 6px 16px rgb(0 0 0 / 0.6), 0 0 0 1px #000`): the centred tab bar add button.
- **Engraving** (`text-shadow: 0 -1px 0 rgb(0 0 0 / 0.9), 0 1px 0 rgb(255 255 255 / 0.07)`): figures cut into metal.
- **Groove** (`box-shadow: inset 0 1px 1px rgb(0 0 0 / 0.9), 0 1px 0 rgb(255 255 255 / 0.05)`): every progress track.
- **Plate catch** (`box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.06)`): icon plates and category keys.
- **Segment thumb** (`box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.07), 0 1px 3px rgb(0 0 0 / 0.6)`): the segmented control's sliding thumb.
- **Sheet lift** (`box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.07), 0 -10px 30px rgb(0 0 0 / 0.6)`): the bottom sheet over its 60 % black scrim.
- **Toast lift** (`box-shadow: 0 8px 24px rgb(0 0 0 / 0.5)`): the floating confirmation pill.
- **Hairline** (`box-shadow: inset 0 -0.5px 0 var(--color-sep)`): row separators; the tab bar top edge uses `inset 0 1px 0`.

### Named Rules
**The Machined Edge Rule.** A raised surface shows its edge as light from above: a 1px inner highlight on top and a hairline ring or dark lower lip. Depth never comes from a hard offset shadow or a coloured glow.

**The Translucent Chrome Rule.** The tab bar is the only blurred surface: rgb(7 7 8 / 0.92) with blur(20px).

## Shapes

Continuous iOS-proportioned rounding that steps down as surfaces nest: the black card at 18px, grouped cards and the sheet top at 14px, buttons, inner groups and category keys at 12px, segmented track and payment mini cards at 10px, icon plates at 28 % of their size (8px at 30px), date pill 8px, segmented thumb 7px, the stamp 4px, legend swatches 3px. Pills (toast, add disc, save pill, progress grooves, toggle) are fully round. Week bars round 5px on top and 2px at the base; donut segments keep 3px gaps with 2px softened corners. No drawn borders except hairlines, the machined ring, and the stamp's 1px inset outline.

## Components

### Buttons
Polished, pressable metal.
- **Shape:** gently rounded (12px), at least 50px tall, 20px side padding, headline weight.
- **Filled:** platinum metal gradient with near-black text, for the one primary action of a screen; disabled drops the shadow and goes to 40 % opacity.
- **Tinted / Destructive:** platinum or red at 12–15 % fill with full-strength text; destructive is always tinted, never filled red.
- **Plain:** platinum text in body size, 44px target.
- **Sheet save pill:** 36px fully round platinum metal pill ("Guardar" / "Confirmar"); disabled becomes a flat fill with label-3 text.
- **Press:** scale to 0.96 over 150ms (cubic-bezier(0.2, 0, 0, 1)). Focus: 2px platinum outline, 2px offset.

### Cards / Containers
- **Corner Style:** 14px for grouped lists and plain cards; 18px for the black card.
- **Background:** card (graphite) for lists; brushed black-card metal for the signature summary.
- **Shadow Strategy:** machined edge on lists; full black-card vocabulary on the signature card (see Elevation).
- **Internal Padding:** 16px plain; 20px sides / 20px top / 16px bottom on the black card.

### Inputs / Fields
- **Style:** iOS form rows inside a card-2 group (12px): label left in body, value right-aligned, placeholder label-3, no visible field chrome. Dates show as a card-3 pill (8px) with the native picker layered invisibly on top.
- **Amount entry:** centred light 56px tabular figure with a 34px label-2 ₡; empty is label-3, typed is engraved silver, income is sage.
- **Focus:** platinum caret; 2px platinum focus ring for keyboard focus.
- **Toggle:** 51×31 switch, platinum when on, fill-2 when off, white 27px knob.

### Navigation
- **Tab bar:** fixed, translucent, 56px plus safe area, four tabs (23px lucide line icons, 11px labels) split around the 52px platinum add disc. Active tab label colour with heavier stroke (2 vs 1.6) and semibold label; inactive label-2.
- **Segmented control:** graphite track with machined ring, sliding card-3 thumb (250ms, cubic-bezier(0.22, 1, 0.36, 1)), footnote semibold labels, arrow-key navigation.
- **Month nav:** graphite card bar with platinum chevrons in 44px targets and the month in headline centred.
- **Back link:** platinum chevron plus "Ajustes" in body, sitting above the large title.

### Black Card (signature)
The month as a card. Headline title left and budget percentage right (subhead semibold in the budget tone), the engraved Amount Card figure with a quiet ₡, a label-2 "Quedan … de …" line, the progress groove, then two card fields ("INGRESOS", "BALANCE") with engraved headline values; a negative balance turns red. Reused, without card fields, as the Presupuesto total (a pressable button) and the Cuentas net-worth card, and as the login mark.

### Payment Mini Card
Each payment method in the add sheet is a 64px black card in miniature (10px corners): account icon and name in footnote semibold at the top, last four digits engraved in caption with 0.08em tracking at the bottom. Selected adds a 1.5px platinum ring and lifts icon and name to platinum/label.

### Icon Plate and Category Key
A graphite (card-3) plate with a top catch; the lucide line icon at 56 % of the plate, stroke 1.9, coloured by the category or account tint. 30px in lists, 36px on the Wallet row. In the add sheet, categories are 44px keys (12px) in a 4-column grid with a caption name below; selected moves to fill-2 with a 2px card gap and a 1.5px platinum ring, and unselected keys dim to 50 %.

### Stamp
A small engraved status mark inline before a line of text: 10px bold uppercase, 0.14em tracking, platinum text inside a 1px label-2 inset outline at 4px corners ("REVISAR"). It carries state in words so it never depends on colour alone.

### Progress Groove
A 6px recessed groove-black track with an inner shadow; the fill is fully round and coloured only by the One Budget Rule, easing over 500ms (cubic-bezier(0.22, 1, 0.36, 1)).

### Grouped List Row
Leading plate, body title with optional subhead subtitle, trailing value in label-2, optional label-3 chevron. Minimum 44px, separator starts at the text, last row has none, press state card-2.

### Bottom Sheet
Graphite surface, 14px top corners, 36×5 card-3 grabber, three-column nav bar (Cancelar / title / save pill). Opens 500ms expo.out, closes at 300ms power3.in; scrim fades at 60 % black. Entry sheets close with a swipe down from the grabber or from content scrolled to top (past 28 % of height or on a downward flick, otherwise spring back). Form sheets never autofocus a field on open, except the new-entry amount; the page behind never scrolls while a sheet is open.

### Amount Motion
Totals count to their new value with GSAP (600ms power3.out, rounded to whole colones); smaller figures blur-swap in place (200ms, 2px blur). Donut segments morph over 400ms. All motion is skipped under reduced motion.

### Toast
Fully round card-2 pill, subhead semibold, sage check or red alert icon; enters 350ms, leaves 250ms with a 16px rise, 0.97 scale and 2px blur.

## Do's and Don'ts

### Do:
- **Do** open every screen with the Large Title (34px bold) and build below it with machined graphite cards (14px) and grouped lists.
- **Do** make platinum the only action colour: filled metal buttons, plain platinum text, platinum focus ring and selection rings.
- **Do** route every budget colour through the One Budget Rule (steel under 80 %, amber from 80 %, red from 100 %).
- **Do** set large figures light (300) and engraved, tabular, with the quiet ₡ on non-negative totals.
- **Do** colour categories through the icon stroke on a graphite plate, using the c1–c10 tints.
- **Do** keep every tap target at least 44px and give pressable elements the 0.96 press scale.
- **Do** honour reduced motion: every slide, count, swap and morph becomes instant.

### Don't:
- **Don't** introduce a light theme or light surfaces other than platinum controls.
- **Don't** use a saturated system colour (iOS blue, green, orange) anywhere; the state and tint values are deliberately low-chroma.
- **Don't** fill an icon tile, row or card with a category colour.
- **Don't** set display figures bold or give them a coloured glow; weight comes from engraving.
- **Don't** use hard offset shadows; depth is the machined edge, inner highlights and soft black drop shadows.
- **Don't** place an uppercase label above a screen or section title; uppercase tracked text is limited to black-card field labels and the stamp.
- **Don't** use emoji or Unicode glyphs as icons; use lucide line icons.
