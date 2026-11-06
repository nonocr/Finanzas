// Nombres que la app pone por defecto a una cuenta nueva (handle_new_user, migración 20261108000000_idioma): se guardan
// en el idioma del registro, pero mientras la persona no los cambie se muestran en el idioma actual de la app. Un nombre
// editado («Súper» → «Mercado») es suyo y se muestra tal cual. Si cambias los nombres por defecto de la base, cámbialos
// también aquí.
import type { Lang } from '../../i18n';
import type { Account, Category } from '../data/types';

type DefaultName = Record<Lang, string>;

const CATEGORY_DEFAULTS: Record<Category['kind'], DefaultName[]> = {
  gasto: [
    { es: 'Comida', en: 'Food' },
    { es: 'Súper', en: 'Groceries' },
    { es: 'Transporte', en: 'Transport' },
    { es: 'Casa', en: 'Home' },
    { es: 'Servicios', en: 'Utilities' },
    { es: 'Salud', en: 'Health' },
    { es: 'Entretenimiento', en: 'Entertainment' },
    { es: 'Suscripciones', en: 'Subscriptions' },
    { es: 'Ropa', en: 'Clothing' },
    { es: 'Otros', en: 'Other' },
  ],
  ingreso: [
    { es: 'Salario', en: 'Salary' },
    { es: 'Extra', en: 'Extra' },
    { es: 'Otros ingresos', en: 'Other income' },
  ],
};

const CASH: DefaultName = { es: 'Efectivo', en: 'Cash' };

/** El nombre por defecto en el idioma pedido, si `name` es uno de los nombres por defecto (en cualquier idioma). */
function translate(name: string, options: DefaultName[], lang: Lang): string {
  const n = name.trim();
  const hit = options.find((d) => d.es === n || d.en === n);
  return hit ? hit[lang] : name;
}

export function localizeCategory<T extends Pick<Category, 'name' | 'kind'>>(c: T, lang: Lang): T {
  const name = translate(c.name, CATEGORY_DEFAULTS[c.kind] ?? [], lang);
  return name === c.name ? c : { ...c, name };
}

/** Solo la cuenta de efectivo que crea la app; las demás cuentas tienen nombres de la persona. */
export function localizeAccount<T extends Pick<Account, 'name' | 'type'>>(a: T, lang: Lang): T {
  if (a.type !== 'efectivo') return a;
  const name = translate(a.name, [CASH], lang);
  return name === a.name ? a : { ...a, name };
}
