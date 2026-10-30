import { useGSAP } from '@gsap/react';
import clsx from 'clsx';
import gsap from 'gsap';
import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Movimiento mínimo (px) antes de decidir si el gesto arrastra la hoja o es un toque/desplazamiento. */
const SLOP = 6;
/** Fracción de la altura de la hoja que hay que bajarla para que se cierre al soltar. */
const CLOSE_FRACTION = 0.28;
/** Velocidad hacia abajo (px/ms) que cierra la hoja aunque no llegue al umbral: el «flick». */
const FLICK_VELOCITY = 0.5;

type Drag = {
  id: number;
  /** Desde el asa/encabezado siempre se puede; desde el contenido, solo si está arriba del todo. */
  from: 'handle' | 'body';
  startX: number;
  startY: number;
  /** Lo que el dedo ya bajó al reconocer el gesto; se descuenta para que la hoja no salte. */
  offset: number;
  state: 'pending' | 'drag' | 'off';
  y: number;
  height: number;
  lastY: number;
  lastT: number;
  velocity: number;
};

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Decide, con el primer movimiento claro, si el gesto es de la hoja (bajar) o del contenido (desplazar). */
function decide(d: Drag, x: number, y: number, body: HTMLElement | null) {
  if (d.state !== 'pending') return;
  const dy = y - d.startY;
  const dx = x - d.startX;
  if (Math.abs(dy) < SLOP && Math.abs(dx) < SLOP) return;
  const atTop = (body?.scrollTop ?? 0) <= 0;
  if (dy > 0 && Math.abs(dy) >= Math.abs(dx) && (d.from === 'handle' || atTop)) {
    d.state = 'drag';
    d.offset = dy;
  } else {
    d.state = 'off';
  }
}

/**
 * Hoja inferior al estilo iOS. Sube con un ease largo y baja más rápido (salida más suave que la entrada).
 * El contenido se desmonta al terminar de cerrar.
 *
 * - `swipeToClose`: se cierra deslizándola hacia abajo desde el asa o desde el contenido cuando está arriba del todo.
 * - `dismissible={false}`: no se cierra por accidente (ni tocando el fondo ni deslizando); solo con sus botones o Escape.
 */
