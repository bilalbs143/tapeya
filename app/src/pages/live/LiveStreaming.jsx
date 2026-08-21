/**
 * User-owned watch-URL streams — list + create entry.
 */

import { Link, useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { LiveStreamThumbnail } from '@/components/live/LiveStreamThumbnail';
import { useGetMyLiveStreamsQuery } from '@/store/api/liveApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { LoaderBlock } from '@/ui/Loader';
import { StatusPill } from '@/ui/StatusPill';
import { liveStreamStatusLabel, liveStreamStatusTone } from '@/ui/statusPillTones';

export default function LiveStreaming() {
  const navigate = useNavigate();
  const { data: streams = [], isLoading, isError } = useGetMyLiveStreamsQuery();

  return (
    <div className="bg-black">
      <AppSubpageHeader title="LIVE STREAMING" />
      <Container>
        <p className="mb-6 text-left text-[14px] text-white/90 lg:text-center">
          Add a YouTube or Facebook watch URL so viewers can watch on the Live hub — same as admin external streams.
        </p>

        <Button variant="auth" className="mb-8 w-full lg:w-auto" onClick={() => navigate('/live/streaming/create')}>
          Add Live Stream
        </Button>

        {isLoading ? (
          <LoaderBlock label="Loading streams" className="py-16" />
        ) : (
          <>
            {isError && <p className="text-sm text-red-400">Could not load streams. Try again.</p>}

            <ul className="flex flex-col gap-3 pb-10">
              {streams.map((stream) => {
                const status = stream.stream?.status ?? 'idle';
                return (
                  <li key={stream.id}>
                    <Link
                      to={`/live/streaming/${stream.id}`}
                      className="border-surface bg-ink/80 hover:border-brand/40 flex gap-3 rounded-[12px] border p-3 transition-colors"
                    >
                      <div className="w-[120px] shrink-0 overflow-hidden rounded-md">
                        <LiveStreamThumbnail src={stream.thumbnail_url} title={stream.title} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-white">{stream.title}</p>
                        {stream.description ? (
                          <p className="text-muted mt-0.5 line-clamp-2 text-[12px]">{stream.description}</p>
                        ) : null}
                        <div className="mt-2">
                          <StatusPill
                            tone={liveStreamStatusTone(status)}
                            pulse={status === 'live' || status === 'starting'}
                            label={liveStreamStatusLabel(status)}
                          />
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Container>
    </div>
  );
}
