/**
 * Live broadcast viewer — single stream selected from the Live page.
 * Route: /live/broadcast/:broadcastId
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageBackButton } from '@/components/AppSubpageHeader';

import LiveBroadcastItem from './LiveBroadcastItem';
import { getBroadcastById } from './liveBroadcastData';

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function LiveBroadcast() {
  const navigate = useNavigate();
  const { broadcastId } = useParams();
  const broadcast = useMemo(() => getBroadcastById(broadcastId), [broadcastId]);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!broadcast) navigate('/live', { replace: true });
  }, [broadcast, navigate]);

  const toggleLike = useCallback(() => {
    setIsLiked((prev) => !prev);
  }, []);

  if (!broadcast) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-30 overflow-hidden bg-black lg:left-[280px] lg:flex lg:justify-center">
      <div className="relative h-full w-full overflow-hidden lg:max-w-[430px] lg:shrink-0 lg:border-x lg:border-[#1A1A1A]">
        <div className="pointer-events-none absolute top-[calc(env(safe-area-inset-top)+56px)] right-0 left-0 z-20 flex items-center justify-between px-4 py-2 lg:top-14">
          <AppSubpageBackButton
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="pointer-events-auto"
          />

          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
              <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden />
              Live
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[12px] font-bold text-black">
              <EyeIcon />
              {broadcast.viewerCount}
            </span>
          </div>

          <div className="w-9 shrink-0" aria-hidden />
        </div>

        <LiveBroadcastItem broadcast={broadcast} isLiked={isLiked} onLike={toggleLike} />
      </div>
    </div>
  );
}
