import { ChevronLeft, CreditCard, Download, EyeOff, FileText, KeyRound, Languages, LayoutList, LogOut, Palette, Repeat, RotateCcw, ShieldCheck, Smartphone, Tags, Trash2, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import { IconTile, Row, Screen, Section } from '../../components/ui';
import { api, isDemo } from '../../lib/api';
import { csvRow } from '../../lib/csv';
import { crDayOf, isoDate } from '../../lib/dates';
import { resetDemo } from '../../lib/demoApi';
import { clearOfflineCache } from '../../lib/offline';
import { useAccounts, useLookups } from '../../lib/queries';
import { markPartialSignOut, supabase } from '../../lib/supabase';
import { useT } from '../../i18n';
import { useTheme } from '../../lib/theme';
import { usePrefs, useSavePrefs } from '../../lib/usePrefs';
import { Toggle } from '../transactions/TransactionSheet';
import { ChangePasswordSheet } from './ChangePasswordSheet';
import { DeleteAccountSheet } from './DeleteAccountSheet';
import { TwoFactorSheet } from './TwoFactorSheet';

export function BackLink() {
  const t = useT();
  return (
    <Link to="/mas" className="-ml-1 inline-flex min-h-11 items-center gap-0.5 text-body font-normal text-accent normal-case">
      <ChevronLeft size={22} strokeWidth={2.25} />
      {t.common.settings}
    </Link>
  );
}

export function MorePage() {
  // Con las archivadas: el CSV lleva el nombre de la cuenta y la categoría de cada movimiento, aunque ya no se usen.
  const { catMap, accMap } = useLookups();
  const { data: accounts = [] } = useAccounts();
  const toast = useToast();
  const t = useT();
  const theme = useTheme();
  const prefs = usePrefs();
  const savePrefs = useSavePrefs();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordKey, setPasswordKey] = useState(0);
  const [twoFactorOpen, setTwoFactorOpen] = useState(false);
  const [twoFactorKey, setTwoFactorKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState(0);

  const exportCsv = async () => {
    const txs = await api.listTransactions({ from: '2000-01-01T00:00:00Z', to: new Date(Date.now() + 86_400_000).toISOString() });
    const acc = new Map([...accMap].map(([id, a]) => [id, a.name]));
    const cat = new Map([...catMap].map(([id, c]) => [id, c.name]));
    const rows = [
      t.more.csvHeader,
      ...txs.map((t) => [
        isoDate(crDayOf(t.occurred_at)),
        t.type,
        (t.amount / 100).toFixed(2),
        acc.get(t.account_id) ?? '',
        t.to_account_id ? (acc.get(t.to_account_id) ?? '') : '',
        t.category_id ? (cat.get(t.category_id) ?? '') : '',
        t.merchant,
        t.note,
        t.source,
        t.status,
        t.original_currency === 'USD' && t.original_amount ? (t.original_amount / 100).toFixed(2) : '',
        t.original_currency === 'USD' && t.fx_rate ? String(t.fx_rate) : '',
      ]),
    ];
    const csv = '﻿' + rows.map(csvRow).join('\n');
    const file = new File([csv], t.more.csvFile(isoDate(new Date())), { type: 'text/csv' });
    // En iPhone, compartir abre la hoja de iOS (Guardar en Archivos, AirDrop…).
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
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
    toast(t.more.exported(txs.length));
  };

  return (
    <Screen title={t.common.settings}>
      <Section>
        <Row to="/mas/cuentas" leading={<IconTile icon={CreditCard} color="var(--color-label-2)" />} title={t.more.accounts} trailing={accounts.length} chevron />
        <Row to="/mas/categorias" leading={<IconTile icon={Tags} color="var(--color-label-2)" />} title={t.more.categories} chevron />
        <Row to="/mas/reglas" leading={<IconTile icon={Wand2} color="var(--color-label-2)" />} title={t.more.rules} chevron />
      </Section>

      <Section header={t.more.appearance}>
        <Row to="/mas/tema" leading={<IconTile icon={Palette} color="var(--color-label-2)" />} title={t.more.theme} trailing={t.appearance.themes[theme.id]} chevron />
        <Row
          to="/mas/idioma"
          leading={<IconTile icon={Languages} color="var(--color-label-2)" />}
          title={t.language.row}
          trailing={prefs.lang === 'auto' ? t.language.auto : t.language.names[prefs.lang]}
          chevron
        />
        <Row to="/mas/resumen" leading={<IconTile icon={LayoutList} color="var(--color-label-2)" />} title={t.more.home} subtitle={t.more.homeDetail} chevron />
        <Row
          leading={<IconTile icon={EyeOff} color="var(--color-label-2)" />}
          title={t.more.discreet}
          subtitle={t.more.discreetDetail}
          trailing={<Toggle checked={prefs.discreet} onChange={(v) => savePrefs.mutate({ discreet: v })} label={t.more.discreet} />}
        />
      </Section>

      <Section header={t.more.automatic}>
        <Row
          to="/mas/wallet"
          leading={<IconTile icon={Smartphone} color="var(--color-label-2)" />}
          title={t.more.wallet}
          subtitle={t.more.walletDetail}
          chevron
        />
        <Row to="/mas/fijos" leading={<IconTile icon={Repeat} color="var(--color-label-2)" />} title={t.more.recurring} subtitle={t.more.recurringDetail} chevron />
      </Section>

      {!isDemo && (
        <Section header={t.more.security}>
          <Row
            onClick={() => {
              setPasswordKey((k) => k + 1);
              setPasswordOpen(true);
            }}
            leading={<IconTile icon={KeyRound} color="var(--color-label-2)" />}
            title={t.more.changePassword}
            chevron
          />
          <Row
            onClick={() => {
              setTwoFactorKey((k) => k + 1);
              setTwoFactorOpen(true);
            }}
            leading={<IconTile icon={ShieldCheck} color="var(--color-label-2)" />}
            title={t.more.twoFactor}
            chevron
          />
        </Section>
      )}

      <Section header={t.more.data}>
        <Row onClick={exportCsv} leading={<IconTile icon={Download} color="var(--color-label-2)" />} title={t.more.exportCsv} />
        {isDemo ? (
          <Row
            onClick={() => {
              resetDemo();
              location.reload();
            }}
            leading={<IconTile icon={RotateCcw} color="var(--color-label-2)" />}
            title={t.more.resetDemo}
          />
        ) : (
          <Row
            onClick={async () => {
              // global: invalida la sesión en todos los dispositivos, no solo en este. Sin conexión eso falla y la
              // sesión seguiría abierta aquí: entonces se cierra al menos en este teléfono y se avisa.
              const { error } = await supabase.auth.signOut({ scope: 'global' });
              if (error) {
                markPartialSignOut(); // la pantalla de entrar lo explica
                await supabase.auth.signOut({ scope: 'local' });
              }
              clearOfflineCache(); // la copia local de tus datos no se queda en el teléfono
            }}
            leading={<IconTile icon={LogOut} color="var(--color-red)" />}
            title={t.more.signOut}
            destructive
          />
        )}
      </Section>

      <Section>
        <Row to="/privacidad" leading={<IconTile icon={FileText} color="var(--color-label-2)" />} title={t.more.privacy} chevron />
        {!isDemo && (
          <Row
            onClick={() => {
              setDeleteKey((k) => k + 1);
              setDeleteOpen(true);
            }}
            leading={<IconTile icon={Trash2} color="var(--color-red)" />}
            title={t.more.deleteAccount}
            destructive
          />
        )}
      </Section>
      <ChangePasswordSheet key={passwordKey} open={passwordOpen} onClose={() => setPasswordOpen(false)} />
      <TwoFactorSheet key={`2fa-${twoFactorKey}`} open={twoFactorOpen} onClose={() => setTwoFactorOpen(false)} />
      <DeleteAccountSheet key={`del-${deleteKey}`} open={deleteOpen} onClose={() => setDeleteOpen(false)} onExport={() => void exportCsv()} />

      {isDemo && (
        <p className="mt-6 px-4 text-footnote text-label-2">{t.more.demoNote}</p>
      )}
    </Screen>
  );
}
