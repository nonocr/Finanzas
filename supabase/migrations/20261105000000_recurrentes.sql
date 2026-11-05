-- Gastos e ingresos fijos (2026-11-05). No destructiva: no borra ni cambia datos.
--
-- La tabla recurring existe desde el esquema inicial (con RLS, require_mfa y enforce_same_owner); faltaba la app.
-- La app crea los movimientos que vencen al abrirse, con un id derivado de (recurrente, fecha): repetir el proceso,
-- o correrlo en dos teléfonos a la vez, no duplica (insert … on conflict (id) do nothing).
--
-- 1. anchor_day: el día del mes elegido. next_date solo guarda la próxima fecha, y un cobro del 31 que cae el 28 de
--    febrero no sabría volver al 31 en marzo. En quincenal es uno de los dos días (el otro es ±15).
-- 2. Índice de transactions.recurring_id: al borrar un recurrente, sus movimientos quedan (on delete set null) y
--    Postgres los busca por esa columna.

alter table public.recurring
  add column if not exists anchor_day smallint check (anchor_day between 1 and 31);

create index if not exists transactions_recurring_idx on public.transactions (recurring_id);

-- ---------------------------------------------------------------------------
-- REVERTIR (manual):
--   drop index public.transactions_recurring_idx;
--   alter table public.recurring drop column anchor_day;
-- ---------------------------------------------------------------------------
