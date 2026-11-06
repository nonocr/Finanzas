import { Copy, KeyRound } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Disclosure, NumberedSteps } from '../../components/Disclosure';
import { useToast } from '../../components/Toast';
import { Button, EmptyState, IconTile, Row, Screen, Section } from '../../components/ui';
import { isDemo } from '../../lib/api';
import { isAppleMobile, platform } from '../../lib/native';
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
    Debajo de «Fin del Si» agrega «Obtener contenido de URL» y pega la <b>dirección para iPhone</b>. En «Mostrar más»: método POST;
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

const MACRODROID = 'https://play.google.com/store/apps/details?id=com.arlosoft.macrodroid';

const ANDROID_STEPS: ReactNode[] = [
  <>
    Instala{' '}
    <a href={MACRODROID} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-2">
      MacroDroid
    </a>{' '}
    desde Google Play (es gratis) y ábrelo.
  </>,
  <>
    Toca <b>Añadir macro</b> y ponle de nombre <K>Finanzas</K>.
  </>,
  <>
    En <b>Disparadores</b> toca + y busca «Notificación recibida». Elige la app de tu banco y, si pagas con el teléfono,
    también Google Wallet. Deja el contenido en «Cualquiera». MacroDroid te pedirá el <b>acceso a notificaciones</b>:
    actívalo.
  </>,
  <>
    En <b>Acciones</b> toca + y busca «Solicitud HTTP». Método <K>POST</K>. En la URL pega la{' '}
    <b>dirección para Android</b> (arriba).
  </>,
  <>
    En los encabezados agrega uno: nombre <K>Authorization</K>, valor <K>Bearer </K> seguido de tu token (con el espacio
    después de «Bearer»).
  </>,
  <>
    En el cuerpo de la solicitud elige el tipo <K>text/plain</K>. Con el botón de texto mágico (…) inserta el{' '}
    <b>título de la notificación</b>, pasa a la línea siguiente e inserta el <b>texto de la notificación</b>. Debe quedar
    así: <K>[not_title]</K> en la primera línea y <K>[notification]</K> en la segunda.
  </>,
  <>Guarda la macro con el ✓ y revisa que quede activada.</>,
  <>
    En los ajustes del teléfono, en Batería, quita la optimización de batería a MacroDroid: si no, Android la puede
    cerrar y dejaría de enviar.
  </>,
  <>
    Listo: tras tu próxima compra, el pago aparece en Finanzas <b>por revisar</b>. Revisa monto y comercio y confírmalo
    con un toque.
  </>,
];

/** Dirección para copiar, con su nombre. */
function Endpoint({ label, url, onCopy }: { label: string; url: string; onCopy: () => void }) {
  return (
    <div className="p-4 shadow-[inset_0_-0.5px_0_var(--color-sep)] last:shadow-none">
      <p className="text-subhead font-semibold">{label}</p>
      <p className="mt-1 font-mono text-footnote break-all text-label-2 select-all">{url}</p>
      <Button variant="tinted" className="mt-3 w-full" onClick={onCopy}>
        <Copy size={18} strokeWidth={2} />
        Copiar dirección
      </Button>
    </div>
  );
}

/** Subtítulo de un grupo de pasos dentro de la guía de iPhone. */
function StepGroup({ title, steps }: { title: string; steps: ReactNode[] }) {
  return (
    <div className="mt-4 first:mt-1">
      <p className="mb-2 text-subhead font-semibold">{title}</p>
      <NumberedSteps steps={steps} />
    </div>
  );
}

/**
 * Registro automático de pagos con tarjeta. iPhone: Atajos + Apple Wallet (el Atajo envía cada pago). Android:
 * MacroDroid reenvía las notificaciones de compra del banco o de Google Wallet (wallet-sync?formato=notificacion).
 * Los dos usan el mismo token y la misma función del servidor.
 */
