import type { ReactNode } from 'react';

/** Shared poster badge — same size/padding on feed rails and desk sidebar. */
export function MediaPosterChip({ children }: { children: ReactNode }) {
  return (
    <span className="bg-brand/85 absolute top-1.5 left-1.5 rounded-full px-2 py-0.5 text-4xs font-bold whitespace-nowrap text-white uppercase">
      {children}
    </span>
  );
}
