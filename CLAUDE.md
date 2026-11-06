# CLAUDE.md

App de finanzas personales en colones (web/PWA, y en camino a App Store y Google Play): gastos, ingresos, presupuesto y estadísticas, con registro automático de pagos de Apple Wallet en iPhone. Abierta a cualquiera: cada persona crea su cuenta y solo ve sus datos. La interfaz va en español de Costa Rica y en inglés.

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
- **Backend:** `supabase/migrations/` contiene tablas, RLS (`user_id = auth.uid()`), las vistas `account_balances` y `budget_progress`, y un trigger que crea categorías y efectivo para cada usuario nuevo. El Atajo de iOS usa `supabase/functions/wallet-sync`, que recibe la cola de pagos (NDJSON) y no duplica gracias a `external_id`. Topes: 200 pagos por envío y 200 pagos nuevos por usuario cada 24 h. **Android** (Ajustes → Registro automático, guía con MacroDroid): la misma función con `?formato=notificacion` recibe en texto plano UNA notificación de compra (título en la primera línea); `_shared/notification.ts` saca monto, comercio y tarjeta (ignora códigos, promociones, dinero recibido, rechazos y retiros) y `ingestPayment(..., { fromNotification: true })` la guarda siempre por revisar, con nota «Notificación · tarjeta», y toma como repetido otro pago con el mismo monto y tarjeta en 5 minutos (el banco y Google Wallet pueden avisar del mismo pago). Los formatos de los bancos están supuestos: cuando lleguen notificaciones reales, agrégalas a `supabase/tests/notificacion.test.ts`. La lógica vive en `_shared/ingest.ts`, autentica con un token personal hasheado y se despliega con `--no-verify-jwt`. (`wallet-ingest`, la versión de un pago por petición, se borró el 2026-11-04.)
- **Auth en producción:** las URLs de redirección son solo la de producción (`https://finanzas-nono-0784.vercel.app/`), sin comodines para versiones de prueba, porque un comodín dejaría que el enlace de recuperación terminara en otro dominio `*.vercel.app`. La base exige SSL.
- **Login:** correo y contraseña. No se usa enlace mágico porque en iPhone abriría Safari y no la PWA instalada.
  - **Crear cuenta** (`LoginPage`, modo `signup`): abierta a cualquiera, con confirmación de correo obligatoria (`mailer_autoconfirm=false`). El enlace del correo abre el navegador; la app NO usa la sesión que trae (`detectSessionInUrl` solo acepta `recovery`), solo muestra «Tu correo quedó confirmado» (`signupLinkNotice`) y se entra con correo y contraseña. Si el correo ya existía, Supabase responde igual (no revela quién tiene cuenta). Si falta confirmar, el login ofrece reenviar el correo.
  - **Eliminar cuenta** (Ajustes): función `delete_my_account(p_password)` (migración `20261106000000_borrar_cuenta`): pide la contraseña, respeta los dos pasos, 5 intentos cada 15 min, y borra el usuario de `auth.users` (todo lo demás cae en cascada). Devuelve un estado en vez de lanzar error, para que el contador de intentos no se deshaga.
  - **Privacidad:** `/privacidad` (`PrivacyPage`) es pública, con o sin sesión. Si cambia qué se guarda o con quién se comparte, actualízala.
  - **Correos:** salen por el Gmail de la dueña (SMTP, 30 por hora). Plantillas en español en `supabase/templates/`; `node scripts/correos.mjs` compara con producción y `--aplicar` las sube (solo con autorización).
  - **Olvidé mi contraseña:** el enlace del correo se abre en el navegador, que entra a `ResetPasswordPage` (evento `PASSWORD_RECOVERY`); ahí se pone la nueva, la sesión del navegador se cierra sola y luego se entra con ella en la app. El enlace vence a los 30 minutos.
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

## Idiomas

