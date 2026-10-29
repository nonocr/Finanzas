-- Esquema inicial: cuentas, categorías, movimientos, presupuestos, recurrentes,
-- reglas de comercio y tokens para el Atajo de Wallet.
-- Montos en céntimos de colón (bigint). Zona horaria de negocio: America/Costa_Rica.

create extension if not exists pgcrypto with schema extensions;

create type public.account_type as enum ('efectivo', 'debito', 'credito', 'banco', 'ahorro');
create type public.category_kind as enum ('gasto', 'ingreso');
create type public.tx_type as enum ('gasto', 'ingreso', 'transferencia');
create type public.tx_source as enum ('manual', 'wallet', 'import', 'recurrente');
create type public.tx_status as enum ('confirmada', 'por_revisar');
create type public.frequency as enum ('semanal', 'quincenal', 'mensual', 'anual');

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table public.accounts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users on delete cascade,
  name             text not null check (length(trim(name)) > 0),
  type             public.account_type not null,
  initial_balance  bigint not null default 0,
  color            text,
  icon             text,
  -- Tarjetas: para empatar pagos de Wallet y mostrar fechas de corte/pago.
  last4            text check (last4 ~ '^[0-9]{4}$'),
  wallet_name      text,
  credit_limit     bigint check (credit_limit is null or credit_limit > 0),
  cutoff_day       smallint check (cutoff_day between 1 and 31),
  payment_day      smallint check (payment_day between 1 and 31),
  archived         boolean not null default false,
  sort             int not null default 0,
  created_at       timestamptz not null default now()
);
create index accounts_user_idx on public.accounts (user_id);

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  name        text not null check (length(trim(name)) > 0),
  kind        public.category_kind not null,
  icon        text,
  color       text,
  parent_id   uuid references public.categories on delete set null,
  archived    boolean not null default false,
  sort        int not null default 0,
  created_at  timestamptz not null default now(),
  unique (user_id, kind, name)
);
create index categories_user_idx on public.categories (user_id);

create table public.recurring (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users on delete cascade,
  name         text not null,
  type         public.tx_type not null check (type <> 'transferencia'),
  amount       bigint not null check (amount > 0),
  account_id   uuid not null references public.accounts on delete cascade,
  category_id  uuid references public.categories on delete set null,
  frequency    public.frequency not null default 'mensual',
  next_date    date not null,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);
create index recurring_user_idx on public.recurring (user_id);

create table public.transactions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users on delete cascade,
  occurred_at    timestamptz not null default now(),
  amount         bigint not null check (amount > 0),
  type           public.tx_type not null,
  account_id     uuid not null references public.accounts on delete restrict,
  to_account_id  uuid references public.accounts on delete restrict,
  category_id    uuid references public.categories on delete set null,
  merchant       text,
  note           text,
  source         public.tx_source not null default 'manual',
  status         public.tx_status not null default 'confirmada',
  recurring_id   uuid references public.recurring on delete set null,
  created_at     timestamptz not null default now(),
  constraint transfer_has_destination check ((type = 'transferencia') = (to_account_id is not null)),
  constraint transfer_distinct_accounts check (to_account_id is null or to_account_id <> account_id)
);
create index transactions_user_date_idx on public.transactions (user_id, occurred_at desc);
create index transactions_account_idx on public.transactions (account_id);
create index transactions_to_account_idx on public.transactions (to_account_id);
create index transactions_category_idx on public.transactions (category_id);

create table public.budgets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users on delete cascade,
  -- null = presupuesto total del mes
  category_id  uuid references public.categories on delete cascade,
  month        date not null check (extract(day from month) = 1),
  amount       bigint not null check (amount > 0),
  created_at   timestamptz not null default now(),
  unique nulls not distinct (user_id, category_id, month)
);
create index budgets_user_month_idx on public.budgets (user_id, month);

create table public.merchant_rules (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users on delete cascade,
  -- Coincidencia sin distinguir mayúsculas: el comercio contiene este texto.
  pattern      text not null check (length(trim(pattern)) > 0),
  category_id  uuid not null references public.categories on delete cascade,
  priority     int not null default 0,
  created_at   timestamptz not null default now(),
  unique (user_id, pattern)
);

create table public.api_tokens (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users on delete cascade,
  name          text not null default 'Atajo iPhone',
  token_hash    text not null unique,
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz
);

-- ---------------------------------------------------------------------------
-- RLS: cada fila pertenece a su dueño
-- ---------------------------------------------------------------------------

