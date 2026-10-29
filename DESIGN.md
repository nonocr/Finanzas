---
name: Finanzas personales (nombre por definir)
description: A colones-first personal money tracker built in the iOS dark system, at Apple Wallet / Health finish.
colors:
  blue: "#0a84ff"
  green: "#30d158"
  orange: "#ff9f0a"
  red: "#ff453a"
  yellow: "#ffd60a"
  pink: "#ff375f"
  purple: "#bf5af2"
  indigo: "#5e5ce6"
  teal: "#40c8e0"
  brown: "#ac8e68"
  gray: "#8e8e93"
  bg: "#000000"
  card: "#1c1c1e"
  card-2: "#2c2c2e"
  card-3: "#3a3a3c"
  segment-pill: "#636366"
  fill: "rgb(118 118 128 / 0.24)"
  fill-2: "rgb(118 118 128 / 0.36)"
  sep: "rgb(84 84 88 / 0.6)"
  label: "#ffffff"
  label-2: "rgb(235 235 245 / 0.6)"
  label-3: "rgb(235 235 245 / 0.3)"
typography:
  large-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: "41px"
    letterSpacing: "0.01em"
  amount-entry:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "52px"
    fontWeight: 700
    lineHeight: "60px"
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  amount-hero:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: "46px"
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  title1:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: "34px"
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
  tab-label:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 500
rounded:
  swatch: "3px"
  segment: "7px"
  tile: "8px"
  key: "10px"
  inner: "12px"
  card: "14px"
  full: "9999px"
spacing:
  hairline: "0.5px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  target: "44px"
components:
  button-filled:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.label}"
    typography: "{typography.headline}"
    rounded: "{rounded.inner}"
    padding: "0 20px"
    height: "50px"
  button-tinted:
    backgroundColor: "rgb(10 132 255 / 0.15)"
    textColor: "{colors.blue}"
    typography: "{typography.headline}"
    rounded: "{rounded.inner}"
    padding: "0 20px"
    height: "50px"
  button-destructive:
    backgroundColor: "rgb(255 69 58 / 0.15)"
    textColor: "{colors.red}"
    typography: "{typography.headline}"
    rounded: "{rounded.inner}"
    padding: "0 20px"
    height: "50px"
  button-plain:
    textColor: "{colors.blue}"
    typography: "{typography.body}"
    height: "44px"
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
  category-tile:
    textColor: "{colors.label}"
    rounded: "{rounded.tile}"
    size: "30px"
  chip:
    backgroundColor: "{colors.card-2}"
    textColor: "{colors.label}"
    typography: "{typography.subhead}"
    rounded: "{rounded.full}"
    padding: "6px 16px 6px 8px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.label}"
    textColor: "{colors.bg}"
  segmented:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.label-2}"
    typography: "{typography.footnote}"
    rounded: "9px"
    padding: "2px"
  segmented-selected:
    backgroundColor: "{colors.segment-pill}"
    textColor: "{colors.label}"
    rounded: "{rounded.segment}"
    height: "28px"
  keypad-key:
    backgroundColor: "{colors.card-2}"
    textColor: "{colors.label}"
    typography: "{typography.title3}"
    rounded: "{rounded.key}"
    height: "48px"
  keypad-key-active:
    backgroundColor: "{colors.card-3}"
  progress-bar:
    backgroundColor: "{colors.fill}"
    rounded: "{rounded.full}"
    height: "6px"
  tab-bar-add:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.label}"
    rounded: "{rounded.full}"
    size: "48px"
  toast:
    backgroundColor: "{colors.card-2}"
    textColor: "{colors.label}"
    typography: "{typography.subhead}"
    rounded: "{rounded.full}"
    padding: "10px 20px 10px 14px"
  sheet:
    backgroundColor: "{colors.card}"
    rounded: "12px 12px 0 0"
---

# Design System: Finanzas personales

## Overview

**Creative North Star: "The Wallet Pass, Kept Straight"**

