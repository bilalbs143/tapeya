'use client';

import { useUnauthorizedHandler } from '@/hooks/useUnauthorizedHandler';

export function UnauthorizedHandler() {
  // This component uses the hook to set up the unauthorized handler
  // It doesn't render anything, just sets up the handler
  useUnauthorizedHandler();

  return null;
}
