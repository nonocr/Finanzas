import { useT } from '../../i18n';
import { Rich } from '../../i18n/Rich';
import { Block, LegalPage, OwnerBlock, Paragraphs } from './LegalLayout';
import { formatLegalDate } from '../../lib/legal/version';

// Términos de uso: públicos (/terminos), con o sin sesión. Se aceptan junto con la privacidad (misma versión,
// src/lib/legal/version.ts). Textos en src/i18n/locales/{es,en}/terms.ts.
export function TermsPage() {
  const t = useT();
  return (
    <LegalPage title={t.terms.title} subtitle={t.terms.updated(formatLegalDate())}>
      <p className="mt-6 text-body text-pretty text-label-2">
        <Rich text={t.terms.intro} />
      </p>
      {t.terms.sections.map((s) => (
        <Block key={s.title} title={s.title}>
          <Paragraphs items={s.paragraphs} />
        </Block>
      ))}
      <OwnerBlock />
    </LegalPage>
  );
}
