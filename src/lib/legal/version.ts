// Versión de los documentos legales (Términos de uso y Política de privacidad), que se aceptan juntos.
//
// Es la fecha en que cambiaron por última vez («Actualizados el…» en /terminos y /privacidad). Al cambiar algo que
// afecte lo que la persona acepta (qué se guarda, para qué, con quién, dónde, sus derechos o las condiciones de uso),
// sube esta fecha: la app le pedirá a cada persona aceptar de nuevo (LegalGate) y quedará una fila nueva en
// legal_acceptances. Una corrección de redacción que no cambia nada de eso no necesita subirla.
import { locale } from '../../i18n';

export const LEGAL_VERSION = '2026-11-06';

/** La fecha de la versión como «día» (medianoche UTC), para formatearla con timeZone UTC. */
export const legalVersionDate = (version: string = LEGAL_VERSION) => new Date(`${version}T00:00:00Z`);

/** Fecha de la versión vigente en el idioma actual («6 de noviembre de 2026»). Se llama dentro del render. */
export const formatLegalDate = () =>
  new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(legalVersionDate());

/** ¿Aceptó esta versión o una posterior? Las versiones son fechas AAAA-MM-DD: se comparan como texto. */
export const hasAcceptedLegal = (rows: readonly { version: string }[] | undefined, version: string = LEGAL_VERSION) =>
  (rows ?? []).some((r) => r.version >= version);
