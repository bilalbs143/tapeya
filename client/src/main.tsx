import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';

import { App } from '@/app/App';

import { initSentry } from '@/shared/config/sentry';

import 'react-day-picker/style.css';
import './index.css';

initSentry();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('#root element not found');
}

const reportReactError = Sentry.reactErrorHandler();

createRoot(rootElement, {
  // Adapter: React 19 + exactOptionalPropertyTypes vs Sentry's ErrorInfo typings.
  onUncaughtError: (error, errorInfo) => {
    reportReactError(error, { componentStack: errorInfo.componentStack ?? null });
  },
  onCaughtError: (error, errorInfo) => {
    reportReactError(error, {
      componentStack: errorInfo.componentStack ?? null,
      ...(errorInfo.errorBoundary ? { errorBoundary: errorInfo.errorBoundary } : {}),
    });
  },
  onRecoverableError: (error, errorInfo) => {
    reportReactError(error, { componentStack: errorInfo.componentStack ?? null });
  },
}).render(
  <StrictMode>
    <App />
  </StrictMode>
);
