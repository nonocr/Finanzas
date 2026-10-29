import { useEffect, useRef, type ReactNode } from 'react';

// transitions.dev · Donut chart: sectores con separación pareja y esquinas suaves
// que se transforman hacia los nuevos valores.

function bezier(x1: number, y1: number, x2: number, y2: number) {
  return (t: number) => {
    let lo = 0;
    let hi = 1;
    let u = t;
    for (let i = 0; i < 24; i++) {
      u = (lo + hi) / 2;
      const x = 3 * u * (1 - u) * (1 - u) * x1 + 3 * u * u * (1 - u) * x2 + u * u * u;
      if (x < t) lo = u;
      else hi = u;
    }
    return 3 * u * (1 - u) * (1 - u) * y1 + 3 * u * u * (1 - u) * y2 + u * u * u;
  };
}
const ease = bezier(0.22, 1, 0.36, 1);

function ringPath(cx: number, cy: number, ro: number, ri: number, a0: number, a1: number, gap: number, cr: number) {
  const Ro = ro - cr;
  const Ri = ri + cr;
  const h = gap / 2 + cr;
  if (Ro <= Ri) return '';
  const dO = Math.asin(Math.min(1, h / Ro));
  const dI = Math.asin(Math.min(1, h / Ri));
  const o0 = a0 + dO;
  const o1 = a1 - dO;
  const i0 = a0 + dI;
  const i1 = a1 - dI;
  if (i1 - i0 <= 0 || o1 - o0 <= 0) return '';
  const pt = (r: number, a: number) => (cx + r * Math.sin(a)).toFixed(3) + ' ' + (cy - r * Math.cos(a)).toFixed(3);
  const lo = o1 - o0 > Math.PI ? 1 : 0;
  const li = i1 - i0 > Math.PI ? 1 : 0;
  return (
    'M' + pt(Ro, o0) + 'A' + Ro + ' ' + Ro + ' 0 ' + lo + ' 1 ' + pt(Ro, o1) +
    'L' + pt(Ri, i1) + 'A' + Ri + ' ' + Ri + ' 0 ' + li + ' 0 ' + pt(Ri, i0) + 'Z'
  );
}

export interface DonutSegment {
  key: string;
  value: number;
  color: string;
}

export function Donut({
  segments,
  size = 156,
  thickness = 18,
  dimmed,
  children,
}: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  dimmed?: string | null;
  children?: ReactNode;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const current = useRef<number[] | null>(null);
  const raf = useRef(0);
  const gap = 3;
  const cr = 2;
  const cx = size / 2;
  const ro = cx;
  const ri = ro - thickness;
  const values = segments.map((s) => s.value);
  const key = values.join(',');

  useEffect(() => {
    const paths = svg.current ? [...svg.current.querySelectorAll('path')] : [];
    const draw = (vals: number[]) => {
      const total = vals.reduce((a, b) => a + b, 0) || 1;
      let a = 0;
      vals.forEach((v, k) => {
        const span = (v / total) * Math.PI * 2;
        paths[k]?.setAttribute('d', ringPath(cx, cx, ro, ri, a, a + span, gap, cr));
        a += span;
      });
    };
    cancelAnimationFrame(raf.current);
    const from = current.current;
    const to = values.slice();
    current.current = to;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Mismo número de segmentos: se transforma; si cambió la forma de los datos, se redibuja.
    if (!from || from.length !== to.length || reduce) {
      draw(to);
      return;
    }
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 400);
      const e = ease(t);
      draw(from.map((f, k) => f + (to[k] - f) * e));
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [key, size, thickness]);

  return (
    <div className="t-donut shrink-0" style={{ width: size, height: size }}>
      <svg ref={svg} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {values.length === 0 || values.every((v) => v === 0) ? (
          <circle cx={cx} cy={cx} r={ro - thickness / 2} fill="none" stroke="var(--color-fill)" strokeWidth={thickness} />
        ) : (
          segments.map((s) => (
            <path
              key={s.key}
              className={'t-donut-seg' + (dimmed && dimmed !== s.key ? ' is-dim' : '')}
              style={{ fill: s.color, stroke: s.color, strokeWidth: 2 * cr }}
            />
          ))
        )}
      </svg>
      {children && <div className="t-donut-center">{children}</div>}
    </div>
  );
}
