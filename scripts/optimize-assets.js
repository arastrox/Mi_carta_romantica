/**
 * Optimiza imágenes pesadas a WebP para reducir el peso de carga.
 * Uso: npm run optimize:assets
 *
 * Lee las fuentes originales (ignoradas por git) y genera versiones
 * comprimidas en public/bg/. Si la fuente no existe, omite ese paso
 * silenciosamente para que el script sea idempotente.
 */
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const jobs = [
  {
    src: resolve(root, 'assets-src/forest.jpg'),
    out: resolve(root, 'public/bg/forest.webp'),
    width: 1920,
    quality: 68,
  },
];

for (const job of jobs) {
  if (!existsSync(job.src)) {
    console.log(`· omitido (no existe la fuente): ${job.src}`);
    continue;
  }
  mkdirSync(dirname(job.out), { recursive: true });
  await sharp(job.src)
    .resize({ width: job.width, withoutEnlargement: true })
    .webp({ quality: job.quality })
    .toFile(job.out);
  console.log(`✓ ${job.out}`);
}

console.log('Listo.');
