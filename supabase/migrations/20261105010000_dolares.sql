-- Compras en dólares (2026-11-05). No destructiva: no borra ni cambia datos.
--
-- `amount` sigue siendo la verdad en colones (saldos, presupuestos y estadísticas no cambian). Junto a él se guarda
-- lo que se pagó de verdad: el monto en dólares y el tipo de cambio con que se convirtió (BCCR, venta). Los tres
-- campos van juntos o ninguno.
--
-- Los escriben wallet-sync (cargos en US$ que manda el Atajo) y la app (gasto o ingreso registrado en dólares).

alter table public.transactions
  add column if not exists original_currency text,
  add column if not exists original_amount bigint,
  add column if not exists fx_rate numeric(10, 4);

alter table public.transactions
  add constraint transactions_original_currency check (original_currency is null or original_currency = 'USD'),
  add constraint transactions_original_amount check (original_amount is null or (original_amount > 0 and original_amount <= 100000000000)),
  add constraint transactions_fx_rate check (fx_rate is null or (fx_rate >= 1 and fx_rate <= 100000)),
  add constraint transactions_original_all_or_none check (
    (original_currency is null) = (original_amount is null) and (original_currency is null) = (fx_rate is null)
  ),
  -- Una transferencia entre cuentas propias no tiene moneda de origen (no hay cambio de colones a dólares en la app).
  add constraint transactions_original_not_transfer check (original_currency is null or type <> 'transferencia');

-- ---------------------------------------------------------------------------
-- REVERTIR (manual):
--   alter table public.transactions
--     drop constraint transactions_original_not_transfer,
--     drop constraint transactions_original_all_or_none,
--     drop constraint transactions_fx_rate,
--     drop constraint transactions_original_amount,
--     drop constraint transactions_original_currency,
--     drop column fx_rate, drop column original_amount, drop column original_currency;
-- ---------------------------------------------------------------------------
