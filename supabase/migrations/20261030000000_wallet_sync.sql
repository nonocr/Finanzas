-- Respaldo de Wallet: los pagos que no se pudieron enviar (sin señal) se reenvían después.
-- external_id identifica cada pago del Atajo para que un reenvío nunca lo duplique.

alter table public.transactions add column if not exists external_id text;

create unique index if not exists transactions_user_external_id_key
  on public.transactions (user_id, external_id)
  where external_id is not null;
