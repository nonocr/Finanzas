import { afterEach, describe, expect, it, vi } from 'vitest';
import { deviceLang, resolveLang } from './index';

const withLanguages = (languages: string[]) =>
  vi.stubGlobal('navigator', { languages, language: languages[0] ?? '' });

describe('idioma automático', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('español o inglés del teléfono, en cualquier variante', () => {
    withLanguages(['es-CR']);
    expect(deviceLang()).toBe('es');
    withLanguages(['en-GB']);
    expect(deviceLang()).toBe('en');
  });

  it('toma el primer idioma del teléfono que la app tiene', () => {
    withLanguages(['fr-FR', 'es-MX', 'en-US']);
    expect(deviceLang()).toBe('es');
  });

  it('si el teléfono no está en ninguno de los dos, inglés', () => {
    withLanguages(['pt-BR', 'fr-FR']);
    expect(deviceLang()).toBe('en');
    withLanguages([]);
    expect(deviceLang()).toBe('en');
  });

  it('una elección fija no depende del teléfono', () => {
    withLanguages(['en-US']);
    expect(resolveLang('es')).toBe('es');
    expect(resolveLang('auto')).toBe('en');
  });
});
