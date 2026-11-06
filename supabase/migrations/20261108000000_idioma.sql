-- Cuentas nuevas en el idioma de quien se registra. La app manda `lang` ('es' o 'en') en los datos del registro
-- (auth.users.raw_user_meta_data); con 'en', la cuenta «Efectivo» y las categorías iniciales se crean en inglés.
-- Sin `lang` (o con otro valor) todo queda en español, como hasta ahora. Las cuentas existentes no cambian: los nombres
-- son datos de cada persona y los puede editar.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  is_en boolean := coalesce(new.raw_user_meta_data ->> 'lang', '') = 'en';
begin
  insert into public.accounts (user_id, name, type, icon, color, sort)
  values (new.id, case when is_en then 'Cash' else 'Efectivo' end, 'efectivo', 'banknote', 'c3', 0);

  insert into public.categories (user_id, name, kind, icon, color, sort)
  select new.id, case when is_en then c.en else c.es end, c.kind::public.category_kind, c.icon, c.color, c.sort
  from (values
    ('Comida',          'Food',          'gasto',   'utensils',      'c1',  1),
    ('Súper',           'Groceries',     'gasto',   'shopping-cart', 'c2',  2),
    ('Transporte',      'Transport',     'gasto',   'car',           'c3',  3),
    ('Casa',            'Home',          'gasto',   'house',         'c4',  4),
    ('Servicios',       'Utilities',     'gasto',   'zap',           'c5',  5),
    ('Salud',           'Health',        'gasto',   'heart-pulse',   'c6',  6),
    ('Entretenimiento', 'Entertainment', 'gasto',   'film',          'c7',  7),
    ('Suscripciones',   'Subscriptions', 'gasto',   'repeat',        'c8',  8),
    ('Ropa',            'Clothing',      'gasto',   'shirt',         'c9',  9),
    ('Otros',           'Other',         'gasto',   'ellipsis',      'c10', 10),
    ('Salario',         'Salary',        'ingreso', 'briefcase',     'c2',  1),
    ('Extra',           'Extra',         'ingreso', 'sparkles',      'c5',  2),
    ('Otros ingresos',  'Other income',  'ingreso', 'plus',          'c10', 3)
  ) as c (es, en, kind, icon, color, sort);

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Reversión: volver a aplicar la función de 20261029000000_init.sql (con search_path de 20261103000000_seguridad_2.sql).
