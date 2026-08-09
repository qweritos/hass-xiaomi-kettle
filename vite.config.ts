import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import packageJson from './package.json' with { type: 'json' };

export default defineConfig({
  publicDir: resolve(import.meta.dirname, 'custom_components/xiaomi_kettle/brand'),
  define: {
    __CARD_VERSION__: JSON.stringify(packageJson.version),
  },
  build: {
    outDir: resolve(import.meta.dirname, 'custom_components/xiaomi_kettle/frontend'),
    emptyOutDir: true,
    target: 'es2022',
    minify: 'oxc',
    sourcemap: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'xiaomi-kettle-card.js',
    },
  },
});
