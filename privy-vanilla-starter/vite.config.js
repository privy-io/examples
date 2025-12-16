import { defineConfig } from 'vite';
import { Buffer } from 'buffer';

// Make Buffer available globally for browser
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

export default defineConfig({
  define: {
    'global': 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});

