import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// En producción se sirve desde https://arastrox.github.io/Mi_carta_romantica/
// por lo que necesitamos el base path del proyecto. En dev usamos la raíz.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Mi_carta_romantica/' : '/',
  plugins: [svelte()],
  server: {
    port: Number(process.env.PORT) || 5173,
  },
}));
