# Finanzas

App personal para registrar gastos e ingresos en colones (efectivo y tarjeta), con presupuesto mensual, estadísticas de la semana y del mes, y registro automático de pagos de Apple Wallet. Es una PWA: se instala en el iPhone desde Safari y se usa como una app.

## Pagos automáticos con Apple Wallet

En la app: Ajustes → Apple Wallet. Ahí creas el token, copias la dirección y sigues los pasos para crear la automatización **Transacción** en la app Atajos. Cada pago con Apple Pay se envía a `wallet-ingest`, que:

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
  features/        pantallas: home, transactions, stats, budgets, settings, auth
  lib/             dinero (céntimos), fechas CR, estadísticas, acceso a datos (Supabase o demo)
supabase/
  migrations/      esquema, RLS, vistas de saldos y presupuesto, datos iniciales por usuario
  functions/       wallet-ingest (webhook del Atajo) y _shared/money.ts
PRODUCT.md         contexto de producto para las skills de diseño
```

Los montos se guardan como enteros en **céntimos** y todas las fechas se agrupan en hora de Costa Rica (UTC−6).
