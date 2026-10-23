import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// `base` targets GitHub Pages project sites (/<repo>/). Override with BASE_PATH
// when deploying to a user site or another host.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/cv-maker/',
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // pdf.js ships its worker as a separate chunk; keep it out of the main bundle.
  worker: { format: 'es' },
  // Unit tests cover the pure layers (model, migrations, import heuristics);
  // nothing there needs a DOM, so the default node environment is enough.
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
})
