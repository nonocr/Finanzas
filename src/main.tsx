import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CACHE_MAX_AGE, persister, queryClient, resumePendingMutations, shouldPersistMutation } from './lib/offline'

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
      // Al abrir la app: los cambios que quedaron en cola sin conexión se envían (o esperan la señal).
      onSuccess={resumePendingMutations}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PersistQueryClientProvider>
  </StrictMode>,
)
