import withPWA from '@ducanh2912/next-pwa';
import withBundleAnalyzer from '@next/bundle-analyzer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Console banner: show which template is active; print once from server compiler
let __BANNER_PRINTED__ = false;

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Ignore partial (206) responses in runtime caching to avoid Workbox cachePut errors
const ignorePartialResponsePlugin = {
  cacheWillUpdate: async ({ response }) =>
    response && response.status === 206 ? null : response,
};

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  // output: 'standalone',
  output: 'export',
  distDir: 'out',
  poweredByHeader: false,
  // Disable source maps in production to reduce build size
  productionBrowserSourceMaps: false,
  // Windows-specific fixes
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  // Next.js 16 experimental features
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      'react-redux',
      '@reduxjs/toolkit',
      'embla-carousel-react',
      'react-hook-form',
      '@hookform/resolvers',
    ],
    scrollRestoration: true,
    // Note: 'turbo' is not a valid experimental option in Next.js 16
    // Removed to avoid warning
  },

  images: {
    unoptimized: true, // ✅ Needed for static export
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compression
  compress: true,

  // Bundle optimization
  webpack: (config, { dev, isServer, webpack }) => {
    // ========================================
    // 1. Module Resolution
    // ========================================
    config.resolve = {
      ...config.resolve,
      extensionAlias: {
        '.js': ['.js', '.ts', '.tsx'],
      },
    };

    // ========================================
    // 2. Let Next.js use postcss.config.mjs automatically
    // DO NOT override PostCSS config - let it use the external file
    // ========================================
    // This section is intentionally empty - Next.js will automatically
    // load postcss.config.mjs which has the @tailwindcss/postcss plugin

    // ========================================
    // 3. Template CSS Exclusion Logic
    // ========================================
    const activeTemplate = process.env.NEXT_PUBLIC_TEMPLATE || 'template1';
    const emptyCssPath = path.resolve(__dirname, 'src/lib/empty.css');
    const emptyTemplatePath = path.resolve(
      __dirname,
      'src/lib/empty-template.js',
    );

    // Print active template banner
    if (dev && !isServer && !__BANNER_PRINTED__) {
      __BANNER_PRINTED__ = true;
      const colorCyan = '\u001b[36m';
      const colorGreen = '\u001b[32m';
      const colorReset = '\u001b[0m';
      const line = '=============================================';
      console.log('\n' + colorCyan + line + colorReset);
      console.log(
        `${colorGreen}Active Template:${colorReset} ${activeTemplate}`,
      );
      console.log(colorCyan + line + colorReset + '\n');
    }

    // Exclude non-active template CSS files and layouts
    for (let i = 1; i <= 22; i++) {
      const templateName = `template${i}`;

      if (templateName !== activeTemplate) {
        // Primary exclusion: Replace at module resolution time
        const templateRegex = new RegExp(`template${i}\\.css$`);

        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(
            templateRegex,
            (resource) => {
              // Only replace actual template CSS imports, not loader requests
              if (
                resource.request &&
                resource.request.includes(`template${i}.css`) &&
                !resource.request.includes('!') && // Ignore loader syntax
                !resource.context?.includes('node_modules') // Don't touch node_modules
              ) {
                resource.request = emptyCssPath;

                if (dev && !isServer) {
                  console.log(`[Template] Excluded ${templateName}.css`);
                }
              }
            },
          ),
        );

        // Replace non-active template layout modules with a no-op to keep bundles small
        const layoutRegex = new RegExp(`templates/${templateName}/layout$`);
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(
            layoutRegex,
            emptyTemplatePath,
          ),
        );
      } else if (dev && !isServer) {
        console.log(`[Template] Using ${templateName}.css (active)`);
      }
    }

    // Fallback exclusion: Catch resolved paths
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.normalModuleFactory.tap(
          'TemplateCSSExclusionFallback',
          (nmf) => {
            nmf.hooks.afterResolve.tap(
              'TemplateCSSExclusionFallback',
              (resolveData) => {
                if (!resolveData?.resource) return;

                const resource = resolveData.resource;
                const templateMatch = resource.match(/template(\d+)\.css$/);

                if (templateMatch) {
                  const templateNumber = templateMatch[1];
                  const templateName = `template${templateNumber}`;

                  // Only exclude if not the active template
                  if (templateName !== activeTemplate) {
                    resolveData.resource = emptyCssPath;

                    if (dev && !isServer) {
                      console.log(
                        `[Template Fallback] Excluded ${templateName}.css`,
                      );
                    }
                  }
                }
              },
            );
          },
        );
      },
    });

    // ========================================
    // 4. Production Build Optimizations
    // ========================================
    if (!dev && !isServer) {
      // Enhanced bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        maxAsyncRequests: 25,
        cacheGroups: {
          // React core
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 30,
            enforce: true,
          },
          // Redux ecosystem
          redux: {
            test: /[\\/]node_modules[\\/](@reduxjs|react-redux|redux-persist)[\\/]/,
            name: 'redux',
            chunks: 'all',
            priority: 25,
            enforce: true,
          },
          // Radix UI components
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'radix-ui',
            chunks: 'all',
            priority: 20,
          },
          // framework bundle
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: 'framework',
            priority: 40,
            enforce: true,
          },
          lodash: {
            test: /[\\/]node_modules[\\/]lodash[\\/]/,
            name: 'lodash',
            priority: 15,
          },
          // Template-specific styles
          templateStyles: {
            test: /[\\/](src|public)[\\/]styles[\\/]/,
            name: 'template-styles',
            chunks: 'all',
            priority: 28,
            enforce: true,
          },
          // Common vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
          // Common code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };

      // Tree shaking optimization
      config.optimization.usedExports = true;

      // Minimize configuration
      config.optimization.minimize = true;

      // Disable source maps in production to reduce bundle size
      config.devtool = false;
    }

    // ========================================
    // 5. Server-side Banner
    // ========================================
    if (isServer && !__BANNER_PRINTED__) {
      __BANNER_PRINTED__ = true;
      const template = process.env.NEXT_PUBLIC_TEMPLATE || 'template1';
      const mode = process.env.NODE_ENV || 'development';
      const colorCyan = '\u001b[36m';
      const colorGreen = '\u001b[32m';
      const colorYellow = '\u001b[33m';
      const colorReset = '\u001b[0m';
      const line = '=================================================';

      console.log('\n' + colorCyan + line + colorReset);
      console.log(
        `${colorGreen}Template:${colorReset} ${template}    ${colorGreen}Mode:${colorReset} ${mode}`,
      );
      console.log(colorCyan + line + colorReset + '\n');
    }

    return config;
  },
};