export function Sheet({
  open,
  onClose,
  title,
  leading,
  trailing,
  children,
  swipeToClose = false,
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
  swipeToClose?: boolean;
  dismissible?: boolean;
}) {
  const [mounted, setMounted] = useState(open);
  const root = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  // Si el cierre viene de soltar un arrastre, la salida sigue desde donde quedó la hoja y con su impulso.
  const fling = useRef<{ velocity: number } | null>(null);
  const suppressClick = useRef(false);
  const canSwipe = swipeToClose && dismissible;
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  // Se monta al abrir; se desmonta cuando termina la animación de cierre.
  if (open && !mounted) setMounted(true);

  useGSAP(
    () => {
      const panel = panelRef.current;
      const scrim = scrimRef.current;
      if (!mounted || !panel || !scrim) return;
      const reduce = reducedMotion();
      if (open) {
        fling.current = null;
        gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.3, ease: 'power1.out' });
        gsap.fromTo(panel, { yPercent: 100, y: 0 }, { yPercent: 0, y: 0, duration: reduce ? 0 : 0.5, ease: 'expo.out' });
      } else {
        const flung = fling.current;
        fling.current = null;
        let duration = reduce ? 0 : 0.3;
        let ease = 'power3.in';
        if (flung && !reduce) {
          // Termina el recorrido que falta a la velocidad del dedo (con un mínimo), desacelerando.
          const left = panel.offsetHeight - Number(gsap.getProperty(panel, 'y'));
          duration = gsap.utils.clamp(0.16, 0.3, left / Math.max(flung.velocity, 1.2) / 1000);
          ease = 'power2.out';
        }
        gsap.to(scrim, { opacity: 0, duration: reduce ? 0 : flung ? duration : 0.25, ease: 'power1.out' });
        gsap.to(panel, { yPercent: 100, y: 0, duration, ease, onComplete: () => setMounted(false) });
      }
    },
    { dependencies: [open, mounted], scope: root },
  );

  useEffect(() => {
    if (!open) return;
    // Accesibilidad: el foco entra a la hoja (al panel, no a un campo: así no se abre el teclado), Tab no se escapa
    // a la página de atrás y, al cerrar, vuelve a lo que la abrió.
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = [
        ...panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'),
      ].filter((el) => el.getClientRects().length);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
    // Solo al abrir/cerrar: si dependiera de onClose (una función nueva en cada render), le quitaría el foco al campo.
  }, [open]);

  // iOS: la página de atrás no debe desplazarse ni rebotar mientras la hoja está abierta, y el contenido de la
  // hoja no rebota al jalarlo hacia abajo estando arriba. Hace falta touchmove no pasivo para poder cancelarlo.
  useEffect(() => {
    const el = root.current;
    if (!mounted || !el) return;
    let lastY = 0;
    const onStart = (e: TouchEvent) => {
      lastY = e.touches[0]?.clientY ?? 0;
    };
    const onMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t || !e.cancelable) return;
      const step = t.clientY - lastY;
      lastY = t.clientY;
      const body = bodyRef.current;
      const d = drag.current;
      if (d) decide(d, t.clientX, t.clientY, body);
      if (d?.state === 'drag' || !body || !body.contains(e.target as Node)) {
        // Arrastrando la hoja, o tocando el fondo o el asa: no hay nada que desplazar.
        e.preventDefault();
        return;
      }
      const atTop = body.scrollTop <= 0;
      const atBottom = body.scrollTop + body.clientHeight >= body.scrollHeight - 1;
      if (body.scrollHeight <= body.clientHeight || (atTop && step > 0) || (atBottom && step < 0)) e.preventDefault();
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
    };
  }, [mounted]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    suppressClick.current = false;
    const panel = panelRef.current;
    if (!canSwipe || !open || !panel || !e.isPrimary || e.button !== 0) return;
    const inBody = bodyRef.current?.contains(e.target as Node) ?? false;
    // Con mouse solo desde el asa, para no estorbar la selección de texto en los campos.
    if (inBody && e.pointerType === 'mouse') return;
    drag.current = {
      id: e.pointerId,
      from: inBody ? 'body' : 'handle',
      startX: e.clientX,
      startY: e.clientY,
      offset: 0,
      state: 'pending',
      y: 0,
      height: panel.offsetHeight,
      lastY: e.clientY,
      lastT: e.timeStamp,
      velocity: 0,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const panel = panelRef.current;
    const scrim = scrimRef.current;
    if (!d || e.pointerId !== d.id || !panel || !scrim) return;
    if (!open) {
      // Ya se está cerrando: no se toca la animación de salida, que es la que desmonta la hoja.
      drag.current = null;
      return;
    }
    const wasDragging = d.state === 'drag';
    decide(d, e.clientX, e.clientY, bodyRef.current);
    if (d.state === 'off') {
      drag.current = null;
      return;
    }
    if (d.state !== 'drag') return;
    if (!wasDragging || !panel.hasPointerCapture(d.id)) {
      // Toma el gesto: corta la animación en curso y evita que el toque termine en un clic.
      gsap.killTweensOf([panel, scrim]);
      try {
        panel.setPointerCapture(d.id);
      } catch {
        // El puntero ya no está activo; el arrastre sigue con los eventos que lleguen.
      }
      suppressClick.current = true;
    }
    // Sigue al dedo; hacia arriba no pasa de su sitio.
    const y = Math.max(0, e.clientY - d.startY - d.offset);
    const dt = e.timeStamp - d.lastT;
    if (dt > 0) d.velocity = 0.8 * ((e.clientY - d.lastY) / dt) + 0.2 * d.velocity;
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
    d.y = y;
    gsap.set(panel, { y });
    gsap.set(scrim, { opacity: 1 - y / d.height });
  };

  const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    const panel = panelRef.current;
    const scrim = scrimRef.current;
    if (d.state !== 'drag' || !open || !panel || !scrim) return;
    if (panel.hasPointerCapture(d.id)) panel.releasePointerCapture(d.id);
    // Si el dedo se quedó quieto antes de soltar, no hay impulso.
    const velocity = e.timeStamp - d.lastT < 100 ? d.velocity : 0;
    const close =
      e.type === 'pointerup' &&
      d.y > 0 &&
      (velocity > FLICK_VELOCITY || (d.y > d.height * CLOSE_FRACTION && velocity > -FLICK_VELOCITY / 2));
    if (close) {
      fling.current = { velocity: Math.max(0, velocity) };
      onClose();
      return;
    }
    const reduce = reducedMotion();
    gsap.to(panel, { y: 0, yPercent: 0, duration: reduce ? 0 : 0.45, ease: 'expo.out' });
    gsap.to(scrim, { opacity: 1, duration: reduce ? 0 : 0.3, ease: 'power1.out' });
  };

  if (!mounted) return null;

  return createPortal(
    <div ref={root} className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined}>
      <div
        ref={scrimRef}
        data-scrim
        className="absolute inset-0 touch-none bg-black/60"
        onClick={dismissible ? onClose : undefined}
      />
      <div
        ref={panelRef}
        data-panel
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 mx-auto flex max-w-xl flex-col rounded-t-[14px] bg-card shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_-10px_30px_rgb(0_0_0/0.6)] outline-none"
        style={{ maxHeight: 'calc(100dvh - var(--safe-top) - 12px)' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={(e) => {
          if (!suppressClick.current) return;
          suppressClick.current = false;
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* Asa y encabezado: el navegador no se queda con el gesto (touch-action: none). */}
        <div data-handle className={clsx('shrink-0 touch-none select-none', canSwipe && 'cursor-grab active:cursor-grabbing')}>
          <div className="mx-auto mt-1.5 h-[5px] w-9 rounded-full bg-card-3" aria-hidden="true" />
          {(title || leading || trailing) && (
            <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 pt-2 pb-3">
              <div className="justify-self-start">{leading}</div>
              <h2 id={titleId} className="text-headline font-semibold">
                {title}
              </h2>
              <div className="justify-self-end">{trailing}</div>
            </div>
          )}
        </div>
        <div
          ref={bodyRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(var(--safe-bottom)+24px)]"
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
