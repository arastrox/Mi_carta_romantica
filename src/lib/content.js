/**
 * Carga la configuración del día: mensaje, tema de flor, paleta y canción.
 *
 * Primero arma un respaldo determinista (basado en la fecha) y luego intenta
 * sobreescribirlo con public/daily.json SOLO si su campo `date` coincide con
 * hoy. Así, si olvidas actualizar el JSON, la página sigue mostrando algo
 * bonito en vez de quedar vacía.
 */
import { seededRandom, localDateString, dayOfYear } from './random.js';

export const FLOWER_THEMES = ['roses', 'sunflowers', 'daisies', 'tulips', 'cherry_blossoms'];

const FALLBACK_MESSAGES = [
  'Eres el pensamiento más dulce que tengo al despertar, la razón por la que sonrío sin darme cuenta. Te amo más de lo que las palabras pueden expresar. ❤️',
  'Cada día contigo es un regalo hermoso. Gracias por iluminar mi mundo con tu ternura, tu sonrisa y tu amor incondicional. Eres mi todo. 🌹',
  'Si tuviera una flor por cada vez que pienso en ti, caminaría para siempre en un jardín eterno. Que tengas un día maravilloso, mi cielo. ✨',
  'Eres mi sol en los días nublados y mi paz en la tormenta. No hay lugar en el mundo donde prefiera estar que en tus brazos. Te amo. 💖',
  'Dos almas que se encuentran y deciden florecer juntas... eso somos tú y yo. Gracias por existir y por hacerme el más feliz del mundo. 🌸',
  'Amo la forma en que me miras, cómo me haces reír y lo segura que se siente mi mano dentro de la tuya. Eres mi felicidad completa. 🥰',
  'Tu amor es el motor de mis días y tu sonrisa mi refugio favorito. Hoy y siempre, mi corazón late solo por ti. Eres mi vida entera. 💕',
];

const FALLBACK_SONGS = [
  { title: 'Mellow Summer Folk — Alex Kizenkov', file: 'mellow-summer-folk.mp3' },
  { title: 'Aesthetics — SoulProdMusic', file: 'aesthetics.mp3' },
  { title: 'Lofi Lax — ChillBeat', file: 'lofi-lax.mp3' },
];

const PALETTES = {
  roses: [
    { primary: '#ff4d6d', secondary: '#ff758f', accent: '#ff85a1' },
    { primary: '#d90429', secondary: '#ef233c', accent: '#ffb703' },
    { primary: '#c9184a', secondary: '#ff5c8a', accent: '#ff85a1' },
  ],
  sunflowers: [
    { primary: '#ffb703', secondary: '#fb8500', accent: '#3d2314' },
    { primary: '#ffc300', secondary: '#ff9f1c', accent: '#2c1a0e' },
  ],
  daisies: [
    { primary: '#ffffff', secondary: '#ffb703', accent: '#ffeb3b' },
    { primary: '#f4f1de', secondary: '#e07a5f', accent: '#f2cc8f' },
  ],
  tulips: [
    { primary: '#f72585', secondary: '#7209b7', accent: '#3f37c9' },
    { primary: '#ff595e', secondary: '#ffca3a', accent: '#ff924c' },
    { primary: '#ff99c8', secondary: '#fcf6bd', accent: '#d6e2e9' },
  ],
  cherry_blossoms: [
    { primary: '#ffb3c1', secondary: '#ffc6ff', accent: '#ff85a1' },
    { primary: '#ffccd5', secondary: '#ffb3c1', accent: '#ff758f' },
  ],
};

/** Elige una paleta coherente con el tema, de forma determinista. */
export function colorScheme(theme, rand) {
  const list = PALETTES[theme] || PALETTES.roses;
  return list[Math.floor(rand() * list.length)];
}

export async function loadDailyConfig() {
  const today = localDateString();
  const rand = seededRandom(today);
  const doy = dayOfYear();
  const base = import.meta.env.BASE_URL;

  const theme = FLOWER_THEMES[doy % FLOWER_THEMES.length];
  const song = FALLBACK_SONGS[doy % FALLBACK_SONGS.length];

  const config = {
    date: today,
    message: FALLBACK_MESSAGES[doy % FALLBACK_MESSAGES.length],
    flowerTheme: theme,
    colorScheme: colorScheme(theme, rand),
    title: 'Para mi amor ❤️',
    signature: 'Con amor, Pablo 🌹',
    songTitle: song.title,
    songUrl: `${base}audio/${song.file}`,
    songCover: '',
  };

  try {
    const res = await fetch(`${base}daily.json`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.date === today) {
        if (data.message) config.message = data.message;
        if (data.flowerTheme) config.flowerTheme = data.flowerTheme;
        config.colorScheme = data.colorScheme || colorScheme(config.flowerTheme, rand);
        if (data.title) config.title = data.title;
        if (data.signature) config.signature = data.signature;
        if (data.songTitle) config.songTitle = data.songTitle;
        if (data.songUrl) config.songUrl = resolveAsset(data.songUrl, base);
        if (data.songCover) config.songCover = resolveAsset(data.songCover, base);
      }
    }
  } catch {
    // Sin red o sin archivo: nos quedamos con el respaldo.
  }

  return config;
}

/** Permite que daily.json use rutas relativas (audio/x.mp3) o absolutas (http...). */
function resolveAsset(url, base) {
  if (/^(https?:)?\/\//.test(url) || url.startsWith(base)) return url;
  return base + url.replace(/^\/+/, '');
}
