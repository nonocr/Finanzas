#!/usr/bin/env node
// Busca credenciales en los archivos del repositorio (y con --history, en todo el historial de git).
// Sale con código 1 si encuentra alguna. Lo corre la CI en cada push; también: `npm run check:secrets`.
//
// La anon key de Supabase es pública por diseño (va dentro de la app): se permite. Una JWT con
// role "service_role", un token de administración (sbp_…) o un token del Atajo (fz_…) nunca deben estar aquí.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const RULES = [
  { name: 'Token de administración de Supabase', re: /\bsbp_[0-9a-f]{40}\b/g },
  { name: 'Clave secreta de Supabase', re: /\bsb_secret_[A-Za-z0-9_-]{20,}/g },
  { name: 'Token del Atajo de Wallet', re: /\bfz_[0-9a-f]{48}\b/g },
  { name: 'Token de GitHub', re: /\b(?:ghp|gho|ghs|ghu)_[A-Za-z0-9]{36}\b|\bgithub_pat_[A-Za-z0-9_]{60,}/g },
  { name: 'Clave de AWS', re: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: 'Clave privada', re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g },
];

const JWT = /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;

/** Rol de una JWT (sin verificar firma), o null si no se puede leer. */
function jwtRole(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    return typeof payload.role === 'string' ? payload.role : null;
  } catch {
    return null;
  }
}

/** Hallazgos en un texto: [{ rule, match }]. Exportado para las pruebas. */
export function findSecrets(text) {
  const found = [];
  for (const { name, re } of RULES) {
    for (const m of text.matchAll(re)) found.push({ rule: name, match: m[0] });
  }
  for (const m of text.matchAll(JWT)) {
    const role = jwtRole(m[0]);
    // anon (pública) y JWT de ejemplo sin rol se permiten; cualquier otra (service_role, authenticated…) no.
    if (role && role !== 'anon') found.push({ rule: `JWT con rol "${role}"`, match: m[0] });
  }
  return found;
}

const mask = (s) => (s.length <= 12 ? '***' : `${s.slice(0, 6)}…${s.slice(-4)}`);

const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', '.impeccable', '.vercel']);
function walk(dir, root = dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, root, out);
    else if (st.size < 2_000_000) out.push(relative(root, p));
  }
  return out;
}

function trackedFiles(root) {
  try {
    return execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  } catch {
    return walk(root); // sin git en el PATH: se revisa el árbol de archivos
  }
}

function main() {
  const root = process.cwd();
  const history = process.argv.includes('--history');
  const problems = [];

  for (const file of trackedFiles(root)) {
    let text;
    try {
      text = readFileSync(join(root, file), 'utf8');
    } catch {
      continue;
    }
    for (const f of findSecrets(text)) problems.push(`${file}: ${f.rule} (${mask(f.match)})`);
  }

  if (history) {
    const log = execFileSync('git', ['log', '--all', '-p', '--no-color'], { cwd: root, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 });
    for (const f of findSecrets(log)) problems.push(`historial de git: ${f.rule} (${mask(f.match)})`);
  }

  if (problems.length) {
    console.error(`Se encontraron ${problems.length} posibles credenciales:\n- ${[...new Set(problems)].join('\n- ')}`);
    console.error('\nQuítalas del código, muévelas a variables de entorno y ROTA las claves (ya pudieron haberse leído).');
    process.exit(1);
  }
  console.log(`Sin credenciales a la vista${history ? ' (archivos e historial)' : ''}.`);
}

if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/').replace(/^\//, '')}`) main();
