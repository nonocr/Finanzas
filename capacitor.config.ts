import type { CapacitorConfig } from '@capacitor/cli'

// App nativa (App Store y Google Play): envuelve la misma app web, compilada en dist/ con `npm run build`.
// `npx cap sync` copia dist/ a ios/ y android/.
const config: CapacitorConfig = {
  // Provisional: se puede cambiar hasta la primera subida a una tienda; después queda fijo para siempre.
  appId: 'com.nonocr.finanzas',
  appName: 'Finanzas',
  webDir: 'dist',
  // Mismo negro que la app: sin destello blanco mientras carga.
  backgroundColor: '#050505',
  ios: {
    // La app ya maneja las zonas seguras con env(safe-area-inset-*) y viewport-fit=cover, igual que en la PWA.
    contentInset: 'never',
  },
  plugins: {
    SystemBars: {
      // Android: el WebView ocupa toda la pantalla y env(safe-area-inset-*) trae los valores correctos.
      insetsHandling: 'native',
      initialViewportFitValueHint: 'cover',
      // Texto e íconos claros en la barra de estado: la app es siempre oscura.
      style: 'DARK',
    },
  },
}

export default config
