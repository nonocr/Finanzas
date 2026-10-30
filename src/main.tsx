import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { isDemo } from './lib/api'
import { CACHE_MAX_AGE, onCacheRestored, persister, queryClient, resumePendingMutations, shouldPersistMutation } from './lib/offline'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: CACHE_MAX_AGE,
        buster: 'v1',
        dehydrateOptions: { shouldDehydrateMutation: shouldPersistMutation },
      }}
      // Al abrir la app, los cambios en cola se envían solo cuando App confirma que la sesión es de su dueña
      // (syncCacheWithSession). La demo no tiene sesión: se reanudan de una vez.
      onSuccess={() => {
        onCacheRestored()
        if (isDemo) resumePendingMutations()
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PersistQueryClientProvider>
  </StrictMode>,
)
