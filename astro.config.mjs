import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwind from '@astrojs/tailwind';

// SSR es necesario: enviamos el formulario, protegemos /admin y hablamos con
// Supabase desde el servidor. Desplegamos en Vercel con su adaptador.
//
// ¿Prefieres un host con Node (Railway, Render, un VPS)? Cambia el adaptador
// por `@astrojs/node` ({ mode: 'standalone' }) y usa `node ./dist/server/entry.mjs`.
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [tailwind()],
});
