import clsx from 'clsx';
import { Check } from 'lucide-react';
import { Screen, Section } from '../../../components/ui';
import { useT, type LangPref } from '../../../i18n';
import { usePrefs, useSavePrefs } from '../../../lib/prefs/usePrefs';
import { BackLink } from '../MorePage';

/** Ajustes → Idioma: Automático (el del teléfono), Español o English. Se guarda en la cuenta. */
export function LanguagePage() {
  const t = useT();
  const current = usePrefs().lang;
  const save = useSavePrefs();
  const options: { value: LangPref; label: string; detail?: string }[] = [
    { value: 'auto', label: t.language.auto },
    { value: 'es', label: t.language.names.es },
    { value: 'en', label: t.language.names.en },
  ];

  return (
    <Screen title={t.language.title} subtitle={<BackLink />}>
      <Section footer={t.language.footer}>
        <div role="radiogroup" aria-label={t.language.title}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={current === o.value}
              lang={o.value === 'auto' ? undefined : o.value}
              onClick={() => save.mutate({ lang: o.value })}
              className="group flex w-full items-center gap-3 pl-4 text-left transition-colors active:bg-card-2"
            >
              <span className="flex min-h-11 min-w-0 flex-1 items-center gap-3 py-2.5 pr-4 shadow-[inset_0_-0.5px_0_var(--color-sep)] group-last:shadow-none">
                <span className="min-w-0 flex-1">
                  <span className="block text-body">{o.label}</span>
                  {o.detail && <span className="block text-subhead text-label-2">{o.detail}</span>}
                </span>
                <Check size={20} strokeWidth={2.5} className={clsx('shrink-0 text-accent', current !== o.value && 'invisible')} />
              </span>
            </button>
          ))}
        </div>
      </Section>
    </Screen>
  );
}
