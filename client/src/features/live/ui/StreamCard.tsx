import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { LiveBadge } from '@/shared/ui/LiveBadge';

import type { LiveStream } from '../model/schemas';
import { liveRoutes } from '../routes';
import { StreamHostRow } from './StreamHostRow';

type StreamCardProps = {
  stream: LiveStream;
  className?: string | undefined;
};

/** Live hub list card — thumbnail, LIVE pill, host row. */
export function StreamCard({ stream, className }: StreamCardProps) {
  const isLive = stream.status === 'live';

  return (
    <li className={cn('border-border-subtle border-b', className)}>
      <Link
        to={liveRoutes.broadcast(stream.id)}
        className="focus-visible:outline-brand group flex flex-col focus-visible:outline-2"
      >
        <div className="bg-brand-deep relative aspect-video overflow-hidden">
          {stream.thumbnailUrl ? (
            <img
              src={stream.thumbnailUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <span className="font-mono absolute inset-0 grid place-items-center text-3xs font-bold tracking-eyebrow text-white/20">
              TAPEYA LIVE
            </span>
          )}
          {isLive ? <LiveBadge variant="media" className="absolute top-2.5 left-2.5" /> : null}
        </div>

        <div className="px-4 py-3">
          <StreamHostRow
            host={stream.host}
            isLive={isLive}
            title={stream.title}
            description={stream.description || undefined}
          />
        </div>
      </Link>
    </li>
  );
}
