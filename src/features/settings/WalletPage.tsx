import { Copy, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { Disclosure, NumberedSteps } from '../../components/Disclosure';
import { useToast } from '../../components/Toast';
import { Button, EmptyState, IconTile, Row, Screen, Section } from '../../components/ui';
import { locale, useT } from '../../i18n';
import { Rich } from '../../i18n/Rich';
import { isDemo } from '../../lib/api';
import { isAppleMobile, platform } from '../../lib/native';
import { useApiTokens, useCreateApiToken, useRevokeApiToken } from '../../lib/queries';
import { WALLET_SYNC_ENDPOINT } from '../../lib/supabase';
import { BackLink } from './MorePage';

/** Pasos traducidos (con las marcas de <Rich>) listos para NumberedSteps. */
const richSteps = (steps: string[]) => steps.map((s, i) => <Rich key={i} text={s} />);

/** Dirección para copiar, con su nombre. */
function Endpoint({ label, url, onCopy }: { label: string; url: string; onCopy: () => void }) {
  const t = useT();
  return (
    <div className="p-4 shadow-[inset_0_-0.5px_0_var(--color-sep)] last:shadow-none">
      <p className="text-subhead font-semibold">{label}</p>
      <p className="mt-1 font-mono text-footnote break-all text-label-2 select-all">{url}</p>
      <Button variant="tinted" className="mt-3 w-full" onClick={onCopy}>
        <Copy size={18} strokeWidth={2} />
        {t.wallet.copyAddress}
      </Button>
    </div>
  );
}

/** Subtítulo de un grupo de pasos dentro de la guía de iPhone. */
function StepGroup({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="mt-4 first:mt-1">
      <p className="mb-2 text-subhead font-semibold">{title}</p>
      <NumberedSteps steps={richSteps(steps)} />
    </div>
  );
}

/**
 * Registro automático de pagos con tarjeta. iPhone: Atajos + Apple Wallet (el Atajo envía cada pago). Android:
 * MacroDroid reenvía las notificaciones de compra del banco o de Google Wallet (wallet-sync?formato=notificacion).
 * Los dos usan el mismo token y la misma función del servidor.
 */
export function WalletPage() {
  const t = useT();
  const { data: tokens = [] } = useApiTokens();
  const create = useCreateApiToken();
  const revoke = useRevokeApiToken();
  const toast = useToast();
  const [guide, setGuide] = useState<'ios' | 'android' | null>(null);
  // Token recién creado (se muestra una sola vez) y los ids que ya existían, para saber cuál fila es la suya.
  const [fresh, setFresh] = useState<{ token: string; before: Set<string> } | null>(null);
  const freshId = fresh ? tokens.find((tok) => !fresh.before.has(tok.id))?.id : undefined;
  const dateFmt = new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short', year: 'numeric' });

  const createToken = async () => {
    const before = new Set(tokens.map((tok) => tok.id));
    const names = t.wallet.tokenNames;
    const name = isAppleMobile ? names.ios : platform === 'android' ? names.android : names.other;
    setFresh({ token: await create.mutateAsync(name), before });
  };

  const revokeToken = (id: string, name: string) => {
    if (!confirm(t.wallet.revokeConfirm(name))) return;
    revoke.mutate(id);
    // Un token revocado ya no sirve: no se sigue ofreciendo para copiar.
    if (id === freshId) setFresh(null);
  };
  const endpoint = WALLET_SYNC_ENDPOINT || t.wallet.endpointPlaceholder;
  const androidEndpoint = `${endpoint}?formato=notificacion`;

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(t.common.copied(what));
    } catch {
      toast(t.common.copyFailed);
    }
  };

  return (
    <Screen title={t.wallet.title} subtitle={<BackLink />}>
      <p className="px-1 text-subhead text-pretty text-label-2">{t.wallet.intro}</p>
      {isDemo && <p className="mt-4 rounded-card bg-orange/15 p-4 text-subhead">{t.wallet.demo}</p>}

      <Section header={t.wallet.tokenHeader} footer={t.wallet.tokenFooter}>
        {fresh ? (
          <div className="p-4">
            <p className="text-subhead text-label-2">{t.wallet.copyNow}</p>
            <p className="tnum not-money mt-2 rounded-[10px] bg-card-2 p-3 font-mono text-footnote break-all select-all">{fresh.token}</p>
            <Button variant="tinted" className="mt-3 w-full" onClick={() => copy(fresh.token, t.wallet.token)}>
              <Copy size={18} strokeWidth={2} />
              {t.wallet.copyToken}
            </Button>
          </div>
        ) : tokens.length === 0 ? (
          <EmptyState title={t.wallet.noToken} body={t.wallet.noTokenBody} />
        ) : null}
        {tokens.map((tok) => (
          <Row
            key={tok.id}
            leading={<IconTile icon={KeyRound} color="var(--color-gray)" />}
            title={tok.name}
            subtitle={
              tok.last_used_at
                ? t.wallet.lastUsed(dateFmt.format(new Date(tok.last_used_at)))
                : t.wallet.created(dateFmt.format(new Date(tok.created_at)))
            }
            trailing={
              <button type="button" className="min-h-11 px-1 text-body text-red" onClick={() => revokeToken(tok.id, tok.name)}>
                {t.wallet.revoke}
              </button>
            }
          />
        ))}
      </Section>
      <Button className="mt-3 w-full" disabled={create.isPending} onClick={createToken}>
        {tokens.length ? t.wallet.createAnother : t.wallet.createToken}
      </Button>

      <Section header={t.wallet.addressHeader}>
        <Endpoint label={t.wallet.forIphone} url={endpoint} onCopy={() => copy(endpoint, t.wallet.address)} />
        <Endpoint label={t.wallet.forAndroid} url={androidEndpoint} onCopy={() => copy(androidEndpoint, t.wallet.address)} />
      </Section>

      <Section header={t.wallet.howHeader} footer={t.wallet.howFooter}>
        <Disclosure title={t.wallet.ios} pressClass="active:bg-card-2" open={guide === 'ios'} onToggle={() => setGuide(guide === 'ios' ? null : 'ios')}>
          <p className="text-subhead text-pretty text-label-2">{t.wallet.iosIntro}</p>
          <StepGroup title={t.wallet.groupSend} steps={t.wallet.sendSteps} />
          <StepGroup title={t.wallet.groupWallet} steps={t.wallet.walletSteps} />
          <StepGroup title={t.wallet.groupWifi} steps={t.wallet.wifiSteps} />
        </Disclosure>
        <Disclosure
          title={t.wallet.android}
          pressClass="active:bg-card-2"
          open={guide === 'android'}
          onToggle={() => setGuide(guide === 'android' ? null : 'android')}
        >
          <p className="text-subhead text-pretty text-label-2">{t.wallet.androidIntro}</p>
          <div className="mt-3">
            <NumberedSteps steps={richSteps(t.wallet.androidSteps)} />
          </div>
          <p className="mt-3 text-footnote text-pretty text-label-2">{t.wallet.androidNote}</p>
        </Disclosure>
      </Section>
    </Screen>
  );
}
