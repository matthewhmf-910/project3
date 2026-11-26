import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'node:path';

// Standalone interactive preview: one self-contained HTML file (JS, fonts and score inlined).
export default defineConfig({
  root: path.resolve(__dirname),
  base: './',
  publicDir: false,
  plugins: [react(), viteSingleFile()],
  build: { outDir: path.resolve(__dirname, '../dist-preview'), emptyOutDir: true, assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 10_000 },
});
