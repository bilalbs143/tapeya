import { Component, type ErrorInfo, type ReactNode } from 'react';

import { captureException } from '@/shared/config/sentry';
import { Button } from '@/shared/ui/Button';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    captureException(error, { componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-page flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-ink text-lg font-semibold">Something Went Wrong</h1>
          <p className="text-muted max-w-sm text-sm">
            Reload the app to continue. If it keeps happening, try logging in again.
          </p>
          <Button onClick={() => window.location.assign('/')}>Reload</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
