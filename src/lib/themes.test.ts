import { describe, expect, it } from 'vitest';
import { apca, distance, fromHex, parse, wcag, type Lch } from './oklch';
import { THEMES, themeById } from './themes';

// Colores con significado que no cambian con el tema (src/index.css). El metal de la acción no debe parecerse a ellos.
const MEANINGFUL: Record<string, Lch> = {
  'ámbar del presupuesto': fromHex('#d4a04c'),
  'rojo del presupuesto': fromHex('#e0695a'),
  'verde de ingresos': fromHex('#a9bfae'),
};

describe('temas', () => {
  it('Negra es el primero y el de respaldo', () => {
    expect(THEMES[0].id).toBe('negra');
    expect(themeById('no-existe').id).toBe('negra');
    expect(themeById(null).id).toBe('negra');
  });

  it('cada tema tiene un id, un nombre y un ícono únicos', () => {
    for (const key of ['id', 'name', 'iconName'] as const) {
      const values = THEMES.map((t) => t[key]);
      expect(new Set(values).size, key).toBe(values.length);
    }
  });

  it.each(THEMES.map((t) => [t.name, t] as const))('%s: legible (WCAG 2 AA y APCA)', (_, t) => {
    const k = t.lch;
    for (const value of Object.values(t.tokens)) expect(() => parse(value)).not.toThrow();
    // Texto principal.
    expect(wcag(k.label, k.card)).toBeGreaterThanOrEqual(7);
    expect(apca(k.label, k.card)).toBeGreaterThanOrEqual(75);
    // Secundario (subtítulos, fechas, «Quedan…»): AA y APCA de texto grande con margen.
    for (const surface of [k.bg, k.card, k.card2]) {
      expect(wcag(k.label2, surface)).toBeGreaterThanOrEqual(4.5);
      expect(apca(k.label2, surface)).toBeGreaterThanOrEqual(54);
    }
    // Terciario (marcadores de posición, chevrones): elemento de interfaz.
    expect(apca(k.label3, k.card)).toBeGreaterThanOrEqual(30);
    // Texto de los botones de metal: va centrado, sobre el medio del degradado (y sobre el relleno plano, accent).
    // El borde oscuro de abajo nunca queda detrás de la letra, pero tampoco puede quedar muy por debajo.
    const middle: Lch = [(k.metalHi[0] + k.metalLo[0]) / 2, (k.metalHi[1] + k.metalLo[1]) / 2, k.metalLo[2]];
    for (const metal of [k.accent, k.metalHi, middle]) {
      expect(wcag(k.onAccent, metal)).toBeGreaterThanOrEqual(4.5);
      expect(apca(k.onAccent, metal)).toBeGreaterThanOrEqual(54);
    }
    expect(wcag(k.onAccent, k.metalLo)).toBeGreaterThanOrEqual(4.5);
    expect(apca(k.onAccent, k.metalLo)).toBeGreaterThanOrEqual(50);
    // Acciones en texto («Cancelar», «Ver todos») y cifras grabadas.
    expect(apca(k.accent, k.card2)).toBeGreaterThanOrEqual(60);
    expect(apca(k.engraved, k.card)).toBeGreaterThanOrEqual(60);
  });

  it('todos los temas tienen el mismo contraste (misma escalera de claridad)', () => {
    const spread = (f: (t: (typeof THEMES)[number]) => number) => {
      const values = THEMES.filter((t) => t.id !== 'carbono').map(f);
      return Math.max(...values) - Math.min(...values);
    };
    expect(spread((t) => apca(t.lch.label, t.lch.card))).toBeLessThan(1);
    expect(spread((t) => apca(t.lch.label2, t.lch.card))).toBeLessThan(1);
    expect(spread((t) => apca(t.lch.label3, t.lch.card))).toBeLessThan(1);
  });

  it('cada tema se distingue de los demás', () => {
    for (let i = 0; i < THEMES.length; i++)
      for (let j = i + 1; j < THEMES.length; j++) {
        const [a, b] = [THEMES[i], THEMES[j]];
        // Los metales grises (Negra, Carbono, Titanio) se distinguen por el fondo (negro, negro puro, frío), no por el metal.
        if (a.lch.accent[1] < 0.03 || b.lch.accent[1] < 0.03) continue;
        expect(distance(a.lch.accent, b.lch.accent), `${a.name} / ${b.name}`).toBeGreaterThanOrEqual(0.05);
      }
  });

  // Solo el metal de la acción (accent): es el que aparece suelto (texto de acciones, interruptores, la barra de hoy);
  // los extremos del degradado solo viven dentro de un botón. La confusión real pasa dentro de una misma familia de
  // color (un metal verde junto al verde de ingresos): ahí se exige que se distingan con claridad. Entre familias
  // distintas el matiz ya los separa (un botón dorado no se lee como «ingreso» aunque tengan la misma claridad).
  const hueGap = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
  it.each(THEMES.filter((t) => t.lch.accent[1] > 0.02).map((t) => [t.name, t] as const))(
    '%s: el metal no se confunde con los colores con significado',
    (_, t) => {
      for (const [name, color] of Object.entries(MEANINGFUL)) {
        const sameFamily = hueGap(t.lch.accent[2], color[2]) < 40;
        expect(distance(t.lch.accent, color), name).toBeGreaterThanOrEqual(sameFamily ? 0.085 : 0.04);
      }
    },
  );
});
