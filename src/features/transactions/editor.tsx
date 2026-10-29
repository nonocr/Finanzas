import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Transaction, TxType } from '../../lib/types';
import { TransactionSheet } from './TransactionSheet';

interface EditorApi {
  openNew: (type?: TxType) => void;
  openEdit: (tx: Transaction) => void;
}

const EditorContext = createContext<EditorApi>({ openNew: () => {}, openEdit: () => {} });
export const useEditor = () => useContext(EditorContext);

export function EditorProvider({ children }: { children: ReactNode }) {
  // `?agregar` abre la hoja de una vez (útil para un acceso directo en la pantalla de inicio).
  const [state, setState] = useState<{ open: boolean; tx: Transaction | null; type: TxType; key: number }>(() => ({
    open: new URLSearchParams(location.search).has('agregar'),
    tx: null,
    type: 'gasto',
    key: 0,
  }));

  const openNew = useCallback((type: TxType = 'gasto') => setState((s) => ({ open: true, tx: null, type, key: s.key + 1 })), []);
  const openEdit = useCallback((tx: Transaction) => setState((s) => ({ open: true, tx, type: tx.type, key: s.key + 1 })), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  const value = useMemo(() => ({ openNew, openEdit }), [openNew, openEdit]);

  return (
    <EditorContext.Provider value={value}>
      {children}
      <TransactionSheet key={state.key} open={state.open} tx={state.tx} initialType={state.type} onClose={close} />
    </EditorContext.Provider>
  );
}
