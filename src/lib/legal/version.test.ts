import { describe, expect, it } from 'vitest';
import { hasAcceptedLegal, LEGAL_VERSION, legalVersionDate } from './version';

describe('versión de los documentos legales', () => {
  it('es una fecha válida AAAA-MM-DD (la tabla legal_acceptances solo acepta esa forma)', () => {
    expect(LEGAL_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(legalVersionDate().toISOString().slice(0, 10)).toBe(LEGAL_VERSION);
  });

  it('cuenta como aceptada si aceptó esta versión o una posterior', () => {
    expect(hasAcceptedLegal(undefined, '2026-11-06')).toBe(false);
    expect(hasAcceptedLegal([], '2026-11-06')).toBe(false);
    expect(hasAcceptedLegal([{ version: '2026-10-01' }], '2026-11-06')).toBe(false);
    expect(hasAcceptedLegal([{ version: '2026-11-06' }], '2026-11-06')).toBe(true);
    expect(hasAcceptedLegal([{ version: '2026-10-01' }, { version: '2027-01-15' }], '2026-11-06')).toBe(true);
  });
});
