/**
 * Decide cuándo aplicar una versión nueva de la app (recargar) sin interrumpir: nunca con una hoja abierta (se
 * perdería lo que se estaba escribiendo) ni con cambios en camino. Tras cerrar la última hoja espera `delayMs`,
 * para que lo recién guardado termine de anotarse en la copia local.
 */
export function createUpdateGate({ isBusy, delayMs }: { isBusy: () => boolean; delayMs: number }) {
  let holds = 0;
  let apply: (() => void) | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const tryApply = () => {
    clearTimeout(timer);
    if (!apply || holds > 0) return;
    timer = setTimeout(() => {
      if (!apply || holds > 0) return;
      if (isBusy()) return tryApply();
      const run = apply;
      apply = null;
      run();
    }, delayMs);
  };

  return {
    /** Mientras no se libere, no se recarga. Devuelve la función que la libera (una sola vez). */
    hold() {
      holds++;
      clearTimeout(timer);
      let released = false;
      return () => {
        if (released) return;
        released = true;
        holds--;
        tryApply();
      };
    },
    /** Hay una versión nueva lista: se aplica en cuanto no estorbe. */
    ready(run: () => void) {
      apply = run;
      tryApply();
    },
  };
}
