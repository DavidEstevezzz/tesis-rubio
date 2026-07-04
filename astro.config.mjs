import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';

// SSR is required: we submit the form, protect the admin area and talk to
// Supabase from the server. The Node standalone adapter deploys anywhere
// (Railway, Render, Fly, a VPS...). Swap it for @astrojs/vercel or similar
// if you prefer a serverless host.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [tailwind()],
});