This is the iOS dark system executed without a smuggled quirk: a pure black ground, grouped near-black cards, Apple system colors standing in for every category, SF system type with large bold titles, and money set in tabular numerals. The ambition is finish, not novelty. The reference bar is Apple Wallet and Apple Health in dark mode, and the measure of success is that nothing reads as web chrome: no browser-default controls, no misaligned figures, no generic dashboard furniture.

Density is phone-native (390px wide, one column, 16px gutters). Every screen opens with a large title, then a stack of rounded cards and inset grouped lists separated by hairlines. Color carries meaning, never decoration: blue is the one interactive voice, green/orange/red are the budget state, and the remaining system hues are category identity. Motion is quiet and physical: things slide, count, and blur-swap in place, and every motion collapses to an instant change under reduced motion.

Dark only, always. There is no light theme and no light-theme token.

**Key Characteristics:**
- Pure black ground (bg) with three stepped card greys for nesting; depth comes from tone, not shadow.
- Apple system colors map one-to-one to category keys c1 to c10.
- Large bold title per screen; amounts always tabular and bold.
- Inset grouped lists with 0.5px hairlines that start where the text starts.
- One budget color rule shared by every bar, label and banner.
- Translucent blurred tab bar with a centered blue add button.

## Colors

Apple's dark system palette, used literally: neutral greys for structure, one blue for action, and the rest of the system hues as category and state identity.

### Primary
- **System Blue** (blue): the single interactive color. Filled buttons, the tab bar add button, the active tab, plain text actions ("Ver todos", "Cancelar", "Guardar"), back links, focus rings, caret and selection, and the "Por revisar" Wallet marker.

### Secondary
- **System Green** (green): money in and budget health. Income figures, "Quedan" under 80%, toggles on, toast check.
- **System Orange** (orange): budget at or past 80%; the warning banner tint.
- **System Red** (red): budget at or past 100%, negative balance, destructive actions.

### Tertiary
- **Category hues** (orange, green, blue, brown, yellow, pink, purple, indigo, teal, gray as c1 to c10): category identity only, on icon tiles, donut segments, legend swatches and per-category bars. SVG consumers use the literal hex mirror in `CATEGORY_HEX` because `var()` does not always resolve there.

### Neutral
- **True Black** (bg): the page ground and the base of every screen.
- **Grouped Card** (card): all top-level cards, grouped lists, the sheet surface, the settings button.
- **Raised Card** (card-2): surfaces nested inside a card or sheet: keypad keys, chips, form groups, toast, skeletons, row press state.
- **Pressed Card** (card-3): pressed keypad keys, the date pill, the sheet grabber.
- **Segment Pill** (segment-pill): the selected thumb of segmented controls only.
- **Fill / Fill-2** (fill, fill-2): translucent tracks: segmented bar, progress track, search field, toggle off.
- **Separator** (sep): 0.5px hairlines in lists and the tab bar top edge.
- **Label / Label-2 / Label-3** (label, label-2, label-3): primary text; secondary text and metadata; placeholders, chevrons, zero amounts.

### Named Rules
**The One Budget Rule.** Every budget expression (progress bar, "Quedan" line, per-category bar, warning banner) uses one ratio rule: base color under 80%, orange from 80%, red at 100% and over. Never pick a budget color by hand.

**The One Blue Rule.** Blue means "you can act here". It is not a category accent on chrome, a heading color, or decoration.

**The Category Hue Rule.** System hues other than blue/green/orange/red as state belong to categories. A category's color appears only where that category is identified.

## Typography

**Display Font:** SF Pro via -apple-system (with BlinkMacSystemFont, Segoe UI, Roboto, system-ui)
**Body Font:** same stack
**Label/Mono Font:** same stack; system mono appears once, for the Wallet token string

**Character:** The platform's own type, at Apple's own text-style sizes. Hierarchy comes from weight (bold titles, semibold labels) and from the tabular amounts, never from a second family.

