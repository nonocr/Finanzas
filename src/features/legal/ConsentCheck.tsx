import { Rich } from '../../i18n/Rich';

/**
 * Casilla de aceptación de los Términos y la Privacidad. Empieza sin marcar y sin ella no se avanza: la Ley 8968 pide
 * consentimiento expreso (art. 5) y autorización expresa para guardar los datos fuera del país (art. 14).
 * El texto lleva enlaces a /terminos y /privacidad. No pregunta la edad (decisión de la dueña, 2026-11-06).
 */
export function ConsentCheck({ checked, onChange, text }: { checked: boolean; onChange: (v: boolean) => void; text: string }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 px-1 py-2 text-footnote text-pretty text-label-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-[22px] shrink-0 cursor-pointer accent-accent"
      />
      <span>
        <Rich text={text} />
      </span>
    </label>
  );
}
