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
  - Supabase, cuando existen `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`) en `.env.local`. Las claves antiguas `anon`/`service_role` (JWT HS256) están desactivadas y el secreto HS256 revocado: usa solo las claves nuevas (`sb_publishable_`/`sb_secret_`).
  - **Modo demo**, cuando no existen. Está en `src/lib/demoApi.ts`, guarda en localStorage y trae datos sintéticos.

  Los componentes nunca llaman a Supabase directo: usan los hooks de `src/lib/queries.ts` (React Query). Si cambias el esquema, actualiza las dos implementaciones y `src/lib/types.ts`.
- **Dinero:** siempre enteros en **céntimos**, de punta a punta. Formatea con `formatCRC` (`src/lib/money.ts`), que usa punto de miles y el signo menos U+2212. El parser `parseAmountToCents` vive en `supabase/functions/_shared/money.ts` porque lo comparten la app y la Edge Function.
- **Dólares:** `amount` siempre son colones; un pago en US$ guarda además `original_currency`/`original_amount`/`fx_rate` (los tres o ninguno). El tipo de cambio es el de venta del BCCR, sacado de la API pública de Hacienda (`supabase/functions/_shared/fx.ts`, compartido con wallet-sync; la CSP permite `api.hacienda.go.cr`).
- **Fijos (recurrentes):** tabla `recurring`. `src/lib/recurring.ts` registra los cobros vencidos al abrir la app (`RecurringRunner`), con un id derivado de (recurrente, fecha) e `insert … on conflict do nothing`: nunca duplica. `anchor_day` hace que un cobro del 31 vuelva al 31 después de febrero.
- **Fechas:** se agrupan en hora de Costa Rica (UTC−6) con `src/lib/dates.ts`. Un "día" es un `Date` a medianoche UTC; `crDayStartInstant` lo convierte al instante real. La semana va de lunes a domingo, con las iniciales L M K J V S D.
- **Backend:** `supabase/migrations/` contiene tablas, RLS (`user_id = auth.uid()`), las vistas `account_balances` y `budget_progress`, y un trigger que crea categorías y efectivo para cada usuario nuevo. El Atajo de iOS usa `supabase/functions/wallet-sync`, que recibe la cola de pagos (NDJSON) y no duplica gracias a `external_id`. Topes: 200 pagos por envío y 200 pagos nuevos por usuario cada 24 h. La lógica vive en `_shared/ingest.ts`, autentica con un token personal hasheado y se despliega con `--no-verify-jwt`. (`wallet-ingest`, la versión de un pago por petición, se borró el 2026-11-04.)
- **Auth en producción:** las URLs de redirección son solo la de producción (`https://finanzas-nono-0784.vercel.app/`), sin comodines para versiones de prueba, porque un comodín dejaría que el enlace de recuperación terminara en otro dominio `*.vercel.app`. La base exige SSL.
- **Login:** correo y contraseña. No se usa enlace mágico porque en iPhone abriría Safari y no la PWA instalada. No se usa código OTP porque el plan gratis no permite editar la plantilla del correo. La confirmación de correo es automática; cuando la dueña cree su cuenta, el registro se cierra (`disable_signup`).
  - **Olvidé mi contraseña:** el enlace del correo se abre en Safari, que entra a `ResetPasswordPage` (evento `PASSWORD_RECOVERY`); ahí se pone la nueva, la sesión de Safari se cierra sola y luego se entra con ella en la PWA. El enlace vence a los 30 minutos.
  - **Dos pasos (TOTP):** opcional desde Ajustes → Seguridad (`TwoFactorSheet`, `src/lib/mfa.ts`). La migración `20261102000000_mfa` lo exige también en la base: con un factor verificado, una sesión `aal1` no ve ni escribe nada.
- **Actualizaciones de la PWA:** el service worker nuevo queda en espera (`registerType: 'prompt'`) y `src/lib/appUpdate.ts` lo activa y recarga la página en cuanto no estorba: sin hojas abiertas (`Sheet` lo retiene) ni cambios en camino (`updateGate.ts`). También busca versión nueva al volver a la app. Así basta abrirla una vez.
- **Apps nativas (Capacitor 8, rama `feature/tiendas-multiusuario`):** la misma app web, envuelta para App Store y Google Play. `capacitor.config.ts` + carpetas `ios/` (Swift Package Manager, sin CocoaPods) y `android/`. `npm run cap:sync` compila y copia `dist/` a las dos. Lo que cambia dentro de la app nativa vive en `src/lib/native.ts` (`isNative`, `platform`):
  - Sin service worker: `appUpdate.ts` no corre; las versiones llegan por la tienda.
  - La sesión de Supabase va a `@capacitor/preferences` (iOS puede borrar el `localStorage` del WebView).
  - «Olvidé mi contraseña» redirige a la web de producción (`WEB_APP_URL`): la app nativa no tiene dirección propia.
  - Android: el botón Atrás cierra la hoja abierta (le manda Escape a `Sheet`), luego navega atrás y en la raíz manda la app al fondo. De borde a borde con `EdgeToEdge` + `SystemBars` (`insetsHandling: 'native'`), así `env(safe-area-inset-*)` funciona igual que en iPhone. Sin respaldo en la nube (`allowBackup=false`).
  - iOS: solo iPhone y vertical, mínimo iOS 16.4 (lo que pide Tailwind 4), interfaz en español y siempre oscura.
  - Íconos y pantalla de carga: fuentes en `assets/`, se regeneran con `npx @capacitor/assets generate` (borra luego `icons/` y `public/manifest.webmanifest`, que crea para la PWA y no se usan).
  - El `appId` (`com.nonocr.finanzas`) es provisional hasta la primera subida a una tienda.
  - Compilación en la nube: `.github/workflows/apps.yml` (APK de prueba y build de simulador iOS, sin firmar). En Windows no hay Xcode ni JDK: no se compila local.
