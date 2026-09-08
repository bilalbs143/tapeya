import { Link } from 'react-router-dom';

import { LiveStreamChip } from '@/components/live/LiveStreamChip';
import { LiveStreamThumbnail } from '@/components/live/LiveStreamThumbnail';
import { TapeyaPlatformAvatar } from '@/components/live/TapeyaPlatformAvatar';
import { OfficialBadge } from '@/components/OfficialBadge';
import { UserAvatar } from '@/components/UserAvatar';
import { LIVE_STREAM_SLIDER_ASPECT_CLASS } from '@/lib/constants/streamThumbnail.constants';
import { liveBroadcastPath, liveNowHost } from '@/lib/utils/liveStreamUtils';

function PlayIcon({ className = '' }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

/** Explore feed “{Name} is live now” card — one active hub stream per injection slot. */
export function FeedLiveNowWidget({ stream }) {
  if (!stream?.streamId) return null;

  const host = liveNowHost(stream);
  const headline = `${host.name} is live now`;
  const title = stream.title?.trim() || '';

  return (
    <section className="bg-surface overflow-hidden">
      <Link to={liveBroadcastPath(stream.streamId)} className="group/live block focus-visible:outline-none" aria-label={headline}>
        <header className="flex items-center gap-3 px-4 pt-3.5 pb-3">
          {host.isPlatform ? (
            <TapeyaPlatformAvatar />
          ) : (
            <UserAvatar src={host.avatarUrl} name={host.name} size="xl" ring="brand" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1">
              <p className="truncate text-[14px] text-white">
                <span className="font-bold">{host.name}</span>
                <span className="font-normal text-white/80"> is live now</span>
              </p>
              <OfficialBadge isOfficial={host.isOfficial} size="sm" />
            </div>
            {title ? <p className="text-muted mt-0.5 line-clamp-1 text-[12px]">{title}</p> : null}
          </div>
        </header>

        <div className="relative w-full overflow-hidden bg-black">
          <LiveStreamThumbnail
            src={stream.thumbnail_url}
            alt={title || headline}
            aspectClass={LIVE_STREAM_SLIDER_ASPECT_CLASS}
            largeFallback
            imageClassName="transition-transform duration-300 group-hover/live:scale-[1.02] group-active/live:scale-[1.02]"
          />
          <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
          <span className="absolute inset-0 z-20 grid place-items-center" aria-hidden>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-black/35 ring-1 ring-white/35 backdrop-blur-sm">
              <PlayIcon className="ml-0.5 h-5 w-5 text-white" />
            </span>
          </span>
          <LiveStreamChip className="absolute top-2.5 left-2.5 z-20" />
        </div>
      </Link>
    </section>
  );
}
