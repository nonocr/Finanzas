import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n';
import { Rich } from '../../i18n/Rich';
import { LEGAL_OWNER } from '../../lib/legal/owner';

// Armazón de las páginas legales públicas (/privacidad, /terminos, /eliminar-cuenta): se abren con o sin sesión, desde
// «Crear cuenta», desde Ajustes y desde las fichas de las tiendas. Los textos están en src/i18n/locales/{es,en}/.

export function Paragraphs({ items }: { items: readonly string[] }) {
  return (
    <>
      {items.map((p, i) => (
        <p key={i}>
          <Rich text={p} />
        </p>
      ))}
    </>
  );
}

export function Block({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-8 scroll-mt-4">
      <h2 className="text-title3 font-bold">{title}</h2>
      <div className="mt-2 space-y-3 text-body text-pretty text-label-2 [&_b]:font-semibold [&_b]:text-label">{children}</div>
    </section>
  );
}

/** Quién responde por los datos y cómo contactarle (src/lib/legal/owner.ts; texto genérico mientras falten datos). */
export function OwnerBlock() {
  const t = useT();
  const o = LEGAL_OWNER;
  return (
    <Block id="responsable" title={t.legal.owner.title}>
      <Paragraphs
        items={[
          o.name ? t.legal.owner.named(o.name) : t.legal.owner.generic,
          ...(o.address ? [t.legal.owner.address(o.address)] : []),
          o.email ? t.legal.owner.contactEmail(o.email) : t.legal.owner.contactGeneric,
        ]}
      />
    </Block>
  );
}

export function LegalPage({ title, subtitle, children }: { title: string; subtitle: ReactNode; children: ReactNode }) {
  const t = useT();
  const navigate = useNavigate();
  // Atrás vuelve a donde estabas (Ajustes, «Crear cuenta», otra página legal); si la página se abrió directo desde un
  // enlace, no hay a dónde volver y se va al inicio.
  const back = () => ((window.history.state as { idx?: number } | null)?.idx ? navigate(-1) : navigate('/'));
  return (
    <main className="mx-auto max-w-xl px-4 pt-[calc(var(--safe-top)+12px)] pb-[calc(var(--safe-bottom)+48px)]">
      <button type="button" onClick={back} className="-ml-1 inline-flex min-h-11 items-center gap-0.5 text-body text-accent">
        <ChevronLeft size={22} strokeWidth={2.25} />
        {t.common.back}
      </button>
      <h1 className="text-large-title font-bold text-balance">{title}</h1>
      <div className="mt-1 text-subhead text-label-2">{subtitle}</div>
      {children}
    </main>
  );
}
