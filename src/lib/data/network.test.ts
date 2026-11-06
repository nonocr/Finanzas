import { describe, expect, it } from 'vitest';
import { isNetworkError } from './network';

describe('isNetworkError', () => {
  it.each([
    'TypeError: Failed to fetch', // Chrome
    'TypeError: Load failed', // Safari / iPhone
    'NetworkError when attempting to fetch resource.', // Firefox
    'fetch failed', // Node
  ])('reconoce "%s" como falta de señal', (msg) => {
    expect(isNetworkError(new Error(msg))).toBe(true);
  });

  it.each(['duplicate key value violates unique constraint', 'new row violates row-level security policy'])(
    'no confunde un rechazo del servidor: "%s"',
    (msg) => {
      expect(isNetworkError(new Error(msg))).toBe(false);
    },
  );
});
