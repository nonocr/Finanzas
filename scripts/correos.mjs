// Correos de Supabase Auth en español: plantillas en supabase/templates/ y asuntos aquí.
// Toca la configuración de PRODUCCIÓN: sin --aplicar solo muestra qué cambiaría.
//   node scripts/correos.mjs            → compara con lo que hay en producción
//   node scripts/correos.mjs --aplicar  → aplica (solo con autorización explícita de la dueña)
// Usa el token de supabase/.env.cli (SUPABASE_ACCESS_TOKEN), nunca el login global de la CLI.
import { readFileSync } from 'node:fs';

const REF = 'qdrkbocandltwfvofngt';
const root = new URL('..', import.meta.url);
const template = (name) => readFileSync(new URL(`supabase/templates/${name}`, root), 'utf8');

const bilingual = (es, en) => `{{ if eq (printf "%v" .Data.lang) "en" }}${en}{{ else }}${es}{{ end }}`;

const WANTED = {
  // Asunto y cuerpo en el idioma de la cuenta (user_metadata.lang, que manda la app); sin idioma, español. printf evita
  // que una cuenta sin lang haga fallar la plantilla (eq no compara nil con texto).
  mailer_subjects_confirmation: bilingual('Confirma tu correo en Finanzas', 'Confirm your Finanzas email'),
  mailer_templates_confirmation_content: template('confirmacion.html'),
  mailer_subjects_recovery: bilingual('Contraseña nueva para Finanzas', 'New password for Finanzas'),
  mailer_templates_recovery_content: template('recuperar.html'),
  mailer_subjects_password_changed_notification: bilingual('Tu contraseña de Finanzas cambió', 'Your Finanzas password changed'),
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