alter table public.accounts       enable row level security;
alter table public.categories     enable row level security;
alter table public.recurring      enable row level security;
alter table public.transactions   enable row level security;
alter table public.budgets        enable row level security;
alter table public.merchant_rules enable row level security;
alter table public.api_tokens     enable row level security;

create policy own_rows on public.accounts       for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_rows on public.categories     for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_rows on public.recurring      for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_rows on public.transactions   for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_rows on public.budgets        for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_rows on public.merchant_rules for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Los tokens solo se crean con create_api_token(); el cliente puede verlos (sin el valor) y revocarlos.
create policy own_tokens_select on public.api_tokens for select to authenticated using (user_id = auth.uid());
create policy own_tokens_delete on public.api_tokens for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Vistas calculadas (respetan RLS del que consulta)
-- ---------------------------------------------------------------------------

create view public.account_balances with (security_invoker = true) as
select
  a.id as account_id,
  a.initial_balance + coalesce(sum(
    case
      when t.type = 'ingreso'       and t.account_id    = a.id then  t.amount
      when t.type = 'gasto'         and t.account_id    = a.id then -t.amount
      when t.type = 'transferencia' and t.account_id    = a.id then -t.amount
      when t.type = 'transferencia' and t.to_account_id = a.id then  t.amount
    end), 0)::bigint as balance
from public.accounts a
left join public.transactions t on t.account_id = a.id or t.to_account_id = a.id
group by a.id, a.initial_balance;

create view public.budget_progress with (security_invoker = true) as
select
  b.id as budget_id,
  b.category_id,
  b.month,
  b.amount as limit_amount,
  coalesce((
    select sum(t.amount)
    from public.transactions t
    left join public.categories c on c.id = t.category_id
    where t.user_id = b.user_id
      and t.type = 'gasto'
      and date_trunc('month', t.occurred_at at time zone 'America/Costa_Rica')::date = b.month
      and (b.category_id is null or t.category_id = b.category_id or c.parent_id = b.category_id)
  ), 0)::bigint as spent
from public.budgets b;

-- ---------------------------------------------------------------------------
-- Funciones
-- ---------------------------------------------------------------------------

-- Genera un token personal para el Atajo; devuelve el valor en claro una sola vez.
create function public.create_api_token(p_name text default 'Atajo iPhone')
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  raw text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  raw := 'fz_' || encode(gen_random_bytes(24), 'hex');
  insert into public.api_tokens (user_id, name, token_hash)
  values (auth.uid(), coalesce(nullif(trim(p_name), ''), 'Atajo iPhone'), encode(digest(raw, 'sha256'), 'hex'));
  return raw;
end;
$$;
revoke all on function public.create_api_token(text) from public, anon;
grant execute on function public.create_api_token(text) to authenticated;

-- Copia los presupuestos de un mes al siguiente sin pisar los que ya existan.
create function public.copy_budgets(p_from date, p_to date)
returns int
language sql
security invoker
as $$
  with ins as (
    insert into public.budgets (user_id, category_id, month, amount)
    select user_id, category_id, p_to, amount
    from public.budgets
    where user_id = auth.uid() and month = p_from
    on conflict (user_id, category_id, month) do nothing
    returning 1
  )
  select count(*)::int from ins;
$$;

-- Datos iniciales para cada usuario nuevo.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.accounts (user_id, name, type, icon, color, sort)
  values (new.id, 'Efectivo', 'efectivo', 'banknote', 'c3', 0);

  insert into public.categories (user_id, name, kind, icon, color, sort) values
    (new.id, 'Comida',          'gasto',   'utensils',       'c1',  1),
    (new.id, 'Súper',           'gasto',   'shopping-cart',  'c2',  2),
    (new.id, 'Transporte',      'gasto',   'car',            'c3',  3),
    (new.id, 'Casa',            'gasto',   'house',          'c4',  4),
    (new.id, 'Servicios',       'gasto',   'zap',            'c5',  5),
    (new.id, 'Salud',           'gasto',   'heart-pulse',    'c6',  6),
    (new.id, 'Entretenimiento', 'gasto',   'film',           'c7',  7),
    (new.id, 'Suscripciones',   'gasto',   'repeat',         'c8',  8),
    (new.id, 'Ropa',            'gasto',   'shirt',          'c9',  9),
    (new.id, 'Otros',           'gasto',   'ellipsis',       'c10', 10),
    (new.id, 'Salario',         'ingreso', 'briefcase',      'c2',  1),
    (new.id, 'Extra',           'ingreso', 'sparkles',       'c5',  2),
    (new.id, 'Otros ingresos',  'ingreso', 'plus',           'c10', 3);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
