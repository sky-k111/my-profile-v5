import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import mediaCachePlugin from './build/media-cache-plugin.mjs';

export default defineConfig({
  plugins: [react(), tailwindcss(), mediaCachePlugin()],
  server: {
    watch: { ignored: ['**/output/**'] },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
