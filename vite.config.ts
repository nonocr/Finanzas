/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

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
        background_color: '#121417',
        theme_color: '#121417',
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
  test: {
    include: ['src/**/*.test.ts'],
  },
})
