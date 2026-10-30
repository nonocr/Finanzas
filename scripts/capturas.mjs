// Capturas de verificación en varios tamaños con Chrome headless y el protocolo DevTools (emulación de dispositivo
// y tiempo real: las transiciones CSS sí avanzan). Además mide problemas comunes en cada pantalla.
//
// Uso:  node scripts/capturas.mjs <carpeta-salida> [url-base]
//   Por defecto la base es http://127.0.0.1:5174 (servidor con VITE_DEMO=1, datos de ejemplo, sin datos reales).
//   CAPTURAS_RUTAS="/,/movimientos"  limita las rutas;  CAPTURAS_TAMANOS="iphone,se"  limita los tamaños.
//
// Informa por pantalla: desborde horizontal, elementos táctiles de menos de 44 px y textos de menos de 12 px.
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [outDir, base = 'http://127.0.0.1:5174'] = process.argv.slice(2);
if (!outDir) {
  console.error('Uso: node scripts/capturas.mjs <carpeta-salida> [url-base]');
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const SIZES = {
  se: { width: 375, height: 667, mobile: true },
  iphone: { width: 390, height: 844, mobile: true },
  promax: { width: 430, height: 932, mobile: true },
  horizontal: { width: 844, height: 390, mobile: true },
  ipad: { width: 820, height: 1180, mobile: true },
  escritorio: { width: 1440, height: 900, mobile: false },
};
const ROUTES = (process.env.CAPTURAS_RUTAS ?? '/,/movimientos,/estadisticas,/presupuesto,/mas,/?agregar').split(',');
const sizeNames = (process.env.CAPTURAS_TAMANOS ?? Object.keys(SIZES).join(',')).split(',');

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'capt-'))}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try {
    target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page');
  } catch {
    // Chrome todavía arrancando
  }
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
});
const send = (method, params = {}) =>
  new Promise((res) => {
    const i = ++id;
    pending.set(i, res);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
const evalJs = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;

// Medición en la página: lo que un revisor buscaría a ojo, pero contado.
const AUDIT = `(() => {
  const vw = innerWidth;
  const overflow = document.documentElement.scrollWidth - vw;
  const small = [...document.querySelectorAll('a, button, input, select, textarea, [role=tab], [role=switch]')]
    .filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).opacity !== '0')
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ r }) => r.width > 0 && (r.width < 44 || r.height < 44))
    .map(({ el, r }) => (el.getAttribute('aria-label') || el.textContent.trim() || el.tagName).slice(0, 24) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
  const tiny = new Set();
  for (const el of document.querySelectorAll('body *')) {
    if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < 12 && el.getClientRects().length) tiny.add(el.textContent.trim().slice(0, 16) + ' ' + fs + 'px');
  }
  return { overflow, small: small.slice(0, 12), smallCount: small.length, tiny: [...tiny].slice(0, 8) };
})()`;

await send('Page.enable');
await send('Runtime.enable');
const report = [];
for (const name of sizeNames) {
  const s = SIZES[name];
  await send('Emulation.setDeviceMetricsOverride', { width: s.width, height: s.height, deviceScaleFactor: 2, mobile: s.mobile });
  await send('Emulation.setTouchEmulationEnabled', { enabled: s.mobile });
  for (const route of ROUTES) {
    await send('Page.navigate', { url: base + route });
    await sleep(2200);
    const audit = await evalJs(AUDIT);
    const file = `${name}${route.replace(/[/?]+/g, '-').replace(/-$/, '') || '-inicio'}.png`;
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(outDir, file), Buffer.from(shot.result.data, 'base64'));
    report.push({ tamaño: name, ruta: route, archivo: file, ...audit });
    console.log(`${file}  desborde=${audit.overflow}px  táctiles<44=${audit.smallCount}  texto<12px=${audit.tiny.length}`);
  }
}
writeFileSync(join(outDir, 'informe.json'), JSON.stringify(report, null, 2));
ws.close();
chrome.kill();
process.exit(0);
