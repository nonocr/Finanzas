import { ChevronLeft, CreditCard, Download, KeyRound, LogOut, RotateCcw, ShieldCheck, Smartphone, Tags, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import { IconTile, Row, Screen, Section } from '../../components/ui';
import { api, isDemo } from '../../lib/api';
import { csvRow } from '../../lib/csv';
import { crDayOf, isoDate } from '../../lib/dates';
import { resetDemo } from '../../lib/demoApi';
import { clearOfflineCache } from '../../lib/offline';
import { useAccounts, useCategories } from '../../lib/queries';
import { supabase } from '../../lib/supabase';
import { ChangePasswordSheet } from './ChangePasswordSheet';
import { TwoFactorSheet } from './TwoFactorSheet';

export function BackLink() {
  return (
    <Link to="/mas" className="-ml-1 inline-flex min-h-11 items-center gap-0.5 text-body font-normal text-blue normal-case">
      <ChevronLeft size={22} strokeWidth={2.25} />
      Ajustes
    </Link>
  );
}

export function MorePage() {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const toast = useToast();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordKey, setPasswordKey] = useState(0);
  const [twoFactorOpen, setTwoFactorOpen] = useState(false);
  const [twoFactorKey, setTwoFactorKey] = useState(0);

  const exportCsv = async () => {
    const txs = await api.listTransactions({ from: '2000-01-01T00:00:00Z', to: new Date(Date.now() + 86_400_000).toISOString() });
    const acc = new Map(accounts.map((a) => [a.id, a.name]));
    const cat = new Map(categories.map((c) => [c.id, c.name]));
    const rows = [
      ['fecha', 'tipo', 'monto', 'cuenta', 'hacia', 'categoria', 'comercio', 'nota', 'origen', 'estado'],
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
      ]),
    ];
    const csv = '﻿' + rows.map(csvRow).join('\n');
    const file = new File([csv], `movimientos-${isoDate(new Date())}.csv`, { type: 'text/csv' });
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
    toast(`${txs.length} movimientos exportados`);
  };

  return (
    <Screen title="Ajustes">
      <Section>
        <Row to="/mas/cuentas" leading={<IconTile icon={CreditCard} color="var(--color-blue)" />} title="Cuentas y tarjetas" trailing={accounts.length} chevron />
        <Row to="/mas/categorias" leading={<IconTile icon={Tags} color="var(--color-orange)" />} title="Categorías" chevron />
        <Row to="/mas/reglas" leading={<IconTile icon={Wand2} color="var(--color-purple)" />} title="Reglas de comercios" chevron />
      </Section>

      <Section header="Automático">
        <Row to="/mas/wallet" leading={<IconTile icon={Smartphone} color="var(--color-blue)" />} title="Apple Wallet" subtitle="Registrar pagos con Atajos" chevron />
      </Section>

      {!isDemo && (
        <Section header="Seguridad">
          <Row
            onClick={() => {
              setPasswordKey((k) => k + 1);
              setPasswordOpen(true);
            }}
            leading={<IconTile icon={KeyRound} color="var(--color-gray)" />}
            title="Cambiar contraseña"
            chevron
          />
          <Row
            onClick={() => {
              setTwoFactorKey((k) => k + 1);
              setTwoFactorOpen(true);
            }}
            leading={<IconTile icon={ShieldCheck} color="var(--color-green)" />}
            title="Verificación en dos pasos"
            chevron
          />
        </Section>
      )}

      <Section header="Datos">
        <Row onClick={exportCsv} leading={<IconTile icon={Download} color="var(--color-teal)" />} title="Exportar movimientos (CSV)" />
        {isDemo ? (
          <Row
            onClick={() => {
              resetDemo();
              location.reload();
            }}
            leading={<IconTile icon={RotateCcw} color="var(--color-gray)" />}
            title="Reiniciar datos de ejemplo"
          />
        ) : (
          <Row
            onClick={async () => {
              // global: invalida la sesión en todos los dispositivos, no solo en este.
              await supabase.auth.signOut({ scope: 'global' });
              clearOfflineCache(); // la copia local de tus datos no se queda en el teléfono
            }}
            leading={<IconTile icon={LogOut} color="var(--color-red)" />}
            title="Cerrar sesión"
            destructive
          />
        )}
      </Section>
      <ChangePasswordSheet key={passwordKey} open={passwordOpen} onClose={() => setPasswordOpen(false)} />
      <TwoFactorSheet key={`2fa-${twoFactorKey}`} open={twoFactorOpen} onClose={() => setTwoFactorOpen(false)} />

      {isDemo && (
        <p className="mt-6 px-4 text-footnote text-label-2">
          Modo demo: los datos son de ejemplo y viven solo en este navegador. Conecta Supabase para guardar tus datos reales en la nube.
        </p>
      )}
    </Screen>
  );
}
