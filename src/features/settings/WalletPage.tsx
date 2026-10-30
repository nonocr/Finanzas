import { Copy, KeyRound } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useToast } from '../../components/Toast';
import { Button, EmptyState, IconTile, Row, Screen, Section } from '../../components/ui';
import { isDemo } from '../../lib/api';
import { useApiTokens, useCreateApiToken, useRevokeApiToken } from '../../lib/queries';
import { WALLET_SYNC_ENDPOINT } from '../../lib/supabase';
import { BackLink } from './MorePage';

const dateFmt = new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short', year: 'numeric' });

/** Texto literal que hay que escribir tal cual en Atajos. */
const K = ({ children }: { children: ReactNode }) => (
  <code className="rounded-[5px] bg-card-3 px-1.5 py-0.5 font-mono text-footnote text-label">{children}</code>
);

const QUEUE_FILE = 'finanzas-pendientes.txt';
const SEND_SHORTCUT = 'Finanzas · Enviar pendientes';

const SEND_STEPS: ReactNode[] = [
  <>En Atajos, pestaña «Atajos», toca + para crear un atajo nuevo. Arriba toca el nombre y ponle <K>{SEND_SHORTCUT}</K>.</>,
  <>
    Agrega «Obtener archivo». Toca «Carpeta» y elige la carpeta <b>Atajos</b> de iCloud Drive. En la ruta escribe{' '}
    <K>{QUEUE_FILE}</K>. Desactiva «Error si no se encuentra».
  </>,
  <>Agrega «Si». Condición: «Archivo» → «no tiene ningún valor». Dentro del Si agrega «Detener este atajo».</>,
  <>
    Debajo de «Fin del Si» agrega «Obtener contenido de URL» y pega la dirección del paso 2. En «Mostrar más»: método POST;
    encabezado <K>Authorization</K> = <K>Bearer </K> + tu token; cuerpo de la solicitud «Archivo» y elige la burbuja «Archivo».
  </>,
  <>
    Agrega otro «Si». Condición: «Contenido de URL» → «contiene» → escribe <K>"ok":true</K> (con las comillas). Dentro del Si
    agrega «Eliminar archivos» con la burbuja «Archivo» y desactiva «Confirmar antes de eliminar».
  </>,
  <>Toca Listo.</>,
];

const WALLET_STEPS: ReactNode[] = [
  <>Pestaña Automatización → + → «Wallet». Elige tus tarjetas, marca «Ejecutar inmediatamente», Siguiente y «Nuevo atajo en blanco».</>,
  <>Agrega «Formatear fecha». Fecha: «Fecha actual». Formato: «ISO 8601» y activa «Incluir hora».</>,
  <>
    Agrega «Diccionario» con 5 elementos de tipo Texto: <K>amount</K> → Importe, <K>merchant</K> → Comercio, <K>card</K> →
    Tarjeta o pase, <K>name</K> → Nombre (burbujas de «Entrada del atajo») y <K>at</K> → «Fecha formateada».
  </>,
  <>
    Agrega «Añadir a archivo de texto». Texto: la burbuja «Diccionario». Carpeta: Atajos. Ruta: <K>{QUEUE_FILE}</K>. Activa
    «Crear nueva línea».
  </>,
  <>Agrega «Ejecutar atajo» y elige «{SEND_SHORTCUT}». Desactiva «Mostrar al ejecutar». Toca Listo.</>,
];

const WIFI_STEPS: ReactNode[] = [
  <>Automatización → + → «Wi‑Fi». Elige «Cualquier red», marca «Ejecutar inmediatamente», Siguiente y «Nuevo atajo en blanco».</>,
  <>Agrega «Ejecutar atajo», elige «{SEND_SHORTCUT}» y toca Listo.</>,
];

function Steps({ steps }: { steps: ReactNode[] }) {
  return (
    <ol className="p-4">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3 py-2">
          <span className="tnum grid size-6 shrink-0 place-items-center rounded-full bg-blue text-footnote font-bold text-white">
            {i + 1}
          </span>
          <span className="text-subhead leading-6">{s}</span>
        </li>
      ))}
    </ol>
  );
}

export function WalletPage() {
  const { data: tokens = [] } = useApiTokens();
  const create = useCreateApiToken();
  const revoke = useRevokeApiToken();
  const toast = useToast();
  const [fresh, setFresh] = useState<string | null>(null);
  const endpoint = WALLET_SYNC_ENDPOINT || 'https://<tu-proyecto>.supabase.co/functions/v1/wallet-sync';

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
      {isDemo && (
        <p className="mb-6 rounded-card bg-orange/15 p-4 text-subhead">
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
              t.last_used_at
                ? `Último pago recibido ${dateFmt.format(new Date(t.last_used_at))}`
                : `Creado ${dateFmt.format(new Date(t.created_at))}`
            }
            trailing={
              <button type="button" className="min-h-11 px-1 text-body text-red" onClick={() => revoke.mutate(t.id)}>
                Revocar
              </button>
            }
          />
        ))}
      </Section>
      <Button className="mt-3 w-full" disabled={create.isPending} onClick={async () => setFresh(await create.mutateAsync('Atajo iPhone'))}>
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

      <Section header="3. Atajo que envía los pagos">
        <Steps steps={SEND_STEPS} />
      </Section>
      <Section header="4. Automatización de Wallet">
        <Steps steps={WALLET_STEPS} />
      </Section>
      <Section header="5. Reenviar al conectarte a Wi‑Fi">
        <Steps steps={WIFI_STEPS} />
      </Section>
    </Screen>
  );
}
