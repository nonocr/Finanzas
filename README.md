# Finanzas

App personal para registrar gastos e ingresos en colones (efectivo y tarjeta), con presupuesto mensual, estadísticas de la semana y del mes, y registro automático de pagos de Apple Wallet. Es una PWA: se instala en el iPhone desde Safari y se usa como una app.

## Pagos automáticos con Apple Wallet

En la app: Ajustes → Apple Wallet. Ahí creas el token, copias la dirección y sigues los pasos para crear la automatización **Transacción** en la app Atajos. Cada pago con Apple Pay se envía a `wallet-sync` (si no hay señal, el Atajo lo guarda y lo reenvía después), que:

- interpreta el monto (`₡12.500,00`, `CRC 12,500.00`…);
- identifica la tarjeta por su nombre en Wallet o los últimos 4 dígitos (configúralos en Cuentas);
- asigna la categoría según las **reglas de comercios**;
- evita duplicados si el Atajo se dispara dos veces;
- deja el pago **por revisar** si no logra categorizarlo. Al confirmarlo puedes guardar la regla para la próxima vez.

Solo captura pagos hechos con el iPhone o el Apple Watch. Las compras en línea o con la tarjeta física se registran a mano.

## Estructura

```
src/
  components/      UI compartida (listas iOS, hoja inferior, dona, control segmentado, toast)
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
  functions/       wallet-sync (webhook del Atajo) y _shared/ (lógica común, money.ts)
  templates/       correos de confirmación y recuperación
  tests/           seguridad y lógica de la base en PostgreSQL efímero
android/, ios/     proyectos nativos de Capacitor
assets/            fuentes de íconos y pantalla de carga
scripts/           capturas, búsqueda de secretos, correos e iconos/ (íconos por tema)
e2e/               pruebas de Playwright
PRODUCT.md         contexto de producto para las skills de diseño
DESIGN.md          sistema visual
```

Los montos se guardan como enteros en **céntimos** y todas las fechas se agrupan en hora de Costa Rica (UTC−6).