### Hierarchy
- **Large Title** (700, 34px/41px, 0.01em): one per screen, the screen name.
- **Amount Entry** (700, 52px/60px, -0.02em, tabular): the amount being typed in the add/edit sheet.
- **Amount Hero** (700, 40px/46px, -0.02em, tabular): the dominant spent figure on Resumen.
- **Title 1** (700, 28px/34px, tabular): totals in secondary summary cards (Presupuesto, Cuentas).
- **Title 3** (700, 20px/25px): section headers above grouped lists; keypad digits at 500.
- **Headline** (600, 17px/22px): button labels, sheet titles, income/balance figures.
- **Body** (400, 17px/22px): row titles, field labels and values, plain actions.
- **Subhead** (400 or 600, 15px/20px): row subtitles, chips, legend, card captions, toast.
- **Footnote** (13px/18px): metadata, list footers; at 600 uppercase as the iOS form-group header above pickers ("CATEGORÍA", "PAGADO CON").
- **Caption** (12px/16px): the donut center label.
- **Tab Label** (500, 10px): tab bar labels only.

### Named Rules
**The Tabular Money Rule.** Every amount uses tabular numerals and the shared colón formatter. No exceptions for small or secondary figures.

**The System Style Rule.** Use the named iOS text styles; do not invent intermediate sizes. The two amount roles are the only display sizes outside the iOS scale.

## Layout

Single column, max 576px (max-w-xl) centered, 16px side gutters. Screens start below the safe-area inset plus 12px; the large title row is followed by a 16px gap. Sections stack at 24px; the summary card and the Wallet row sit 12 to 20px apart. Content reserves the tab bar height (56px plus safe-area bottom) plus 32px at the bottom. Every tappable target is at least 44px tall. Section headers and list footers indent 16px to align with row text inside the card. Bottom sheets share the same max width and cap at the viewport height minus safe top minus 12px.

## Elevation & Depth

Tonal layering. Surfaces are flat at rest; depth is the step from bg to card to card-2 to card-3. Shadows appear only on things that genuinely float above the page.

### Shadow Vocabulary
- **Sheet lift** (`box-shadow: 0 -8px 30px rgb(0 0 0 / 0.5)`): the bottom sheet over its 60% black scrim.
- **Toast lift** (`box-shadow: 0 8px 24px rgb(0 0 0 / 0.5)`): the floating confirmation pill.
- **Add-button glow** (`box-shadow: 0 4px 14px rgb(10 132 255 / 0.35)`): the centered tab bar add button.
- **Thumb** (`box-shadow: 0 3px 8px rgb(0 0 0 / 0.12), 0 3px 1px rgb(0 0 0 / 0.04)`): the segmented pill; the toggle knob uses the same shape at 0.15/0.06.
- **Hairline** (`box-shadow: inset 0 -0.5px 0 var(--color-sep)`): row separators, and the tab bar top edge (inset 0 0.5px).

### Named Rules
**The Flat Card Rule.** Cards and grouped lists never carry a shadow. If a surface needs to read as nested, step it up one card grey.

**The Translucent Chrome Rule.** The tab bar is the only blurred surface: rgb(22 22 24 / 0.92) with saturate(180%) blur(20px).

## Shapes

Continuous, iOS-proportioned rounding stepping down as surfaces nest: cards at 14px, inner groups, buttons and sheet tops at 12px, keypad keys and fields at 10px, icon tiles at 27% of their size (8px at 30px), segmented thumb 7px inside a 9px track, legend swatches 3px. Pills (chips, toast, add button, progress bars, toggle) are fully round. The donut uses 3px gaps between segments with 2px softened corners. No borders anywhere except hairline separators.

## Components

### Buttons
- **Shape:** gently rounded (12px), at least 50px tall, 20px side padding, headline weight.
- **Filled:** white on blue, for the one primary action of a screen.
- **Tinted / Destructive:** blue or red at 15% fill with full-strength text; destructive is always tinted, never filled red.
- **Plain:** blue text in body size, 44px target; sheet nav bars use "Cancelar" (regular) and "Guardar" (semibold), disabled to label-3.
- **Press:** scale to 0.96 over 150ms (cubic-bezier(0.2, 0, 0, 1)); disabled at 40% opacity. Focus: 2px blue outline, 2px offset.

