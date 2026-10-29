/** Falla de red (sin señal, señal intermitente) y no un rechazo del servidor. Safari dice "Load failed". */
export const isNetworkError = (e: unknown) =>
  /failed to fetch|load failed|networkerror|network request failed|fetch failed/i.test(
    String((e as Error | undefined)?.message ?? e),
  );
