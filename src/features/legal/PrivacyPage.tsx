import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { locale, useT } from '../../i18n';
import { Rich } from '../../i18n/Rich';

// Política de privacidad: se puede abrir sin cuenta (/privacidad), desde «Crear cuenta» y desde Ajustes. Las tiendas
// de apps piden un enlace público a ella. Si cambia lo que la app guarda o con quién lo comparte, actualízala aquí
// (los textos están en src/i18n/locales/{es,en}/legal.ts).
const UPDATED = new Date(Date.UTC(2026, 10, 6)); // 6 de noviembre de 2026

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-title3 font-bold">{title}</h2>
      <div className="mt-2 space-y-3 text-body text-pretty text-label-2 [&_b]:font-semibold [&_b]:text-label">{children}</div>
    </section>
  );
}

export function PrivacyPage() {
  const t = useT();
  const updated = new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(UPDATED);
  return (
    <main className="mx-auto max-w-xl px-4 pt-[calc(var(--safe-top)+12px)] pb-[calc(var(--safe-bottom)+48px)]">
      <Link to="/" className="-ml-1 inline-flex min-h-11 items-center gap-0.5 text-body text-accent">
        <ChevronLeft size={22} strokeWidth={2.25} />
        {t.common.back}
      </Link>
      <h1 className="text-large-title font-bold">{t.legal.title}</h1>
      <p className="mt-1 text-subhead text-label-2">{t.legal.updated(updated)}</p>

      {t.legal.sections.map((s) => (
        <Block key={s.title} title={s.title}>
          {s.paragraphs.map((p, i) => (
            <p key={i}>
              <Rich text={p} />
            </p>
          ))}
        </Block>
      ))}
    </main>
  );
}
