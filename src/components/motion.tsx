import { useGSAP } from '@gsap/react';
import clsx from 'clsx';
import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import { formatCRC } from '../lib/money';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
// Control segmentado (transitions.dev · Tabs sliding)
// ---------------------------------------------------------------------------

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  const bar = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  useLayoutEffect(() => {
    const tab = bar.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    const p = pill.current;
    if (!tab || !p) return;
    const place = (animate: boolean) => {
      if (!animate) {
        const prev = p.style.transition;
        p.style.transition = 'none';
        p.style.transform = `translateX(${tab.offsetLeft}px)`;
        p.style.width = `${tab.offsetWidth}px`;
        void p.offsetWidth;
        p.style.transition = prev;
      } else {
        p.style.transform = `translateX(${tab.offsetLeft}px)`;
        p.style.width = `${tab.offsetWidth}px`;
      }
    };
    place(!first.current);
    first.current = false;
    const onResize = () => place(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [value]);

  return (
    <div
      ref={bar}
      className={clsx('t-tabs w-full', className)}
      role="tablist"
      // Teclado: una sola parada de Tab; las flechas (e Inicio/Fin) cambian la opción, como en iOS y en ARIA.
      onKeyDown={(e) => {
        const i = options.findIndex((o) => o.value === value);
        const next =
          e.key === 'ArrowRight' ? (i + 1) % options.length
          : e.key === 'ArrowLeft' ? (i - 1 + options.length) % options.length
          : e.key === 'Home' ? 0
          : e.key === 'End' ? options.length - 1
          : -1;
        if (next < 0) return;
        e.preventDefault();
        onChange(options[next].value);
        bar.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
      }}
    >
      <span ref={pill} className="t-tabs-pill" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          tabIndex={o.value === value ? 0 : -1}
          className="t-tab flex-1 text-footnote font-semibold"
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Monto que cuenta hasta su nuevo valor (GSAP)
// ---------------------------------------------------------------------------

/** Signo de colón como marca secundaria: más pequeño y gris, para que mande la cifra grabada. */
export function QuietColon() {
  return <span className="mr-[0.04em] align-baseline text-[0.6em] text-[#9d9da3] [text-shadow:none]">₡</span>;
}

/**
 * Monto que cuenta hasta su nuevo valor. Con `quietCurrency` el ₡ va aparte, como marca secundaria; solo para montos
 * que no son negativos (gastos del periodo), donde no hay signo que colocar antes del ₡.
 */
export function AnimatedAmount({ cents, className, quietCurrency }: { cents: number; className?: string; quietCurrency?: boolean }) {
  if (quietCurrency && cents >= 0)
    return (
      <span className={clsx('tnum', className)}>
        <QuietColon />
        <CountUp cents={cents} format={(c) => formatCRC(c).replace('₡', '')} />
      </span>
    );
  return <CountUp cents={cents} className={clsx('tnum', className)} format={formatCRC} />;
}

function CountUp({ cents, className, format }: { cents: number; className?: string; format: (c: number) => string }) {
  const el = useRef<HTMLSpanElement>(null);
  const shown = useRef<number | null>(null);

  useGSAP(
    () => {
      const node = el.current;
      if (!node) return;
      const from = shown.current;
      shown.current = cents;
      // Primera vez, recién cargado (desde 0) o movimiento reducido: sin conteo, el número aparece tal cual.
      if (!from || from === cents || prefersReducedMotion()) {
        node.textContent = format(cents);
        return;
      }
      const state = { v: from };
      gsap.to(state, {
        v: cents,
        duration: 0.6,
        ease: 'power3.out',
        onUpdate: () => {
          node.textContent = format(Math.round(state.v / 100) * 100);
        },
      });
    },
    { dependencies: [cents], scope: el },
  );

  return (
    <span ref={el} className={className}>
      {format(cents)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Texto que cambia en su lugar (transitions.dev · Text swap soft)
// ---------------------------------------------------------------------------

export function SoftText({ text, className, align }: { text: string; className?: string; align?: 'end' }) {
  const el = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useLayoutEffect(() => {
    const node = el.current;
    if (!node) return;
    const prev = node.dataset.text;
    node.dataset.text = text;
    if (prev === undefined || prev === text) {
      node.textContent = text;
      return;
    }
    clearTimeout(timer.current);
    const out = document.createElement('span');
    out.className = 't-text-soft-old';
    out.setAttribute('aria-hidden', 'true');
    out.textContent = prev;
    const inn = document.createElement('span');
    inn.className = 't-text-soft-new';
    inn.textContent = text;
    const w0 = node.getBoundingClientRect().width;
    node.classList.remove('is-swapping');
    node.replaceChildren(out, inn);
    const w1 = inn.getBoundingClientRect().width;
    node.style.width = w0 + 'px';
    void node.offsetWidth;
    node.classList.add('is-swapping');
    node.style.width = w1 + 'px';
    timer.current = window.setTimeout(() => {
      node.classList.remove('is-swapping');
      node.style.removeProperty('width');
      node.textContent = text;
    }, 280);
  }, [text]);

  return (
    <span
      ref={el}
      className={clsx('t-text-soft', className)}
      style={align ? ({ '--text-soft-align': align } as React.CSSProperties) : undefined}
    />
  );
}
