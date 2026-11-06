import { ChevronLeft, CreditCard, Download, EyeOff, FileJson, FileText, KeyRound, Languages, LayoutList, LogOut, Palette, Repeat, RotateCcw, Scale, ShieldCheck, Smartphone, Tags, Trash2, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconTile, Row, Screen, Section } from '../../components/ui';
import { isDemo } from '../../lib/data/api';
import { resetDemo } from '../../lib/data/demoApi';
import { useAccounts } from '../../lib/data/queries';
import { signOutEverywhere } from '../../lib/auth/signOut';
import { useT } from '../../i18n';
import { useTheme } from '../../lib/theme/theme';
import { usePrefs, useSavePrefs } from '../../lib/prefs/usePrefs';
import { Toggle } from '../transactions/TransactionSheet';
import { ChangePasswordSheet } from './security/ChangePasswordSheet';
import { DeleteAccountSheet } from './security/DeleteAccountSheet';
import { TwoFactorSheet } from './security/TwoFactorSheet';
import { useExports } from './exports';

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
  const { data: accounts = [] } = useAccounts();
  const { exportCsv, exportJson } = useExports();
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
        <Row onClick={exportJson} leading={<IconTile icon={FileJson} color="var(--color-label-2)" />} title={t.more.exportJson} subtitle={t.more.exportJsonDetail} />
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
            onClick={() => void signOutEverywhere()}
            leading={<IconTile icon={LogOut} color="var(--color-red)" />}
            title={t.more.signOut}
            destructive
          />
        )}
      </Section>

      <Section>
        <Row to="/privacidad" leading={<IconTile icon={FileText} color="var(--color-label-2)" />} title={t.more.privacy} chevron />
        <Row to="/terminos" leading={<IconTile icon={Scale} color="var(--color-label-2)" />} title={t.more.terms} chevron />
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
