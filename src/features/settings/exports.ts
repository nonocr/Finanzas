// Descargar tus datos (Ajustes → Datos, y la hoja de «Eliminar cuenta»).
// - CSV: los movimientos, para abrir en una hoja de cálculo.
// - JSON: todo lo que la cuenta tiene guardado (cuentas, categorías, movimientos, presupuestos, fijos, reglas, claves
//   del Atajo sin su valor, preferencias y las versiones aceptadas de los Términos y la Privacidad). Es la copia
//   completa que pide el derecho de acceso de la Ley 8968 (art. 7: «sobre la totalidad del registro», «exento de
//   codificaciones» y con «explicación de los términos técnicos»): por eso lleva notas que explican cada campo.
import { useToast } from '../../components/Toast';
import { useT } from '../../i18n';
import { api, isDemo } from '../../lib/data/api';
import { useLookups } from '../../lib/data/queries';
import { supabase } from '../../lib/data/supabase';
import { csvRow } from '../../lib/format/csv';
import { crDayOf, isoDate } from '../../lib/format/dates';

const ALL_TIME = () => ({ from: '2000-01-01T00:00:00Z', to: new Date(Date.now() + 86_400_000).toISOString() });

/** En iPhone, compartir abre la hoja de iOS (Guardar en Archivos, AirDrop…); si no se puede, se descarga. */
async function saveFile(file: File): Promise<'shared' | 'downloaded'> {
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return 'shared';
    } catch {
      // cancelado: se cae a la descarga
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
  return 'downloaded';
}

export function useExports() {
  // Con las archivadas: el CSV lleva el nombre de la cuenta y la categoría de cada movimiento, aunque ya no se usen.
  const { catMap, accMap } = useLookups();
  const toast = useToast();
  const t = useT();

  const exportCsv = async () => {
    const txs = await api.listTransactions(ALL_TIME());
    const acc = new Map([...accMap].map(([id, a]) => [id, a.name]));
    const cat = new Map([...catMap].map(([id, c]) => [id, c.name]));
    const rows = [
      t.more.csvHeader,
      ...txs.map((tx) => [
        isoDate(crDayOf(tx.occurred_at)),
        tx.type,
        (tx.amount / 100).toFixed(2),
        acc.get(tx.account_id) ?? '',
        tx.to_account_id ? (acc.get(tx.to_account_id) ?? '') : '',
        tx.category_id ? (cat.get(tx.category_id) ?? '') : '',
        tx.merchant,
        tx.note,
        tx.source,
        tx.status,
        tx.original_currency === 'USD' && tx.original_amount ? (tx.original_amount / 100).toFixed(2) : '',
        tx.original_currency === 'USD' && tx.fx_rate ? String(tx.fx_rate) : '',
      ]),
    ];
    const csv = '﻿' + rows.map(csvRow).join('\n');
    const file = new File([csv], t.more.csvFile(isoDate(new Date())), { type: 'text/csv' });
    if ((await saveFile(file)) === 'downloaded') toast(t.more.exported(txs.length));
  };

  const exportJson = async () => {
    const [accounts, archivedAccounts, categories, archivedCategories, transactions, budgets, recurring, rules, tokens, prefs, legal] =
      await Promise.all([
        api.listAccounts(),
        api.listArchivedAccounts(),
        api.listCategories(),
        api.listArchivedCategories(),
        api.listTransactions(ALL_TIME()),
        api.listAllBudgets(),
        api.listRecurring(),
        api.listMerchantRules(),
        api.listApiTokens(),
        api.getPrefs(),
        // Si la tabla aún no existe (migración sin aplicar), la exportación igual sale con todo lo demás.
        api.listLegalAcceptances().catch(() => []),
      ]);
    // Los datos de la cuenta de acceso salen de la sesión guardada (sin red). La contraseña nunca está disponible.
    const user = isDemo ? null : (await supabase.auth.getSession()).data.session?.user;
    const data = {
      app: 'Finanzas',
      format: 1,
      exported_at: new Date().toISOString(),
      notes: t.more.jsonNotes,
      account: user ? { id: user.id, email: user.email ?? null, created_at: user.created_at, language: user.user_metadata?.lang ?? null } : null,
      accounts: [...accounts, ...archivedAccounts],
      categories: [...categories, ...archivedCategories],
      transactions,
      budgets,
      recurring,
      merchant_rules: rules,
      shortcut_keys: tokens,
      preferences: prefs,
      legal_acceptances: legal,
    };
    const file = new File([JSON.stringify(data, null, 2)], t.more.jsonFile(isoDate(new Date())), { type: 'application/json' });
    if ((await saveFile(file)) === 'downloaded') toast(t.more.exportedAll);
  };

  return { exportCsv, exportJson };
}
