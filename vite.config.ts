/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// `vite preview` sirve con los mismos encabezados de seguridad que Vercel (vercel.json), para probar la CSP en local.
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8')) as {
  headers: { source: string; headers: { key: string; value: string }[] }[]
}
const securityHeaders = Object.fromEntries(
  vercel.headers.find((h) => h.source === '/(.*)')!.headers.map((h) => [h.key, h.value]),
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Finanzas',
        short_name: 'Finanzas',
        description: 'Gastos, ingresos y presupuesto en colones.',
        lang: 'es-CR',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#050505',
        theme_color: '#050505',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        // Los datos vienen de Supabase en vivo; solo se cachea la app.
        runtimeCaching: [],
      },
    }),
  ],
  preview: {
    headers: securityHeaders,
  },
  test: {
    include: ['src/**/*.test.ts', 'supabase/tests/**/*.test.ts', 'scripts/**/*.test.mjs'],
  },
})
