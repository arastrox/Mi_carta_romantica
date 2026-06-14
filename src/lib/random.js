/**
 * Utilidades deterministas: generador pseudoaleatorio sembrado por cadena
 * y ayudantes de fecha. Sembrar por fecha hace que la carta del día sea
 * estable (mismas flores, colores y mensaje durante todo el día).
 */

/** Generador congruencial lineal (LCG) sembrado a partir de un texto.
 *  Usa Math.imul + (>>> 0) para trabajar en enteros de 32 bits sin signo,
 *  garantizando un resultado siempre en [0, 1) (el operador % de JS daría
 *  negativos con dividendos negativos). */
export function seededRandom(seedStr) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = (seedStr.charCodeAt(i) + ((h << 5) - h)) >>> 0;
  }
  return function next() {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    return h / 4294967296; // [0, 1)
  };
}

/** Fecha local en formato YYYY-MM-DD (sin desfase de zona horaria). */
export function localDateString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Fecha legible en español, con la primera letra en mayúscula. */
export function readableDate(d = new Date()) {
  const s = d.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Día del año (1-366), usado para rotar contenido de respaldo. */
export function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86_400_000);
}
