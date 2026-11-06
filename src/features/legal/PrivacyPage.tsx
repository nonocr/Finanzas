import { useT } from '../../i18n';
import { Block, LegalPage, OwnerBlock, Paragraphs } from './LegalLayout';
import { formatLegalDate } from '../../lib/legal/version';

// Política de privacidad: pública (/privacidad), con o sin sesión; las tiendas de apps piden un enlace a ella. Si cambia
// lo que la app guarda, para qué, con quién o dónde, actualiza los textos (src/i18n/locales/{es,en}/legal.ts) y sube
// LEGAL_VERSION (src/lib/legal/version.ts): la fecha de «Actualizada el…» sale de ahí.
export function PrivacyPage() {
  const t = useT();
  const p = t.legal.privacy;
  return (
    <LegalPage title={p.title} subtitle={t.legal.updated(formatLegalDate())}>
      <Block title={p.intro.title}>
        <Paragraphs items={p.intro.paragraphs} />
      </Block>
      <OwnerBlock />
      {p.sections.map((s) => (
        <Block key={s.title} id={'id' in s ? s.id : undefined} title={s.title}>
          <Paragraphs items={s.paragraphs} />
        </Block>
      ))}
    </LegalPage>
  );
}
