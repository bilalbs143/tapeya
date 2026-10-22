import { useEffect } from 'react';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router-dom';
import {
  captureException as sentryCaptureException,
  init,
  reactRouterV7BrowserTracingIntegration,
  replayIntegration,
} from '@sentry/react';

import { env } from './env';

let initialized = false;

/** Sentry SDK init — errors + tracing + replay (docs defaults). §3 */
export function initSentry(): void {
  if (initialized) return;
  if (!env.VITE_SENTRY_DSN) return;

  initialized = true;

  const isProd = import.meta.env.PROD;

  init({
    dsn: env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      reactRouterV7BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      replayIntegration(),
    ],
    // Full traces locally; lower in production.
    tracesSampleRate: isProd ? 0.1 : 1.0,
    tracePropagationTargets: [
      /^\//,
      /^https:\/\/api\.tapeya\.com\/api/,
      /^https:\/\/dev-api\.tapeya\.com\/api/,
      /^http:\/\/127\.0\.0\.1:8000\/api/,
    ],
    replaysSessionSampleRate: isProd ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0,
  });
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.error('[sentry]', error, context);
  }

  if (!env.VITE_SENTRY_DSN || !initialized) return;

  sentryCaptureException(error, context ? { extra: context } : undefined);
}
