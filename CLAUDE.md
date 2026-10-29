# CLAUDE.md

App personal de finanzas (PWA para iPhone) en colones: gastos, ingresos, presupuesto y estadísticas, con registro automático de pagos de Apple Wallet. Una sola usuaria; la interfaz va en español de Costa Rica.

## Comandos

```bash
npm run dev        # Vite en http://localhost:5173
npm test           # Vitest (src/**/*.test.ts)
npm run build      # tsc -b + vite build (genera el service worker de la PWA)
npm run lint       # oxlint
```

Verifica con `npx tsc -b` y `npm test` antes de dar algo por terminado.

En esta máquina (Windows), git no está en el PATH de PowerShell. Antepón `$env:Path = "C:\Users\dpaniagua\AppData\Local\Programs\Git\cmd;" + $env:Path`.

## Arquitectura

- **Datos:** `src/lib/api.ts` define la interfaz `Api`. Hay dos implementaciones:
  - Supabase, cuando existen `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env.local`.
  - **Modo demo**, cuando no existen. Está en `src/lib/demoApi.ts`, guarda en localStorage y trae datos sintéticos.

  Los componentes nunca llaman a Supabase directo: usan los hooks de `src/lib/queries.ts` (React Query). Si cambias el esquema, actualiza las dos implementaciones y `src/lib/types.ts`.
- **Dinero:** siempre enteros en **céntimos**, de punta a punta. Formatea con `formatCRC` (`src/lib/money.ts`), que usa punto de miles y el signo menos U+2212. El parser `parseAmountToCents` vive en `supabase/functions/_shared/money.ts` porque lo comparten la app y la Edge Function.
- **Fechas:** se agrupan en hora de Costa Rica (UTC−6) con `src/lib/dates.ts`. Un "día" es un `Date` a medianoche UTC; `crDayStartInstant` lo convierte al instante real. La semana va de lunes a domingo, con las iniciales L M K J V S D.
- **Backend:** `supabase/migrations/` contiene tablas, RLS (`user_id = auth.uid()`), las vistas `account_balances` y `budget_progress`, y un trigger que crea categorías y efectivo para cada usuario nuevo. `supabase/functions/wallet-ingest` es el webhook del Atajo de iOS: autentica con un token personal hasheado y se despliega con `--no-verify-jwt`.
- **Login:** correo y contraseña. No se usa enlace mágico porque en iPhone abriría Safari y no la PWA instalada. No se usa código OTP porque el plan gratis no permite editar la plantilla del correo. La confirmación de correo es automática; cuando la dueña cree su cuenta, el registro se cierra (`disable_signup`).
- **Proyecto Supabase:** `qdrkbocandltwfvofngt` («Finanzas»), en una cuenta distinta a la de los proyectos de trabajo. **No uses el login global de la CLI**: está en la cuenta de trabajo. Usa el token de `supabase/.env.cli` (git lo ignora): `$env:SUPABASE_ACCESS_TOKEN=...` más `--project-ref`. Las migraciones se aplicaron con la Management API (`POST /v1/projects/{ref}/database/query`) y se registraron en `supabase_migrations.schema_migrations`.

## Diseño

- `PRODUCT.md` tiene la verdad del producto y `DESIGN.md` el sistema visual. Léelos antes de tocar la UI.
- Mundo visual: el estándar oscuro de iOS (referencia Apple Wallet y Salud), **siempre en modo oscuro**. Los tokens están en `src/index.css` (`@theme`). Las categorías guardan una clave `c1…c10` que `src/components/palette.tsx` traduce a colores.
- Reglas que no se rompen:
  - El azul es el único color de acción.
  - El presupuesto usa una sola regla de color: `budgetColor`/`budgetTone` en `src/components/ui.tsx`.
  - Los montos van con `tnum`.
  - Nada de etiquetas en mayúsculas encima de los títulos.
  - Usa los íconos de lucide; nada de emoji ni glifos Unicode.
- Movimiento: snippets de transitions.dev en `src/index.css` y GSAP (`useGSAP`) para la hoja inferior y el conteo de montos. Respeta `prefers-reduced-motion`.
- Skills del proyecto en `.claude/skills/`: `impeccable` (contexto en `.impeccable/`), `transitions-dev`, `gsap-*` y `make-interfaces-feel-better`.

## Capturas de verificación

Chrome headless tiene un ancho mínimo y no avanza las transiciones CSS en tiempo virtual. Para ver la app a 390×844 con tiempos reales, usa un script con el protocolo DevTools (emulación de dispositivo) en lugar de `--screenshot`.
