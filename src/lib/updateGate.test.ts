import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createUpdateGate } from './updateGate';

describe('actualización de la app sin interrumpir', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('sin hojas abiertas, se aplica tras la espera', () => {
    const run = vi.fn();
    const gate = createUpdateGate({ isBusy: () => false, delayMs: 2000 });
    gate.ready(run);
    vi.advanceTimersByTime(1999);
    expect(run).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(run).toHaveBeenCalledOnce();
  });

  it('con una hoja abierta espera a que se cierre', () => {
    const run = vi.fn();
    const gate = createUpdateGate({ isBusy: () => false, delayMs: 2000 });
    const release = gate.hold();
    gate.ready(run);
    vi.advanceTimersByTime(60_000);
    expect(run).not.toHaveBeenCalled();
    release();
    release(); // liberar dos veces no descuadra el conteo
    vi.advanceTimersByTime(2000);
    expect(run).toHaveBeenCalledOnce();
  });

  it('si se abre otra hoja durante la espera, vuelve a esperar', () => {
    const run = vi.fn();
    const gate = createUpdateGate({ isBusy: () => false, delayMs: 2000 });
    gate.ready(run);
    vi.advanceTimersByTime(1000);
    const release = gate.hold();
    vi.advanceTimersByTime(5000);
    expect(run).not.toHaveBeenCalled();
    release();
    vi.advanceTimersByTime(2000);
    expect(run).toHaveBeenCalledOnce();
  });

  it('con cambios en camino no recarga hasta que terminan', () => {
    const run = vi.fn();
    let busy = true;
    const gate = createUpdateGate({ isBusy: () => busy, delayMs: 2000 });
    gate.ready(run);
    vi.advanceTimersByTime(10_000);
    expect(run).not.toHaveBeenCalled();
    busy = false;
    vi.advanceTimersByTime(2000);
    expect(run).toHaveBeenCalledOnce();
  });
});
