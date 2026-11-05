// Correos de Supabase Auth en español: plantillas en supabase/templates/ y asuntos aquí.
// Toca la configuración de PRODUCCIÓN: sin --aplicar solo muestra qué cambiaría.
//   node scripts/correos.mjs            → compara con lo que hay en producción
//   node scripts/correos.mjs --aplicar  → aplica (solo con autorización explícita de la dueña)
// Usa el token de supabase/.env.cli (SUPABASE_ACCESS_TOKEN), nunca el login global de la CLI.
import { readFileSync } from 'node:fs';

const REF = 'qdrkbocandltwfvofngt';
const root = new URL('..', import.meta.url);
const template = (name) => readFileSync(new URL(`supabase/templates/${name}`, root), 'utf8');

const WANTED = {
  mailer_subjects_confirmation: 'Confirma tu correo en Finanzas',
  mailer_templates_confirmation_content: template('confirmacion.html'),
  mailer_subjects_recovery: 'Contraseña nueva para Finanzas',
  mailer_templates_recovery_content: template('recuperar.html'),
  mailer_subjects_password_changed_notification: 'Tu contraseña de Finanzas cambió',
  mailer_templates_password_changed_notification_content: template('contrasena-cambiada.html'),
};

const env = readFileSync(new URL('supabase/.env.cli', root), 'utf8');
const token = /^SUPABASE_ACCESS_TOKEN=["']?([^"'\r\n]+)/m.exec(env)?.[1];
if (!token) throw new Error('Falta SUPABASE_ACCESS_TOKEN en supabase/.env.cli');
const url = `https://api.supabase.com/v1/projects/${REF}/config/auth`;
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

const current = await (await fetch(url, { headers })).json();
const changes = Object.fromEntries(Object.entries(WANTED).filter(([k, v]) => current[k] !== v));
for (const k of Object.keys(WANTED)) console.log(`${k in changes ? 'CAMBIA ' : 'igual  '} ${k}`);

if (!process.argv.includes('--aplicar')) {
  console.log(Object.keys(changes).length ? '\nSin aplicar (usa --aplicar).' : '\nYa está al día.');
} else if (Object.keys(changes).length) {
  const res = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify(changes) });
  if (!res.ok) throw new Error(`Supabase respondió ${res.status}: ${await res.text()}`);
  console.log('\nAplicado.');
}