### Chips
- **Style:** fully round, card-2 fill, subhead semibold, 44px tall, leading 24px category tile or account glyph.
- **State:** selected inverts to white fill with black text. Chips scroll horizontally edge to edge under an uppercase footnote group header.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** card on bg; nested groups card-2 at 12px.
- **Shadow Strategy:** none (see The Flat Card Rule).
- **Internal Padding:** 16px.

### Inputs / Fields
- **Style:** iOS form rows inside a card-2 group: label left in body, value right-aligned, placeholder label-3, no visible field chrome. Dates show as a card-3 pill (8px) with the native picker layered invisibly on top. Search uses a fill field at 10px.
- **Focus:** blue caret; 2px blue focus ring for keyboard focus.
- **Toggle:** 51x31 iOS switch, green when on, fill-2 when off.

### Navigation
- **Tab bar:** fixed, translucent (see The Translucent Chrome Rule), 56px plus safe area, four tabs (24px line icons, 10px labels) split around a 48px blue add button. Active tab blue with heavier stroke (2.25 vs 1.75); inactive gray.
- **Segmented control:** fill track, sliding segment-pill thumb (250ms, cubic-bezier(0.22, 1, 0.36, 1)), footnote semibold labels.
- **Month nav:** card bar with blue back chevron and the month in headline centered.
- **Back link:** blue chevron plus "Ajustes" in body, sitting above the large title.

### Grouped List Row
Leading 30px category tile, body title with optional subhead subtitle, trailing value in label-2, optional label-3 chevron. Minimum 44px, separator starts at the text, last row has none, press state card-2.

### Category Tile
Rounded square in the category hue with a white Lucide line icon at 58% of the tile and 2.25 stroke, like iOS Settings icons. 30px in lists, 24px in chips.

### Bottom Sheet
card surface, 12px top corners, 36x5 card-3 grabber, three-column nav bar (cancel / title / save). Opens 500ms expo.out, closes faster at 300ms power3.in; scrim fades at 60% black. Escape and scrim tap close it. Quick-entry sheets (add/edit movement, budget amount) also close with a swipe down (`swipeToClose`): from the grabber/nav bar always, from the content only when it is scrolled to the top; the panel follows the finger, the scrim fades with it, and it closes past 28% of its height or on a downward flick, otherwise it springs back. Long forms where losing input hurts (account editor) use `dismissible={false}`: no swipe, no scrim tap, only Cancelar / Guardar / Escape. The page behind never scrolls or rubber-bands while a sheet is open.

### Amount Motion
Totals count to their new value with GSAP (600ms power3.out, rounded to whole colones); smaller figures blur-swap in place (200ms, 2px blur). Donut segments morph over 400ms. All motion is skipped under reduced motion.

### Toast
Fully round card-2 pill with a green check, 20px above the tab bar; enters 350ms, leaves 250ms with a 16px rise, 0.97 scale and 2px blur.

## Do's and Don'ts

### Do:
- **Do** open every screen with the Large Title (34px bold) and build below it with cards (14px) and grouped lists.
- **Do** route every budget color through the One Budget Rule (under 80% base, 80% orange, 100% red).
- **Do** set every amount in tabular numerals with the shared colón formatter.
- **Do** nest by stepping card greys (card, card-2, card-3) instead of adding shadows or borders.
- **Do** keep every tap target at least 44px and give pressable elements the 0.96 press scale.
- **Do** honor reduced motion: every slide, count, swap and morph becomes instant.

### Don't:
- **Don't** introduce a light theme or light surfaces.
- **Don't** use blue for anything that is not interactive or the Wallet review marker.
- **Don't** put shadows or borders on cards and lists; only floating layers (sheet, toast, add button, thumbs) cast shadow.
- **Don't** use browser-default controls; every control is an iOS-shaped component (segmented, switch, date pill, keypad).
- **Don't** place a text eyebrow above the large title; that slot holds only the back link.
- **Don't** pick category colors outside the c1 to c10 system hues.