// ========================================
// PWA Configuration
// ========================================
export default withAnalyzer(
  withPWA({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,

    // Workbox configuration
    workboxOptions: {
      // Exclude large chunks from precaching
      exclude: [
        /app\/layout-.*\.js$/,
        /common-.*\.js$/,
        /chunks\/.*\.js$/, // Don't precache all chunks
      ],
      // Clean up old caches
      cleanupOutdatedCaches: true,
      // Client side navigation improvements
      clientsClaim: true,
    },

    // Runtime caching strategies
    runtimeCaching: [
      // Google Fonts
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
          cacheableResponse: {
            statuses: [200],
          },
          plugins: [ignorePartialResponsePlugin],
        },
      },
      // Font files
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-font-assets',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
          cacheableResponse: {
            statuses: [200],
          },
          plugins: [ignorePartialResponsePlugin],
        },
      },
      // CloudFront CDN Images - Matches any CloudFront distribution URLs
      // This rule must come BEFORE other image rules (order matters)
      // After manually replacing S3 URLs with CloudFront URLs, this will cache them
      {
        urlPattern:
          /^https:\/\/d[a-z0-9]+\.cloudfront\.net\/.*\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'cdn-image-assets',
          expiration: {
            maxEntries: 500, // Higher cache for CDN assets
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
          cacheableResponse: {
            statuses: [200],
          },
          plugins: [ignorePartialResponsePlugin],
        },
      },
      // S3 Images - Use StaleWhileRevalidate for better error recovery
      // This rule must come BEFORE the general images rule (order matters)
      // StaleWhileRevalidate serves from cache immediately while updating in background
      // This provides better error recovery than CacheFirst when cache entries are corrupted
      // NOTE: If using CloudFront, this will handle fallback cases
      {
        urlPattern:
          /^https:\/\/art-chip\.s3\.ap-southeast-1\.amazonaws\.com\/.*\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 's3-image-assets',
          expiration: {
            maxEntries: 300, // Increased for better cache utilization
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days (increased from 7 for better performance)
          },
          cacheableResponse: {
            statuses: [200],
          },
          plugins: [ignorePartialResponsePlugin],
        },
      },
      // General Images - Use StaleWhileRevalidate for better error recovery
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-image-assets',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
          cacheableResponse: {
            statuses: [200],
          },
          plugins: [ignorePartialResponsePlugin],
        },
      },
      // Audio files
      {
        urlPattern: /\.(?:mp3|wav|ogg|m4a)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-audio-assets',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
          cacheableResponse: {
            statuses: [200],
          },
          plugins: [ignorePartialResponsePlugin],
        },
      },
      // Video files
      {
        urlPattern: /\.(?:mp4|webm|ogg)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-video-assets',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
          cacheableResponse: {
            statuses: [200],
          },
          plugins: [ignorePartialResponsePlugin],
          rangeRequests: true, // Support video streaming
        },
      },
      // JavaScript files
      {
        urlPattern: /\.(?:js|mjs)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-js-assets',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
          cacheableResponse: {
            statuses: [200],
          },
          plugins: [ignorePartialResponsePlugin],
        },
      },
      // CSS files
      {
        urlPattern: /\.(?:css|less|scss)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-style-assets',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 365 * 24 * 60 * 60,
          },
          plugins: [ignorePartialResponsePlugin],
        },
      },
      // Data files
      {
        urlPattern: /\.(?:json|xml|csv)$/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'static-data-assets',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
          networkTimeoutSeconds: 10,
          cacheableResponse: {
            statuses: [200],
          },
          plugins: [ignorePartialResponsePlugin],
        },
      },
      // API routes
      {
        urlPattern: /\/api\/.*$/i,
        handler: 'NetworkFirst',
        method: 'GET',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
          networkTimeoutSeconds: 10,
          cacheableResponse: {
            statuses: [200],
          },
          plugins: [ignorePartialResponsePlugin],
        },
      },
      // Default fallback
      {
        urlPattern: /.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'default-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
          networkTimeoutSeconds: 10,
          cacheableResponse: {
            statuses: [200],
          },
          plugins: [ignorePartialResponsePlugin],
        },
      },
    ],
  })(baseConfig),
);
