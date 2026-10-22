import { useNavigate } from 'react-router-dom';

import { Button } from '@/shared/ui/Button';

import { formatBroadcastElapsed } from '../lib/playback';
import { liveRoutes } from '../routes';
import { GoLiveWebGate } from './GoLiveWebGate';

type GoLiveEndedViewProps = {
  durationSec: number;
  peakViewers?: number | undefined;
  reason?: string | undefined;
};

/** Post-broadcast summary on phone; web gate on wider viewports. */
export function GoLiveEndedView({ durationSec, peakViewers = 0, reason }: GoLiveEndedViewProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-page flex min-h-[100dvh] flex-col">
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-3.5 px-5 py-8 tab:hidden">
        <h1 className="text-title-sm leading-normal font-extrabold text-ink">Broadcast Ended</h1>
        <p className="text-muted text-3xs leading-relaxed">
          {reason === 'backgrounded'
            ? 'You left the app, so your broadcast stopped. Viewers can no longer watch.'
            : reason === 'max_duration'
              ? 'This stream hit the 2-hour cap and ended automatically.'
              : 'Thanks for streaming on Tapeya.'}
        </p>
        <div className="border-border-subtle bg-surface rounded-panel grid grid-cols-2 gap-3 border p-3">
          <div>
            <span className="text-dim font-mono text-4xs font-bold tracking-eyebrow uppercase">Duration</span>
            <p className="font-mono text-title-sm mt-1 font-semibold tabular-nums text-ink">
              {formatBroadcastElapsed(durationSec)}
            </p>
          </div>
          <div>
            <span className="text-dim font-mono text-4xs font-bold tracking-eyebrow uppercase">Peak Viewers</span>
            <p className="font-mono text-title-sm mt-1 font-semibold tabular-nums text-ink">{peakViewers}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            className="h-11 w-full"
            onClick={() => navigate(liveRoutes.list(), { replace: true })}
          >
            Done
          </Button>
          <Button
            variant="secondary"
            className="h-11 w-full"
            onClick={() => navigate(liveRoutes.goLive(), { replace: true })}
          >
            Start New Broadcast
          </Button>
        </div>
      </div>
      <GoLiveWebGate />
    </div>
  );
}
