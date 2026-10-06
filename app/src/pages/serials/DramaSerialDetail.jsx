import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { FIXTURE_BG_IMAGE } from '@/lib/constants/assets';
import { useGetDramaSerialQuery } from '@/store/api/dramaApi';
import { Container } from '@/ui/Container';
import { ListEmpty, ListError } from '@/ui/ListState';
import { LoaderBlock } from '@/ui/Loader';

export default function DramaSerialDetail() {
  const { serialId } = useParams();
  const navigate = useNavigate();
  const {
    data: serial,
    isLoading,
    isError,
    refetch,
  } = useGetDramaSerialQuery(serialId, {
    skip: !serialId,
  });

  return (
    <div>
      <AppSubpageHeader title={serial?.title?.toUpperCase() || 'SERIAL'} />
      <Container>
        <div className="flex flex-col gap-5 pb-8">
          {isLoading ? <LoaderBlock label="Loading serial" className="py-16" /> : null}
          {isError && !isLoading ? <ListError message="Could not load this serial." onRetry={() => refetch()} /> : null}

          {serial && !isLoading ? (
            <>
              <div className="bg-surface-deep aspect-video w-full overflow-hidden rounded-[17px]">
                <img
                  src={serial.poster || FIXTURE_BG_IMAGE}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    if (e.currentTarget.src !== FIXTURE_BG_IMAGE) e.currentTarget.src = FIXTURE_BG_IMAGE;
                  }}
                />
              </div>
              {serial.description ? <p className="text-muted text-[13px] leading-relaxed">{serial.description}</p> : null}

              <div>
                <h2 className="text-muted mb-3 text-[11px] font-bold tracking-wider uppercase">Episodes</h2>
                {serial.episodes.length === 0 ? (
                  <ListEmpty title="No Episodes Yet." description="Episodes will appear here when published." />
                ) : (
                  <ul className="flex flex-col gap-2">
                    {serial.episodes.map((ep) => (
                      <li key={ep.id}>
                        <button
                          type="button"
                          onClick={() => navigate(`/serials/${serial.id}/e/${ep.id}`)}
                          className="bg-surface border-border-subtle hover:bg-surface-raised flex w-full items-center gap-3 rounded-[14px] border p-2.5 text-left"
                        >
                          <span className="bg-surface-deep relative h-14 w-24 shrink-0 overflow-hidden rounded-[10px]">
                            {ep.thumbnail ? <img src={ep.thumbnail} alt="" className="h-full w-full object-cover" /> : null}
                            <span className="bg-brand/90 absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[10px] font-bold text-white">
                              EP {ep.episodeNumber}
                            </span>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-2 block text-[13px] font-bold text-white">{ep.title}</span>
                            <span className="text-muted mt-0.5 block text-[11px]">
                              {[ep.duration, `${ep.viewsCount} views`].filter(Boolean).join(' · ')}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
