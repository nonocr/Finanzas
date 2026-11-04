-- Pagos de Wallet sin monto legible (2026-11-04). No destructiva: no borra ni cambia datos.
--
-- Algunos datáfonos (buses, ciertos comercios) no le pasan el monto al Atajo de Wallet. Antes el servidor descartaba
-- ese pago y respondía "ok", así que el Atajo borraba la cola y el pago se perdía sin aviso. Ahora se guarda con
-- monto 0, por revisar, y la app pide el monto al confirmarlo.
--
-- 1. El monto 0 solo se permite en un pago de Wallet por revisar; al confirmarlo hay que ponerle monto.
-- 2. amount_raw guarda el texto que mandó el iPhone, para entender qué formatos no se pudieron leer.

alter table public.transactions drop constraint transactions_amount_check;
alter table public.transactions
  add constraint transactions_amount_check
    check (amount > 0 or (amount = 0 and source = 'wallet' and status = 'por_revisar'));

alter table public.transactions add column if not exists amount_raw text;
alter table public.transactions
  add constraint transactions_amount_raw_len check (amount_raw is null or char_length(amount_raw) <= 64);

-- ---------------------------------------------------------------------------
-- REVERTIR (manual; antes hay que completar o borrar los pagos con monto 0):
--   alter table public.transactions drop constraint transactions_amount_raw_len;
--   alter table public.transactions drop column amount_raw;
--   alter table public.transactions drop constraint transactions_amount_check;
--   alter table public.transactions add constraint transactions_amount_check check (amount > 0);
-- ---------------------------------------------------------------------------
