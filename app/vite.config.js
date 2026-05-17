import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Build-time Vite plugin: adds missing loading / decoding hints on <img> in
 * JSX/TSX. Only injects attributes that are absent (never duplicates).
 * Skips elements with fetchpriority="high" (LCP hero images).
 *
 * This avoids the need for a wrapper component while still achieving lazy
 * loading across the entire app.
 */
function autoLazyImages() {
  return {
    name: 'auto-lazy-images',
    enforce: 'pre',
    transform(src, id) {
      if (!/\.(jsx|tsx)$/.test(id) || !src.includes('<img')) return null;

      let changed = false;
      const out = src.replace(/<img\b([\s\S]*?)\/>/g, (match, attrs) => {
        // Never touch LCP / above-the-fold hero images
        if (/fetchpriority=["']high["']/.test(attrs)) return match;

        const hasLoading = /\bloading=/.test(attrs);
        const hasDecoding = /\bdecoding=/.test(attrs);
        if (hasLoading && hasDecoding) return match;

        let inject = '';
        if (!hasLoading && !hasDecoding) inject = ' loading="lazy" decoding="async"';
        else if (!hasLoading) inject = ' loading="lazy"';
        else inject = ' decoding="async"';

        changed = true;
        return `<img${attrs}${inject}/>`;
      });

      return changed ? { code: out } : null;
    },
  };
}

export default defineConfig({
  plugins: [autoLazyImages(), react(), tailwindcss()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    // Ship each route's CSS only when the route is visited
    cssCodeSplit: true,
    // ApexCharts core alone is ~500 kB minified; split into apex + react wrapper
    // chunks (see manualChunks) so each file stays under this budget.
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: {
        /**
         * Group node_modules into stable, cache-friendly named chunks.
         * Page modules are automatically split by React.lazy() dynamic imports.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // ApexCharts: split core vs React wrapper so neither chunk trips the
          // default Rollup size warning (~500 kB) as a single bundle.
          if (id.includes('node_modules/react-apexcharts')) return 'charts-react';
          if (id.includes('node_modules/apexcharts')) return 'charts-apex';

          // Swiper carousel — only on pages that use it
          if (id.includes('swiper')) return 'swiper';

          // All Radix UI primitives share one chunk
          if (id.includes('@radix-ui')) return 'radix';

          // Redux ecosystem
          if (id.includes('@reduxjs') || id.includes('redux-persist') || id.includes('immer')) return 'redux';

          // Capacitor bridge
          if (id.includes('@capacitor')) return 'capacitor';

          // React core — always needed, maximise long-term caching
          if (id.includes('react-dom') || id.includes('react-router') || id.includes('scheduler')) return 'vendor';
          if (id.includes('/react/') || id.includes('/react@')) return 'vendor';
        },
      },
    },
  },

  // Pre-bundle the most-used deps so the dev server starts fast
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@reduxjs/toolkit', 'react-redux'],
  },
});
