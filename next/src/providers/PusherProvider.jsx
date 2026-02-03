'use client';

import { usePusher } from '@/hooks/usePusher';

export default function PusherProvider({ children }) {
  // Initialize Pusher connection
  usePusher();

  return <>{children}</>;
}
