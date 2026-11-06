import { Fragment, type ReactNode } from 'react';

/** Texto literal que hay que escribir tal cual (en Atajos, MacroDroid…). */
export function Code({ children }: { children: ReactNode }) {
  return <code className="rounded-[5px] bg-card-3 px-1.5 py-0.5 font-mono text-footnote text-label">{children}</code>;
}

/**
 * Texto traducido con marcas simples, para que los archivos de idioma sigan siendo texto plano:
 *   **negrita**   ·   `texto para escribir tal cual`   ·   [texto del enlace](https://…)
 * No interpreta nada más (ni HTML): es seguro con cualquier texto.
 */
export function Rich({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|`(.+?)`|\[(.+?)\]\((https:\/\/[^\s)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(<Fragment key={i++}>{text.slice(last, m.index)}</Fragment>);
    if (m[1] !== undefined) parts.push(<b key={i++}>{m[1]}</b>);
    else if (m[2] !== undefined) parts.push(<Code key={i++}>{m[2]}</Code>);
    else
      parts.push(
        <a key={i++} href={m[4]} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-2">
          {m[3]}
        </a>,
      );
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(<Fragment key={i++}>{text.slice(last)}</Fragment>);
  return <>{parts}</>;
}