- **Proyecto Supabase:** `qdrkbocandltwfvofngt` («Finanzas»), en una cuenta distinta a la de los proyectos de trabajo. **No uses el login global de la CLI**: está en la cuenta de trabajo. Usa el token de `supabase/.env.cli` (git lo ignora): `$env:SUPABASE_ACCESS_TOKEN=...` más `--project-ref`. Las migraciones se aplicaron con la Management API (`POST /v1/projects/{ref}/database/query`) y se registraron en `supabase_migrations.schema_migrations`.

## Diseño

- `PRODUCT.md` tiene la verdad del producto y `DESIGN.md` el sistema visual. Léelos antes de tocar la UI.
- Mundo visual: **«Tarjeta negra»**, el lujo discreto de una tarjeta de crédito negra de metal. Negros mate y grafitos en capas, **siempre en modo oscuro** (también en los temas). Los tokens están en `src/index.css` (`@theme`), junto con las utilidades `metal`, `machined`, `black-card` y `engraved`.
- **Temas «Tarjetas de metal»** (Ajustes → Tema): Negra, Titanio, Oro, Oro rosa, Zafiro y Esmeralda, todos oscuros. Están en `src/lib/themes.ts` y `src/lib/theme.ts` los aplica a `<html>` antes del primer pintado. Se guardan en este teléfono (`finanzas-theme`).
  - Ningún color de superficie, texto o acción va escrito literal en un componente: usa las variables (`bg-card`, `text-accent`, `var(--color-muted)`…) o las utilidades `metal`, `metal-disc`, `black-card`, `ring-metal`. Recharts lee los colores de `useTheme()`.
  - Si cambias los valores de Negra, cámbialos también en `@theme` de `src/index.css`. `scripts/temas.test.mjs` comprueba que cuadren y `src/lib/themes.test.ts`, el contraste AA de cada tema.
  - En la app nativa, el ícono cambia con el tema mediante un plugin propio, `IconoApp`: `ios/App/App/IconoApp.swift` y `android/…/IconoAppPlugin.java` (en Android, un `activity-alias` por tema que se aplica al salir de la app). Los íconos se dibujan con `scripts/iconos.ps1`.
- Las categorías guardan una clave `c1…c10` que `src/components/palette.tsx` traduce a tintes de baja saturación (bronce, salvia, acero…). El tinte vive solo en el trazo del ícono, sobre una placa de grafito (`CategoryIcon`/`IconTile`).
- Reglas que no se rompen:
  - El **platino** (`accent`, utilidad `metal`), o el metal del tema elegido, es el único color de acción, con texto casi negro encima.
  - El color solo aparece donde significa algo: el estado del presupuesto, los ingresos y el tinte de la categoría.
  - El presupuesto usa una sola regla de color (acero bajo el 80 %, ámbar desde el 80 % y rojo desde el 100 %): `budgetColor`/`budgetTone` en `src/components/ui.tsx`.
  - Los estados se marcan con el sello `Stamp` («Revisar»), no solo con color.
  - Las cifras grandes van grabadas y en peso fino, con el ₡ como marca secundaria (`AnimatedAmount quietCurrency` o `QuietColon`).
  - Los montos van con `tnum`.
  - Nada de etiquetas en mayúsculas encima de los títulos.
  - Usa los íconos de lucide; nada de emoji ni glifos Unicode.
- Movimiento: snippets de transitions.dev en `src/index.css` y GSAP (`useGSAP`) para la hoja inferior y el conteo de montos. Respeta `prefers-reduced-motion`.
- Skills del proyecto en `.claude/skills/`: `impeccable` (contexto en `.impeccable/`), `transitions-dev`, `gsap-*` y `make-interfaces-feel-better`.

## Capturas de verificación

Chrome headless tiene un ancho mínimo y no avanza las transiciones CSS en tiempo virtual. Para ver la app a 390×844 con tiempos reales, usa un script con el protocolo DevTools (emulación de dispositivo) en lugar de `--screenshot`.

`node scripts/capturas.mjs <carpeta> [url]` hace eso. Captura iPhone SE, iPhone, Pro Max, horizontal, iPad y escritorio, y en cada pantalla mide el desborde horizontal, los táctiles de menos de 44 px y el texto de menos de 12 px. Úsalo contra un servidor con `VITE_DEMO=1`, para que las capturas no tengan datos reales.
