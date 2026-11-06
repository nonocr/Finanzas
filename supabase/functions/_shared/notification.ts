// Lee el texto de una notificación de compra (app del banco o Google Wallet en Android, reenviada por MacroDroid) y
// saca monto, comercio y tarjeta. Sin dependencias: lo usan la Edge Function (Deno) y las pruebas (Node).
//
// Cada banco escribe distinto y no hay un formato oficial, así que se busca por pistas:
//   «Compra aprobada en AUTOMERCADO ESCAZU por CRC 12,500.00 con su tarjeta VISA ****1234»
//   «Se realizó una compra por ₡12.500,00 en AUTOMERCADO con la tarjeta terminada en 1234»
//   Google Wallet: título «AUTOMERCADO», texto «₡12.500,00 con Visa ••1234»
// Lo que no se reconoce como compra se ignora (códigos de verificación, promociones, dinero recibido, compras
// rechazadas, retiros). Lo que sí se guarda queda siempre por revisar: la persona confirma con un toque.

export type ParsedNotification =
  | { ok: true; amount: string | null; merchant: string | null; card: string | null }
  | { ok: false; reason: 'empty' | 'not_a_purchase' | 'income' | 'declined' | 'withdrawal' };

/** Monto con su moneda, antes o después del número. Devuelve el texto listo para los lectores de montos. */
function findAmount(text: string): string | null {
  const before = /(₡|¢|CRC|US\$|USD|\$)\s?(\d[\d.,]*\d|\d)/i.exec(text);
  const after = /(\d[\d.,]*\d|\d)\s?(colones|CRC|USD|d[oó]lares)(?!\p{L})/iu.exec(text);
  const m = before && (!after || before.index <= after.index) ? { cur: before[1], num: before[2] } : after ? { cur: after[2], num: after[1] } : null;
  if (!m) return null;
  const dollars = /\$|usd|d[oó]lar/i.test(m.cur);
  return dollars ? `USD ${m.num}` : `CRC ${m.num}`;
}

const CARD = /(?:\*{2,}|•{2,}|·{2,}|[xX]{2,}|terminad[ao]\s+en|finalizad[ao]\s+en|que\s+termina\s+en|(?:tarjeta|tarj\.?)[^\d\n]{0,25}?)\s*(\d{4})(?!\d)/i;
const NETWORK = /\b(visa|mastercard|master card|amex|american express)\b/i;

function findCard(text: string): string | null {
  const m = CARD.exec(text);
  if (!m) return null;
  const n = NETWORK.exec(text)?.[1];
  const network = n ? n.replace(/\s+/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) + ' ' : '';
  return `${network}•••• ${m[1]}`;
}

// Lo que corta el nombre del comercio: lo que sigue después ya no es parte del nombre.
const STOP = String.raw`(?=\s+(?:por|con|el\s+d[ií]a|el\s+\d|el\s+(?:lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)|a\s+las|mediante|usando|desde|tarjeta|monto)\b|\s*[,;\n]|\.\s|\.$|$)`;
const MERCHANT_PATTERNS = [
  new RegExp(String.raw`\b(?:comercio|establecimiento)\s*:?\s+(.+?)` + STOP, 'i'),
  new RegExp(String.raw`\ben\s+(.+?)` + STOP, 'gi'),
];
// Lo que viene después de «en» y no es un comercio.
const NOT_MERCHANT = /^(?:su|tu|la|el|una?)\s+(?:tarjeta|cuenta)|^l[ií]nea\b|^(?:₡|¢|crc|usd|us\$|\$|\d)/i;
// Títulos que son del banco o de la app, no del comercio.
const GENERIC_TITLE =
  /(compra|pago|transacci|cargo|consumo|alerta|notificaci|aviso|banco|\bbac\b|credomatic|\bbn\b|\bbcr\b|promerica|davivienda|scotiabank|lafise|wallet|google|tarjeta|cuenta|movimiento|seguridad)/i;

function cleanMerchant(s: string): string | null {
  const v = s.replace(/\s+/g, ' ').replace(/[.:\s]+$/, '').trim();
  return v.length >= 2 && v.length <= 80 ? v : null;
}

function findMerchant(text: string, title: string): string | null {
  for (const re of MERCHANT_PATTERNS) {
    re.lastIndex = 0;
    for (const m of text.matchAll(re.global ? re : new RegExp(re.source, re.flags + 'g'))) {
      const candidate = m[1]?.trim() ?? '';
      if (!candidate || NOT_MERCHANT.test(candidate)) continue;
      const clean = cleanMerchant(candidate);
      if (clean) return clean;
    }
  }
  // Estilo Google Wallet: el título es el comercio.
  if (title && !GENERIC_TITLE.test(title) && !findAmount(title) && !/\d{4}/.test(title)) return cleanMerchant(title);
  return null;
}

/**
 * El cuerpo que manda MacroDroid: primera línea el título de la notificación, el resto su texto.
 * (Si viene todo en una línea, se usa como texto.)
 */
export function parseNotification(body: string): ParsedNotification {
  const raw = body.replace(/\r/g, '').trim().slice(0, 2000);
  if (!raw) return { ok: false, reason: 'empty' };
  const [first, ...rest] = raw.split('\n');
  const title = rest.length ? first.trim() : '';
  const text = (rest.length ? `${first}\n${rest.join('\n')}` : first).trim();

  if (/\b(rechazad|declinad|denegad|no\s+(?:fue\s+)?aprobad|no\s+se\s+pudo|fallid)/i.test(text)) return { ok: false, reason: 'declined' };
  if (/\b(recib|dep[oó]sit|acredit|abono|reembols|devoluci|revers)/i.test(text)) return { ok: false, reason: 'income' };
  if (/\bretiro\b/i.test(text)) return { ok: false, reason: 'withdrawal' };

  const amount = findAmount(text);
  const card = findCard(text);
  const merchant = findMerchant(rest.length ? rest.join('\n') : text, title);
  const purchaseWord = /(compra|pago|cargo|consumo|transacci|d[eé]bito|sinpe|transferencia\s+enviada|pagaste|compraste)/i.test(text);

  // Con monto: basta una palabra de compra o una tarjeta (Google Wallet no dice «compra»). Sin monto: solo si dice que
  // es una compra y trae con qué reconocerla; se guarda con monto 0 para completarlo.
  if (amount && (purchaseWord || card)) return { ok: true, amount, merchant, card };
  if (!amount && purchaseWord && (merchant || card)) return { ok: true, amount: null, merchant, card };
  return { ok: false, reason: 'not_a_purchase' };
}
