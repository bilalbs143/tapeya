import { Link } from 'react-router-dom';

import { Button } from '@/shared/ui/Button';

import { liveRoutes } from '../routes';

/** Tab+/desktop placeholder — camera preview is app-only. */
export function GoLiveWebGate() {
  return (
    <div className="hidden min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center tab:flex">
      <p className="font-mono text-dim text-3xs font-bold tracking-eyebrow uppercase">Go Live</p>
      <h1 className="text-title-sm max-w-[28ch] leading-normal font-extrabold text-ink">
        Camera preview is only available in the Tapeya app.
      </h1>
      <p className="text-muted max-w-[36ch] text-2xs leading-relaxed">
        Open Go Live on your phone to broadcast with the camera.
      </p>
      <div className="mt-2 flex w-full max-w-sm flex-col gap-2">
        <Button asChild variant="secondary" className="h-11 w-full">
          <Link to={liveRoutes.list()}>Back to Live</Link>
        </Button>
      </div>
    </div>
  );
}
