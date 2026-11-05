import { describe, expect, it } from 'vitest';
import { THEMES, themeById } from './themes';

const hex = /^#[0-9a-f]{6}$/;

function luminance(color: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(color.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe('temas', () => {
  it('Negra es el primero y el de respaldo', () => {
    expect(THEMES[0].id).toBe('negra');
    expect(themeById('no-existe').id).toBe('negra');
    expect(themeById(null).id).toBe('negra');
  });

  it.each(THEMES.map((t) => [t.name, t] as const))('%s: colores válidos y legibles (WCAG AA)', (_, t) => {
    const k = t.tokens;
    for (const [name, value] of Object.entries(k)) {
      if (name === 'fillRgb') expect(value).toMatch(/^\d{1,3} \d{1,3} \d{1,3}$/);
      else expect(value, name).toMatch(hex);
    }
    for (const surface of [k.bg, k.card, k.card2]) {
      expect(contrast(k.label, surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(k.label2, surface)).toBeGreaterThanOrEqual(4.5);
    }
    // Marcadores de posición y chevrones: texto secundario grande o no esencial.
    expect(contrast(k.label3, k.card)).toBeGreaterThanOrEqual(3.5);
    // Texto sobre el metal de la acción, en todo el degradado.
    for (const metal of [k.accent, k.metalHi, k.metalLo]) expect(contrast(k.onAccent, metal)).toBeGreaterThanOrEqual(4.5);
    // Acciones en texto (Cancelar, Ver todos) sobre las superficies.
    expect(contrast(k.accent, k.card2)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(k.engraved, k.card)).toBeGreaterThanOrEqual(4.5);
  });
});
