import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import { dirname, resolve } from 'path';
// Tailwind v3 (npm alias) — the consumer app's v4 emits color-mix(), unsafe on Chrome 86.
import tailwindcss3 from 'tailwindcss3';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GRAPHICS_BOOTSTRAP_ROOT = resolve(__dirname, 'src/graphics/bootstrap');
const GRAPHICS_BUILD_HTML = resolve(__dirname, 'graphics.html');

/** Paths that must never resolve in the graphics bundle — build fails at import time. */
const FORBIDDEN_GRAPHICS_PREFIXES = [
  '@/pages',
  '@/features',
  '@/layouts',
  '@/hooks',
  '@/context',
  '@/ui',
  '@/components',
  '@/lib/analytics',
  '@/providers/StoreProvider',
  '@/store/store',
  '@/store/slices',
  '@/store/api',
  '@capacitor',
];

const ACCESS_TOKEN_PATH = /^\/\d+-\d+-[a-f0-9]{64}\/?$/;

const GRAPHICS_OPTIMIZE_DEPS = [
  'react',
  'react-dom',
  'react-dom/client',
  'react/jsx-dev-runtime',
  'react/jsx-runtime',
  'react-redux',
  'use-sync-external-store/shim/with-selector',
  'use-sync-external-store/with-selector',
  '@reduxjs/toolkit',
  '@reduxjs/toolkit/query',
  '@reduxjs/toolkit/query/react',
  'laravel-echo',
  'pusher-js',
];

function graphicsSpaFallback() {
  // graphics.html exists at the project root (dev) and in dist-graphics (preview);
  // dist-graphics has no index.html, so this must never rewrite to /index.html.
  const rewriteGraphicsPath = (req, _res, next) => {
    const url = req.url?.split('?')[0] ?? '';
    if (url === '/' || url === '/index.html' || ACCESS_TOKEN_PATH.test(url)) {
      req.url = '/graphics.html';
    }
    next();
  };

  return {
    name: 'graphics-spa-fallback',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use(rewriteGraphicsPath);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewriteGraphicsPath);
    },
  };
}

function forbidConsumerImports() {
  return {
    name: 'forbid-consumer-imports',
    resolveId(source) {
      if (FORBIDDEN_GRAPHICS_PREFIXES.some((prefix) => source.startsWith(prefix))) {
        throw new Error(`[graphics build] Forbidden import: ${source}`);
      }
      return null;
    },
  };
}

export default defineConfig(({ command, isPreview }) => {
  // `command === 'serve'` is also true for `vite preview` — isPreview is the
  // only reliable way to tell dev-server and preview-of-build-output apart.
  // Preview must use __dirname (serves dist-graphics/), same as build.
  const isDevServe = command === 'serve' && !isPreview;

  return {
    // Dev root: bootstrap only — consumer index.html is never discovered.
    root: isDevServe ? GRAPHICS_BOOTSTRAP_ROOT : __dirname,
    plugins: [graphicsSpaFallback(), forbidConsumerImports(), react()],
    optimizeDeps: {
      entries: isDevServe ? [resolve(GRAPHICS_BOOTSTRAP_ROOT, 'index.html')] : [GRAPHICS_BUILD_HTML],
      include: GRAPHICS_OPTIMIZE_DEPS,
      // Crawl deps from bootstrap entry only; explicit include covers subpaths like react-dom/client.
      noDiscovery: false,
    },
    server: {
      port: 5180,
      strictPort: false,
      fs: {
        allow: [__dirname, resolve(__dirname, '../shared')],
      },
    },
    resolve: {
      dedupe: ['react', 'react-dom', 'react-redux'],
      alias: [
        {
          find: '@/graphics/entry/hooks/graphicSessionApiBinding',
          replacement: resolve(__dirname, 'src/graphics/bootstrap/graphicSessionApiBinding.js'),
        },
        { find: '@tapeya/graphics-core', replacement: resolve(__dirname, '../shared/graphics-core/src') },
        { find: '@/graphics/core', replacement: resolve(__dirname, '../shared/graphics-core/src') },
        { find: '@', replacement: resolve(__dirname, 'src') },
      ],
    },
    build: {
      target: ['chrome86', 'edge86', 'firefox78', 'safari14'],
      outDir: 'dist-graphics',
      emptyOutDir: true,
      sourcemap: false,
      cssMinify: true,
      cssCodeSplit: true,
      rollupOptions: {
        input: { graphics: GRAPHICS_BUILD_HTML },
      },
    },
    preview: {
      port: 4174,
      strictPort: true,
    },
    css: {
      // Inline PostCSS so this pipeline never leaks into the consumer build
      // (and the consumer's Tailwind v4 vite plugin never runs here).
      postcss: {
        plugins: [
          tailwindcss3({ config: resolve(__dirname, 'tailwind.graphics.config.cjs') }),
          autoprefixer({
            overrideBrowserslist: ['chrome >= 86', 'edge >= 86', 'firefox >= 78', 'safari >= 14'],
          }),
        ],
      },
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  };
});
