import { describe, expect, it } from 'vitest';
import { DEFAULT_PREFS, HOME_SECTIONS, normalizePrefs } from './prefs';

describe('normalizePrefs', () => {
  it('sin nada guardado: los valores por defecto', () => {
    expect(normalizePrefs({})).toEqual(DEFAULT_PREFS);
    expect(normalizePrefs(null)).toEqual(DEFAULT_PREFS);
    expect(normalizePrefs('basura')).toEqual(DEFAULT_PREFS);
  });

  it('respeta lo válido', () => {
    const p = normalizePrefs({
      theme: 'oro',
      discreet: true,
      home: { order: ['presupuestos', 'semana', 'recientes', 'categorias'], hidden: ['recientes'], showPending: false, card: 'balance' },
    });
    expect(p).toEqual({
      theme: 'oro',
      discreet: true,
      home: { order: ['presupuestos', 'semana', 'recientes', 'categorias'], hidden: ['recientes'], showPending: false, card: 'balance' },
    });
  });

  it('ignora lo desconocido y corrige lo inválido', () => {
    const p = normalizePrefs({ theme: 'arcoiris', discreet: 'si', home: { order: ['semana', 'semana', 'inventada'], hidden: ['x'], card: 'otra' } });
    expect(p.theme).toBe('negra');
    expect(p.discreet).toBe(false);
    expect(p.home.card).toBe('gastado');
    expect(p.home.hidden).toEqual([]);
    expect(p.home.showPending).toBe(true);
  });

  it('nunca pierde una sección: las que falten (p. ej. nuevas en otra versión) van al final', () => {
    const p = normalizePrefs({ home: { order: ['recientes', 'semana'] } });
    expect(p.home.order).toEqual(['recientes', 'semana', 'categorias', 'presupuestos']);
    expect([...p.home.order].sort()).toEqual([...HOME_SECTIONS].sort());
  });
});
