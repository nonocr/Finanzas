# Finanzas

App de finanzas personales en colones: gastos, ingresos, presupuesto mensual y estadísticas, con registro automático de pagos. Cualquiera puede crear su cuenta (correo y contraseña, con confirmación por correo) y cada persona solo ve sus datos. La interfaz está en español de Costa Rica y en inglés.

Funciona como PWA (se instala desde el navegador) y como app nativa para iPhone y Android con Capacitor, en camino a App Store y Google Play.

## Qué hace

- **Movimientos** en efectivo y tarjeta, en colones o en dólares (con el tipo de cambio de venta del BCCR).
- **Presupuesto** por categoría y **estadísticas** de la semana, el mes y los últimos 6 meses.
- **Fijos:** cobros e ingresos que se repiten y se registran solos.
- **Registro automático** (Ajustes → Registro automático):
  - **iPhone:** una automatización de Atajos envía cada pago de Apple Wallet.
  - **Android:** MacroDroid reenvía la notificación de compra del banco.

  Los dos llegan a `wallet-sync`, que interpreta el monto, reconoce la tarjeta, asigna la categoría según las reglas de comercios y no duplica. Lo que no logra clasificar queda **por revisar**.
- **Personalización:** diez temas «Tarjetas de metal» (el ícono de la app nativa cambia con el tema), un Resumen a tu gusto, modo discreto e idioma.
- **Seguridad:** verificación en dos pasos (TOTP) opcional, recuperación de contraseña, exportación a CSV y eliminación de la cuenta.

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:5173 (sin .env.local entra en modo demo)
npm test             # Vitest
npm run test:e2e     # Playwright
npm run build        # tsc -b + vite build
npm run lint         # oxlint
npm run cap:sync     # compila y copia dist/ a ios/ y android/
```

Para usar Supabase, copia `.env.example` a `.env.local` y pon la URL y la clave publicable (`sb_publishable_…`). Las apps nativas se compilan en GitHub Actions (`.github/workflows/apps.yml`).

## Estructura

```
src/
  components/      UI compartida (listas, hoja inferior, dona, control segmentado, toast)
  features/        pantallas: home, transactions, stats, budgets, auth, legal y settings/
                   (appearance, automation, finance, security)
  i18n/            textos de la app: locales/es (fuente) y locales/en
  lib/
    auth/          contraseña y verificación en dos pasos
    data/          acceso a datos (Supabase o demo), React Query y cola sin conexión
    finance/       estadísticas, recurrentes y nombres por defecto
    format/        dinero (céntimos), fechas CR, tipo de cambio y CSV
    platform/      app nativa (Capacitor) y actualizaciones de la PWA
    prefs/         preferencias guardadas en la cuenta
    theme/         temas «Tarjetas de metal» en OKLCH
supabase/
  migrations/      esquema, RLS, vistas de saldos y presupuesto, datos iniciales por usuario
  functions/       wallet-sync (pagos del Atajo y notificaciones de Android) y _shared/
  templates/       correos de confirmación, recuperación y aviso de contraseña
  tests/           seguridad y lógica de la base en PostgreSQL efímero
android/, ios/     proyectos nativos de Capacitor
assets/            fuentes de íconos y pantalla de carga
scripts/           capturas, búsqueda de secretos, correos e iconos/ (íconos por tema)
e2e/               pruebas de Playwright
docs/              investigación competitiva y propuestas (funciones y rediseño de Ajustes)
CLAUDE.md          guía técnica del proyecto
PRODUCT.md         contexto de producto
DESIGN.md          sistema visual
```

Los montos se guardan como enteros en **céntimos** y las fechas se agrupan en hora de Costa Rica (UTC−6).
