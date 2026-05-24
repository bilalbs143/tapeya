/**
 * Live broadcast viewer — single stream fetched by matchId.
 * Route: /live/broadcast/:matchId
 *
 * Data is loaded via RTK Query (`getMatch`) and kept in sync with real-time
 * Reverb events (`useMatchStreamChannel`).  No mock data is used.
 */

import { useCallback, useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageBackButton } from '@/components/AppSubpageHeader';
import { useMatchPresenceChannel } from '@/features/stream/hooks/useMatchPresenceChannel';
import { useMatchStreamChannel } from '@/features/stream/hooks/useMatchStreamChannel';
import { LIVE_BROADCAST_SHELL_CLASS, LIVE_BROADCAST_SHELL_STYLE } from '@/lib/constants/liveBroadcastLayout';
import { useGetMatchQuery } from '@/store/api/matchApi';

import LiveBroadcastItem from './LiveBroadcastItem';

const STATUS_BADGE = {
  live: { dot: 'animate-pulse bg-red-500', label: 'Live' },
  starting: { dot: 'animate-pulse bg-yellow-400', label: 'Starting…' },
  ended: { dot: 'bg-white/50', label: 'Ended' },
};

/** Status indicator shown in the top-centre of the viewer. */
function StatusBadge({ status }) {
  const cfg = STATUS_BADGE[status];
  if (!cfg) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
      <span className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} aria-hidden />
      {cfg.label}
    </span>
  );
}

function BroadcastSkeleton() {
  return (
    <div className="flex h-full w-full flex-col justify-center bg-black px-4">
      <div className="w-full animate-pulse rounded-lg bg-[#1A1A1A]" style={{ aspectRatio: '16 / 9' }} />
    </div>
  );
}

function BroadcastError({ onRetry }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-black px-4">
      <p className="text-[14px] text-white/60">Failed to load match.</p>
      <button type="button" onClick={onRetry} className="text-[13px] font-medium text-white underline underline-offset-2">
        Try again
      </button>
    </div>
  );
}

export default function LiveBroadcast() {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const [isLandscape, setIsLandscape] = useState(false);

  const { data: match, isLoading, isError, refetch } = useGetMatchQuery(matchId, { skip: !matchId });

  const streamStatus = match?.stream?.status;
  const presenceEnabled = streamStatus === 'live' || streamStatus === 'starting';

  useMatchStreamChannel(matchId);
  useMatchPresenceChannel(matchId, presenceEnabled);

  useEffect(() => {
    setIsLandscape(false);
  }, [matchId]);

  const toggleLandscape = useCallback(() => setIsLandscape((prev) => !prev), []);

  return (
    <div className={LIVE_BROADCAST_SHELL_CLASS} style={LIVE_BROADCAST_SHELL_STYLE}>
      <div className="relative flex h-full w-full flex-col overflow-hidden lg:mx-auto lg:max-w-[430px] lg:border-x lg:border-[#1A1A1A]">
        <header className="relative z-20 flex shrink-0 items-center justify-between px-4 py-2">
          <AppSubpageBackButton onClick={() => navigate(-1)} aria-label="Go back" />

          {streamStatus && (
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2">
              <StatusBadge status={streamStatus} />
            </div>
          )}

          <div className="w-9 shrink-0" aria-hidden />
        </header>

        {/* Defined player + rotation zone — fills space between toolbar and bottom nav */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {isLoading && <BroadcastSkeleton />}
          {isError && <BroadcastError onRetry={refetch} />}
          {match && <LiveBroadcastItem match={match} isLandscape={isLandscape} onToggleLandscape={toggleLandscape} />}
        </div>
      </div>
    </div>
  );
}
