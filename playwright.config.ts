// Pruebas de humo de la app en modo demo (datos de ejemplo en el navegador, sin tocar Supabase), a tamaño de iPhone.
// Uso: npm run test:e2e   (usa el Chrome instalado; no descarga navegadores)
import { defineConfig } from '@playwright/test';

const PORT = 5175;

export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.e2e.ts', // no *.spec/*.test: esos los toma Vitest
  fullyParallel: true,
  reporter: 'list',
  outputDir: 'node_modules/.cache/playwright',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    channel: 'chrome',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: 'es-CR',
    timezoneId: 'America/Costa_Rica',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `npx vite --port ${PORT} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}`,
    env: { VITE_DEMO: '1' },
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
