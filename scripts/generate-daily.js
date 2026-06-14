/**
 * Genera public/daily.json con el mensaje del día.
 *
 * Pide a Gemini un mensaje romántico nuevo + tema de flor + paleta, valida la
 * respuesta y la escribe. Si Gemini falla o devuelve algo inválido, escribe un
 * respaldo determinista (basado en la fecha) para no publicar NUNCA un JSON roto.
 *
 * Pensado para correr en GitHub Actions (Node 20+, fetch global). El único
 * secreto que necesita es GEMINI_API_KEY en el entorno.
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(root, 'public/daily.json');

const THEMES = ['roses', 'sunflowers', 'daisies', 'tulips', 'cherry_blossoms'];
const HEX = /^#[0-9a-fA-F]{6}$/;

const FALLBACK_MESSAGES = [
  'Eres el pensamiento más dulce que tengo al despertar, la razón por la que sonrío sin darme cuenta. Te amo más de lo que las palabras pueden expresar. ❤️',
  'Cada día contigo es un regalo hermoso. Gracias por iluminar mi mundo con tu ternura, tu sonrisa y tu amor incondicional. Eres mi todo. 🌹',
  'Si tuviera una flor por cada vez que pienso en ti, caminaría para siempre en un jardín eterno. Que tengas un día maravilloso, mi cielo. ✨',
  'Eres mi sol en los días nublados y mi paz en la tormenta. No hay lugar en el mundo donde prefiera estar que en tus brazos. Te amo. 💖',
  'Dos almas que se encuentran y deciden florecer juntas... eso somos tú y yo. Gracias por existir y por hacerme el más feliz del mundo. 🌸',
  'Amo la forma en que me miras, cómo me haces reír y lo segura que se siente mi mano dentro de la tuya. Eres mi felicidad completa. 🥰',
  'Tu amor es el motor de mis días y tu sonrisa mi refugio favorito. Hoy y siempre, mi corazón late solo por ti. Eres mi vida entera. 💕',
];

// Fecha de hoy en la zona horaria de la destinataria (no en UTC del runner).
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });

function dayOfYear() {
  const now = new Date(today + 'T12:00:00');
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86_400_000);
}

function fallback() {
  const doy = dayOfYear();
  return {
    date: today,
    message: FALLBACK_MESSAGES[doy % FALLBACK_MESSAGES.length],
    title: 'Para mi amor ❤️',
    signature: 'Con amor, Pablo 🌹',
    flowerTheme: THEMES[doy % THEMES.length],
    // sin colorScheme → la app elige una paleta acorde al tema
  };
}

function isValid(c) {
  return (
    c &&
    typeof c.message === 'string' &&
    c.message.trim().length > 10 &&
    THEMES.includes(c.flowerTheme) &&
    c.colorScheme &&
    HEX.test(c.colorScheme.primary) &&
    HEX.test(c.colorScheme.secondary) &&
    HEX.test(c.colorScheme.accent)
  );
}

async function fromGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('Falta GEMINI_API_KEY');

  const prompt = `Eres un asistente romántico. Devuelve SOLO un JSON válido (sin markdown, sin texto extra) para una carta de amor de "Pablo" para "Mitsy". Estructura exacta:
{
  "message": "<una frase romántica cálida y original, en español, de 1 a 3 oraciones, distinta cada día, sin clichés repetidos; puede incluir 1 emoji al final>",
  "flowerTheme": "<uno de: roses, sunflowers, daisies, tulips, cherry_blossoms>",
  "colorScheme": {
    "primary": "<hex #RRGGBB que combine con el tema>",
    "secondary": "<hex #RRGGBB armónico>",
    "accent": "<hex #RRGGBB de acento>"
  }
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini respondió HTTP ${res.status}`);

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(clean);
}

let out;
try {
  const c = await fromGemini();
  c.date = today; // la fecha la fijamos nosotros, no el modelo
  c.title = c.title || 'Para mi amor ❤️';
  c.signature = c.signature || 'Con amor, Pablo 🌹';
  if (!isValid(c)) throw new Error('La respuesta de Gemini no pasó la validación');
  out = c;
  console.log('✓ Mensaje generado por Gemini');
} catch (e) {
  console.warn(`⚠ ${e.message} — usando respaldo determinista`);
  out = fallback();
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`Escrito ${OUT} para la fecha ${out.date} (tema: ${out.flowerTheme})`);