export function WalletPage() {
  const { data: tokens = [] } = useApiTokens();
  const create = useCreateApiToken();
  const revoke = useRevokeApiToken();
  const toast = useToast();
  const [guide, setGuide] = useState<'ios' | 'android' | null>(null);
  // Token recién creado (se muestra una sola vez) y los ids que ya existían, para saber cuál fila es la suya.
  const [fresh, setFresh] = useState<{ token: string; before: Set<string> } | null>(null);
  const freshId = fresh ? tokens.find((t) => !fresh.before.has(t.id))?.id : undefined;

  const createToken = async () => {
    const before = new Set(tokens.map((t) => t.id));
    const name = isAppleMobile ? 'Atajo iPhone' : platform === 'android' ? 'MacroDroid Android' : 'Registro automático';
    setFresh({ token: await create.mutateAsync(name), before });
  };

  const revokeToken = (id: string, name: string) => {
    if (!confirm(`¿Revocar «${name}»? Lo que lo usa (el Atajo o MacroDroid) deja de registrar pagos hasta que le pongas otro token.`)) return;
    revoke.mutate(id);
    // Un token revocado ya no sirve: no se sigue ofreciendo para copiar.
    if (id === freshId) setFresh(null);
  };
  const endpoint = WALLET_SYNC_ENDPOINT || 'https://<tu-proyecto>.supabase.co/functions/v1/wallet-sync';
  const androidEndpoint = `${endpoint}?formato=notificacion`;

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${what} copiado`);
    } catch {
      toast('No se pudo copiar; mantén presionado para copiar');
    }
  };

  return (
    <Screen title="Registro automático" subtitle={<BackLink />}>
      <p className="px-1 text-subhead text-pretty text-label-2">
        Tus pagos con tarjeta se registran solos. En iPhone, con Apple Wallet y Atajos. En Android, con las notificaciones
        de compra de tu banco o de Google Wallet y la app MacroDroid.
      </p>
      {isDemo && (
        <p className="mt-4 rounded-card bg-orange/15 p-4 text-subhead">
          Estás en modo demo: el token sirve para practicar, pero los pagos reales llegan solo cuando conectes Supabase.
        </p>
      )}

      <Section header="Tu token" footer="Es la clave que demuestra que los pagos son tuyos. Uno por teléfono; si pierdes uno, revócalo.">
        {fresh ? (
          <div className="p-4">
            <p className="text-subhead text-label-2">Cópialo ahora; por seguridad no se vuelve a mostrar.</p>
            <p className="tnum not-money mt-2 rounded-[10px] bg-card-2 p-3 font-mono text-footnote break-all select-all">{fresh.token}</p>
            <Button variant="tinted" className="mt-3 w-full" onClick={() => copy(fresh.token, 'Token')}>
              <Copy size={18} strokeWidth={2} />
              Copiar token
            </Button>
          </div>
        ) : tokens.length === 0 ? (
          <EmptyState title="Aún no tienes token" body="Créalo para conectar tu teléfono." />
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
              <button type="button" className="min-h-11 px-1 text-body text-red" onClick={() => revokeToken(t.id, t.name)}>
                Revocar
              </button>
            }
          />
        ))}
      </Section>
      <Button className="mt-3 w-full" disabled={create.isPending} onClick={createToken}>
        {tokens.length ? 'Crear otro token' : 'Crear token'}
      </Button>

      <Section header="Dirección">
        <Endpoint label="Para iPhone (Atajos)" url={endpoint} onCopy={() => copy(endpoint, 'Dirección')} />
        <Endpoint label="Para Android (MacroDroid)" url={androidEndpoint} onCopy={() => copy(androidEndpoint, 'Dirección')} />
      </Section>

      <Section
        header="Cómo configurarlo"
        footer="Los pagos se envían cifrados, con tu token, y nunca se duplican. Si llega uno sin categoría conocida, queda por revisar."
      >
        <Disclosure title="iPhone (iOS)" pressClass="active:bg-card-2" open={guide === 'ios'} onToggle={() => setGuide(guide === 'ios' ? null : 'ios')}>
          <p className="text-subhead text-pretty text-label-2">
            Con la app Atajos, que ya viene en el iPhone. Cada pago con Apple Pay se guarda en un archivo y se envía; si no
            hay señal, se envía después.
          </p>
          <StepGroup title="Atajo que envía los pagos" steps={SEND_STEPS} />
          <StepGroup title="Automatización de Wallet" steps={WALLET_STEPS} />
          <StepGroup title="Reenviar al conectarte a Wi‑Fi" steps={WIFI_STEPS} />
        </Disclosure>
        <Disclosure
          title="Android"
          pressClass="active:bg-card-2"
          open={guide === 'android'}
          onToggle={() => setGuide(guide === 'android' ? null : 'android')}
        >
          <p className="text-subhead text-pretty text-label-2">
            Con MacroDroid, gratis en Google Play. Lee solo las notificaciones de las apps que elijas y envía las de compra.
            También capta las compras con la tarjeta física, si tu banco te avisa de ellas.
          </p>
          <div className="mt-3">
            <NumberedSteps steps={ANDROID_STEPS} />
          </div>
          <p className="mt-3 text-footnote text-pretty text-label-2">
            Sin señal en el momento de la compra, MacroDroid no la reenvía después: ese pago regístralo a mano.
          </p>
        </Disclosure>
      </Section>
    </Screen>
  );
}
