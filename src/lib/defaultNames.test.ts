import { describe, expect, it } from 'vitest';
import { localizeAccount, localizeCategory } from './defaultNames';

const cat = (name: string, kind: 'gasto' | 'ingreso' = 'gasto') => ({ id: 'x', name, kind });

describe('nombres por defecto en el idioma de la app', () => {
  it('una categoría por defecto se muestra en el idioma actual, venga del idioma que venga', () => {
    expect(localizeCategory(cat('Súper'), 'en').name).toBe('Groceries');
    expect(localizeCategory(cat('Groceries'), 'es').name).toBe('Súper');
    expect(localizeCategory(cat('Otros ingresos', 'ingreso'), 'en').name).toBe('Other income');
    expect(localizeCategory(cat('Comida'), 'es').name).toBe('Comida');
  });

  it('un nombre editado por la persona no se toca', () => {
    expect(localizeCategory(cat('Mercado'), 'en').name).toBe('Mercado');
    expect(localizeCategory(cat('Groceries & more'), 'es').name).toBe('Groceries & more');
  });

  it('el tipo importa: «Otros» de gasto no es «Otros ingresos»', () => {
    expect(localizeCategory(cat('Otros'), 'en').name).toBe('Other');
    expect(localizeCategory(cat('Other income', 'gasto'), 'es').name).toBe('Other income');
  });

  it('sin cambios devuelve el mismo objeto (no fuerza redibujos)', () => {
    const c = cat('Mercado');
    expect(localizeCategory(c, 'en')).toBe(c);
  });

  it('la cuenta de efectivo por defecto, solo si es de tipo efectivo', () => {
    expect(localizeAccount({ name: 'Efectivo', type: 'efectivo' as const }, 'en').name).toBe('Cash');
    expect(localizeAccount({ name: 'Cash', type: 'efectivo' as const }, 'es').name).toBe('Efectivo');
    expect(localizeAccount({ name: 'Efectivo', type: 'debito' as const }, 'en').name).toBe('Efectivo');
    expect(localizeAccount({ name: 'Billetera', type: 'efectivo' as const }, 'en').name).toBe('Billetera');
  });
});
