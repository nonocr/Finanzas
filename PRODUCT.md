# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
React + Vite + TypeScript, Tailwind CSS, PWA (`vite-plugin-pwa`), Supabase (Postgres + Auth + Edge Functions), hosting on Vercel. Motion with GSAP and transitions.dev tokens. A native iOS app (Expo / React Native) is a later phase that reuses the same backend.

## Users
A single person in Costa Rica (the owner) who tracks her personal money. She mostly uses it on her iPhone, often right after paying for something, and sometimes on a PC to review.

## Product Purpose
Record and monitor personal spending by payment method (cash, debit, credit card), income, and a monthly budget, then understand the month at a glance through statistics. Success means she always knows how this month and this week are going without doing any arithmetic.

## Positioning
A personal, colones-first tracker whose Apple Wallet payments arrive by themselves through an iOS Shortcuts "Transaction" automation. Manual entry is only needed for cash and non-Wallet card purchases.

## Operating Context
- Installed on the iPhone home screen as a PWA; must feel like an app (standalone, no browser chrome).
- Wallet payments come in through a webhook and land in a "por revisar" inbox when the category can't be inferred.
- Quick entry happens standing in a store or right after paying: one hand, a few seconds.
- The first thing she wants on open: **statistics for the current month and/or week** (spending by category, trend, vs budget).

## Capabilities and Constraints
- Currency: Costa Rican colones (₡) only. Amounts stored as integer céntimos.
- Single user, data in the cloud, private (row-level security).
- Accounts types: efectivo, débito, crédito, banco, ahorro. Credit cards have cut-off and payment days.
- Transactions: gasto, ingreso, transferencia (including credit card payments).
- Monthly budgets per category and in total; recurring income and expenses.
- UI language: Spanish (Costa Rica).
- Undecided: product name (placeholder until chosen).

## Brand Commitments
- Chosen by the owner (2026-10-30): the «Tarjeta negra» direction, black and grey like an exclusive black metal card (matte black, layered graphite, platinum as the single action colour).
- Quality bar: the finish of a black metal card. Native-feeling grouped lists, SF system type, large titles, graphite surfaces, platinum as the only action colour, engraved light figures, translucent tab bar.

## Evidence on Hand
No real data, logos or brand assets yet. Do not fabricate testimonials or sample "success" claims.

## Product Principles
1. The month and the week at a glance come first; every number answers "how am I doing?"
2. Logging a cash expense must take under five seconds.
3. Automatic beats manual: anything Wallet can capture should never need typing.
4. Money is shown precisely and consistently (₡, tabular numerals, no rounding surprises).
5. Private by default: nothing leaves her account.

## Accessibility & Inclusion
Dark mode always, never light. WCAG AA contrast in that dark theme. Comfortable touch targets for one-handed use; respect reduced-motion preferences.
