import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Hoja inferior al estilo iOS. Sube con un ease largo y baja más rápido (salida más suave que la entrada).
 * El contenido se desmonta al terminar de cerrar.
 */
export function Sheet({
  open,
  onClose,
  title,
  leading,
  trailing,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  const root = useRef<HTMLDivElement>(null);
  // Se monta al abrir; se desmonta cuando termina la animación de cierre.
  if (open && !mounted) setMounted(true);

  useGSAP(
    () => {
      if (!mounted || !root.current) return;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const panel = root.current.querySelector('[data-panel]');
      const scrim = root.current.querySelector('[data-scrim]');
      if (open) {
        gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.3, ease: 'power1.out' });
        gsap.fromTo(panel, { yPercent: 100 }, { yPercent: 0, duration: reduce ? 0 : 0.5, ease: 'expo.out' });
      } else {
        gsap.to(scrim, { opacity: 0, duration: reduce ? 0 : 0.25, ease: 'power1.out' });
        gsap.to(panel, {
          yPercent: 100,
          duration: reduce ? 0 : 0.3,
          ease: 'power3.in',
          onComplete: () => setMounted(false),
        });
      }
    },
    { dependencies: [open, mounted], scope: root },
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div ref={root} className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div data-scrim className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        data-panel
        className="absolute inset-x-0 bottom-0 mx-auto flex max-w-xl flex-col rounded-t-[12px] bg-card shadow-[0_-8px_30px_rgb(0_0_0/0.5)]"
        style={{ maxHeight: 'calc(100dvh - var(--safe-top) - 12px)' }}
      >
        <div className="mx-auto mt-1.5 h-[5px] w-9 shrink-0 rounded-full bg-card-3" aria-hidden="true" />
        {(title || leading || trailing) && (
          <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center px-4 pt-2 pb-3">
            <div className="justify-self-start">{leading}</div>
            <h2 className="text-headline font-semibold">{title}</h2>
            <div className="justify-self-end">{trailing}</div>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(var(--safe-bottom)+16px)]">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
