import { useT } from '../../i18n';
import { WEB_APP_URL } from '../../lib/platform/native';
import { Block, LegalPage, OwnerBlock, Paragraphs } from './LegalLayout';

// Cómo eliminar la cuenta: pública (/eliminar-cuenta), con o sin sesión. Google Play pide un enlace web donde se pueda
// pedir la eliminación sin volver a instalar la app, con el nombre de la app, los pasos y qué se borra o se conserva.
// Esta es la URL que va en Play Console (Contenido de la app → Seguridad de los datos → Eliminación de datos).
export function AccountDeletionPage() {
  const t = useT();
  const d = t.legal.deletion;
  return (
    <LegalPage title={d.title} subtitle={d.intro}>
      <Block title={d.howTo.title}>
        <Paragraphs items={d.howTo.paragraphs(WEB_APP_URL)} />
      </Block>
      {d.sections.map((s) => (
        <Block key={s.title} title={s.title}>
          <Paragraphs items={s.paragraphs} />
        </Block>
      ))}
      <OwnerBlock />
    </LegalPage>
  );
}
