import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Rich } from './Rich';

const html = (text: string) => renderToStaticMarkup(<Rich text={text} />);

describe('Rich', () => {
  it('negrita, código y enlaces', () => {
    expect(html('Toca **Listo**.')).toBe('Toca <b>Listo</b>.');
    expect(html('Escribe `Bearer ` y tu token')).toContain('<code');
    expect(html('Instala [MacroDroid](https://play.google.com/x)')).toContain('<a href="https://play.google.com/x"');
  });
  it('no interpreta HTML ni enlaces que no sean https', () => {
    expect(html('<img src=x onerror=alert(1)>')).toBe('&lt;img src=x onerror=alert(1)&gt;');
    expect(html('[x](javascript:alert(1))')).toBe('[x](javascript:alert(1))');
  });
});
