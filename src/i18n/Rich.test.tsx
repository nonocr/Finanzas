import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Rich } from './Rich';

const html = (text: string) => renderToStaticMarkup(<Rich text={text} />);
const routed = (text: string) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <Rich text={text} />
    </MemoryRouter>,
  );

describe('Rich', () => {
  it('negrita, código y enlaces', () => {
    expect(html('Toca **Listo**.')).toBe('Toca <b>Listo</b>.');
    expect(html('Escribe `Bearer ` y tu token')).toContain('<code');
    expect(html('Instala [MacroDroid](https://play.google.com/x)')).toContain('<a href="https://play.google.com/x"');
  });
  it('no interpreta HTML ni enlaces que no sean https', () => {
    expect(html('<img src=x onerror=alert(1)>')).toBe('&lt;img src=x onerror=alert(1)&gt;');
    expect(html('[x](javascript:alert(1))')).toBe('[x](javascript:alert(1))');
    expect(html('[x](http://example.com)')).toBe('[x](http://example.com)');
  });
  it('enlaces a rutas de la app: navegan dentro de ella, sin abrir otra pestaña', () => {
    const out = routed('Lee los [Términos](/terminos).');
    expect(out).toContain('href="/terminos"');
    expect(out).not.toContain('target="_blank"');
  });
  it('no toma «//» (otro sitio sin protocolo) como ruta de la app', () => {
    expect(html('[x](//evil.example)')).toBe('[x](//evil.example)');
  });
});
