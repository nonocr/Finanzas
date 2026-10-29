import type { Session } from '@supabase/supabase-js';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { OfflineBanner } from './components/OfflineBanner';
import { SettingsButton } from './components/SettingsButton';
import { TabBar } from './components/TabBar';
import { ToastProvider } from './components/Toast';
import { LoginPage } from './features/auth/LoginPage';
import { BudgetsPage } from './features/budgets/BudgetsPage';
import { HomePage } from './features/home/HomePage';
import { AccountsPage } from './features/settings/AccountsPage';
import { CategoriesPage } from './features/settings/CategoriesPage';
import { MorePage } from './features/settings/MorePage';
import { RulesPage } from './features/settings/RulesPage';
import { WalletPage } from './features/settings/WalletPage';
import { EditorProvider } from './features/transactions/editor';
import { TransactionsPage } from './features/transactions/TransactionsPage';
import { isDemo } from './lib/api';
import { supabase } from './lib/supabase';

// Recharts es lo más pesado del paquete; solo se carga al abrir Estadísticas.
const StatsPage = lazy(() => import('./features/stats/StatsPage').then((m) => ({ default: m.StatsPage })));

function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(isDemo ? null : undefined);
  useEffect(() => {
    if (isDemo) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return session;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const session = useSession();

  if (!isDemo && session === undefined) return null; // leyendo la sesión guardada
  if (!isDemo && !session) return <LoginPage />;

  return (
    <ToastProvider>
      <EditorProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movimientos" element={<TransactionsPage />} />
          <Route
            path="/estadisticas"
            element={
              <Suspense fallback={null}>
                <StatsPage />
              </Suspense>
            }
          />
          <Route path="/presupuesto" element={<BudgetsPage />} />
          <Route path="/mas" element={<MorePage />} />
          <Route path="/mas/cuentas" element={<AccountsPage />} />
          <Route path="/mas/categorias" element={<CategoriesPage />} />
          <Route path="/mas/reglas" element={<RulesPage />} />
          <Route path="/mas/wallet" element={<WalletPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
        <SettingsButton />
        <OfflineBanner />
        <TabBar />
      </EditorProvider>
    </ToastProvider>
  );
}
