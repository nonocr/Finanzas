import { Copy, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '../../components/Toast';
import { Button, EmptyState, IconTile, Row, Screen, Section } from '../../components/ui';
import { isDemo } from '../../lib/api';
import { useApiTokens, useCreateApiToken, useRevokeApiToken } from '../../lib/queries';
import { WALLET_ENDPOINT } from '../../lib/supabase';
import { BackLink } from './MorePage';

const dateFmt = new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short', year: 'numeric' });

const STEPS = [
  'Abre la app Atajos y ve a Automatización. Toca + para crear una nueva.',
  'Elige «Transacción». Selecciona tus tarjetas, deja todas las categorías y marca «Ejecutar inmediatamente».',
  'Toca «Nuevo atajo en blanco» y agrega la acción «Obtener contenido de URL».',
  'Pega la dirección del paso 2. En «Mostrar más», cambia el método a POST.',
  'En Encabezados agrega Authorization con el valor «Bearer » seguido de tu token.',
  'En Cuerpo de la solicitud elige JSON y agrega: amount → Importe, merchant → Comercio, card → Tarjeta o pase, name → Nombre.',
  'Listo. Paga algo con Apple Pay y el gasto aparecerá aquí; si no se puede categorizar, quedará «por revisar».',
];

export function WalletPage() {
  const { data: tokens = [] } = useApiTokens();
  const create = useCreateApiToken();
  const revoke = useRevokeApiToken();
  const toast = useToast();
  const [fresh, setFresh] = useState<string | null>(null);
  const endpoint = WALLET_ENDPOINT || 'https://<tu-proyecto>.supabase.co/functions/v1/wallet-ingest';

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${what} copiado`);
    } catch {
      toast('No se pudo copiar; mantén presionado para copiar');
    }
  };

  return (
    <Screen title="Apple Wallet" subtitle={<BackLink />}>
      <p className="px-1 text-subhead text-label-2">
        Una automatización de Atajos envía cada pago con Apple Pay a la app, con el monto, el comercio y la tarjeta. Solo
        funciona con pagos hechos desde el iPhone o el Apple Watch.
      </p>
      {isDemo && (
        <p className="mt-3 rounded-card bg-orange/15 p-4 text-subhead">
          Estás en modo demo: el token sirve para practicar, pero los pagos reales llegan solo cuando conectes Supabase.
        </p>
      )}

      <Section header="1. Tu token">
        {fresh ? (
          <div className="p-4">
            <p className="text-subhead text-label-2">Cópialo ahora; por seguridad no se vuelve a mostrar.</p>
            <p className="tnum mt-2 rounded-[10px] bg-card-2 p-3 font-mono text-footnote break-all select-all">{fresh}</p>
            <Button variant="tinted" className="mt-3 w-full" onClick={() => copy(fresh, 'Token')}>
              <Copy size={18} strokeWidth={2} />
              Copiar token
            </Button>
          </div>
        ) : tokens.length === 0 ? (
          <EmptyState title="Aún no tienes token" body="Créalo para conectar el Atajo." />
        ) : null}
        {tokens.map((t) => (
          <Row
            key={t.id}
            leading={<IconTile icon={KeyRound} color="var(--color-gray)" />}
            title={t.name}
            subtitle={
              t.last_used_at ? `Último pago recibido ${dateFmt.format(new Date(t.last_used_at))}` : `Creado ${dateFmt.format(new Date(t.created_at))}`
            }
            trailing={
              <button type="button" className="min-h-11 px-1 text-body text-red" onClick={() => revoke.mutate(t.id)}>
                Revocar
              </button>
            }
          />
        ))}
      </Section>
      <Button
        className="mt-3 w-full"
        disabled={create.isPending}
        onClick={async () => setFresh(await create.mutateAsync('Atajo iPhone'))}
      >
        {tokens.length ? 'Crear otro token' : 'Crear token'}
      </Button>

      <Section header="2. Dirección">
        <div className="p-4">
          <p className="font-mono text-footnote break-all text-label-2 select-all">{endpoint}</p>
          <Button variant="tinted" className="mt-3 w-full" onClick={() => copy(endpoint, 'Dirección')}>
            <Copy size={18} strokeWidth={2} />
            Copiar dirección
          </Button>
        </div>
      </Section>

      <Section header="3. Crea la automatización">
        <ol className="p-4">
          {STEPS.map((s, i) => (
            <li key={i} className="flex gap-3 py-2">
              <span className="tnum grid size-6 shrink-0 place-items-center rounded-full bg-blue text-footnote font-bold text-white">
                {i + 1}
              </span>
              <span className="text-subhead">{s}</span>
            </li>
          ))}
        </ol>
      </Section>
    </Screen>
  );
}