- **Ningún texto visible va escrito en un componente.** Cada texto vive en `src/i18n/locales/es/<área>.ts` (la fuente) y su traducción en `src/i18n/locales/en/<área>.ts`, con el mismo tipo: si falta una traducción, no compila. En componentes `const t = useT()` (antes de cualquier `return`); fuera de React `strings()`. Plurales y valores: funciones (`(n: number) => …`). Texto con formato: `<Rich text={…} />` con `**negrita**`, ` código ` y `[enlace](https://…)`.
- Fechas y montos con los helpers de `src/lib/dates.ts` y `src/lib/money.ts` (`formatCRC`, `formatNumber`), que siguen el idioma; nunca `new Intl.*('es-CR')` fijo. Fuera de esos helpers, `locale()` dentro del render.
- El idioma es una preferencia (`prefs.lang`: `auto` | `es` | `en`; Ajustes → Idioma) y se copia a `user_metadata.lang` (`syncAuthLang`): con él, los correos (plantillas con `{{ if eq (printf "%v" .Data.lang) "en" }}`) y las categorías iniciales de una cuenta nueva (`handle_new_user`, migración `20261108000000_idioma`) salen en ese idioma. Las pruebas corren en español.

## Diseño

- `PRODUCT.md` tiene la verdad del producto y `DESIGN.md` el sistema visual. Léelos antes de tocar la UI.
- Mundo visual: **«Tarjeta negra»**, el lujo discreto de una tarjeta de crédito negra de metal. Negros mate y grafitos en capas, **siempre en modo oscuro** (también en los temas). Los tokens están en `src/index.css` (`@theme`), junto con las utilidades `metal`, `machined`, `black-card` y `engraved`.
- **Temas «Tarjetas de metal»** (Ajustes → Tema): Negra, Carbono, Titanio, Oro, Oro rosa, Cobre, Sakura, Amatista, Zafiro y Esmeralda, todos oscuros. `src/lib/theme.ts` los aplica a `<html>` antes del primer pintado y se guardan en este teléfono (`finanzas-theme`).
  - Cada tema es una **receta en OKLCH** en `src/lib/themes.ts` (skill `oklch-skill`; cálculos en `src/lib/oklch.ts`). Todos comparten la misma escalera de claridad por papel y solo cambia el matiz; el croma va como % del máximo de ese matiz. No pongas colores a mano: ajusta la receta.
  - Ningún color de superficie, texto o acción va escrito literal en un componente: usa las variables (`bg-card`, `text-accent`, `var(--color-muted)`…) o las utilidades `metal`, `metal-disc`, `black-card`, `ring-metal`. Recharts lee los colores de `useTheme()`. Las gráficas no pintan series con el metal de la acción.
  - Los valores de Negra se repiten en `@theme` de `src/index.css`. Pruebas: `src/lib/themes.test.ts` (WCAG y APCA de cada tema, mismo contraste en todos, el metal lejos del ámbar, el rojo y el verde con significado) y `scripts/temas.test.mjs` (CSS, íconos y proyectos nativos al día).
  - En la app nativa, el ícono cambia con el tema mediante un plugin propio, `IconoApp`: `ios/App/App/IconoApp.swift` y `android/…/IconoAppPlugin.java` (en Android, un `activity-alias` por tema que se aplica al salir de la app). Para regenerar los íconos: `node scripts/temas-iconos.mjs` y luego `scripts/iconos.ps1`.
- **Preferencias** (Ajustes → Apariencia): tema, modo discreto y Resumen (qué secciones, en qué orden, qué cifra lleva la tarjeta). Se guardan en la cuenta (tabla `user_settings`, una fila con `prefs` jsonb; migración `20261107000000_preferencias`) y con copia local (`finanzas-prefs`) para aplicarlas antes del primer pintado. `src/lib/prefs.ts` define los tipos y `normalizePrefs` (valida y completa: una preferencia nueva no necesita migración); `src/lib/usePrefs.ts` tiene `usePrefs`, `useSavePrefs` y `PrefsSync`. Si la cuenta no tiene nada guardado, se sube lo que ya había en el teléfono.
  - **Modo discreto:** con `<html data-discreet>` se difuminan los `.tnum` fuera de las hojas; tocar uno los muestra un minuto. Toda cifra de dinero lleva `tnum`; las que no son dinero (conteos, horas, porcentajes, códigos) llevan además `not-money`.
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
