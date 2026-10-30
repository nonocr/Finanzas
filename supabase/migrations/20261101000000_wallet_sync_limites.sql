-- Límite de longitud para el identificador de pagos del Atajo (lo acota también el webhook).
alter table public.transactions
  add constraint transactions_external_id_len check (external_id is null or char_length(external_id) <= 128);
