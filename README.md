# Finanzas

App personal para registrar gastos e ingresos en colones (efectivo y tarjeta), con presupuesto mensual, estadísticas de la semana y del mes, y registro automático de pagos de Apple Wallet. Es una PWA: se instala en el iPhone desde Safari y se usa como una app.

## Correr en local

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # pruebas de dinero, fechas y estadísticas
npm run build
```

Sin variables de Supabase la app arranca en **modo demo**, con 6 meses de datos de ejemplo guardados en el navegador. Para borrarlos y volver a generarlos: Ajustes → Reiniciar datos de ejemplo.

En el celular, misma red: `npx vite --host` y abre `http://<ip-de-tu-pc>:5173`. Para instalarla como PWA, iOS exige HTTPS, así que hay que hacerlo con la versión publicada.

## Conectar Supabase (datos reales en la nube)

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. **Base de datos:** en *SQL Editor* pega y ejecuta `supabase/migrations/20261029000000_init.sql`.
   Si prefieres la CLI: `npx supabase login`, `npx supabase link --project-ref <ref>` y luego `npx supabase db push`.
3. **Inicio de sesión con código:** en *Authentication → Email Templates → Magic Link*, cambia el cuerpo para que incluya el código:
   ```html
   <h2>Tu código</h2><p>{{ .Token }}</p>
   ```
   La app pide un código de 6 dígitos en vez de un enlace porque, en iPhone, el enlace abriría Safari y no la app instalada.
4. **Variables:** copia `.env.example` como `.env.local` y llena `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (Project Settings → API).
5. **Función de Wallet:** `npx supabase functions deploy wallet-ingest --no-verify-jwt`.

## Publicar (Vercel)

1. Sube el repo a GitHub e impórtalo en [vercel.com](https://vercel.com) (framework: Vite).
2. Agrega las dos variables `VITE_SUPABASE_*` en Vercel.
3. En el iPhone abre la URL en Safari → Compartir → **Agregar a pantalla de inicio**.

## Pagos automáticos con Apple Wallet

En la app: Ajustes → Apple Wallet. Ahí creas el token, copias la dirección y sigues los pasos para crear la automatización **Transacción** en la app Atajos. Cada pago con Apple Pay se envía a `wallet-ingest`, que:

- interpreta el monto (`₡12.500,00`, `CRC 12,500.00`…);
- identifica la tarjeta por su nombre en Wallet o los últimos 4 dígitos (configúralos en Cuentas);
- asigna la categoría según las **reglas de comercios**;
- evita duplicados si el Atajo se dispara dos veces;
- deja el pago **por revisar** si no logra categorizarlo. Al confirmarlo puedes guardar la regla para la próxima vez.

Solo captura pagos hechos con el iPhone o el Apple Watch. Las compras en línea o con la tarjeta física se registran a mano.

Acceso rápido: `https://<tu-app>/?agregar` abre directo la hoja de nuevo gasto (útil para un Atajo en la pantalla de inicio).

## Estructura

```
src/
  components/      UI compartida (listas iOS, hoja inferior, dona, control segmentado, toast)
  features/        pantallas: home, transactions, stats, budgets, settings, auth
  lib/             dinero (céntimos), fechas CR, estadísticas, acceso a datos (Supabase o demo)
supabase/
  migrations/      esquema, RLS, vistas de saldos y presupuesto, datos iniciales por usuario
  functions/       wallet-ingest (webhook del Atajo) y _shared/money.ts
PRODUCT.md         contexto de producto para las skills de diseño
```

Los montos se guardan como enteros en **céntimos** y todas las fechas se agrupan en hora de Costa Rica (UTC−6).
