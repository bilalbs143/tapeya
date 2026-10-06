import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { FIXTURE_BG_IMAGE } from '@/lib/constants/assets';
import { useGetDramaSerialsQuery } from '@/store/api/dramaApi';
import { Container } from '@/ui/Container';
import { ListEmpty, ListError } from '@/ui/ListState';
import { LoaderBlock } from '@/ui/Loader';

export default function DramaSerials() {
  const navigate = useNavigate();
  const { data: serials = [], isLoading, isError, refetch } = useGetDramaSerialsQuery({ per_page: 50 });

  return (
    <div>
      <AppSubpageHeader title="DRAMA SERIALS" />
      <Container>
        <div className="flex flex-col gap-6 pb-6">
          {isLoading ? <LoaderBlock label="Loading serials" className="py-16" /> : null}
          {isError && !isLoading ? <ListError message="Could not load drama serials." onRetry={() => refetch()} /> : null}
          {!isLoading && !isError && serials.length === 0 ? (
            <ListEmpty title="No Serials Yet." description="Drama serials will appear here when published." />
          ) : null}
          {!isLoading && !isError && serials.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {serials.map((serial) => (
                <button
                  key={serial.id}
                  type="button"
                  onClick={() => navigate(`/serials/${serial.id}`)}
                  className="bg-surface focus-visible:ring-brand flex flex-col overflow-hidden rounded-[17px] text-left focus:outline-none focus-visible:ring-2"
                >
                  <div className="bg-surface-deep aspect-video w-full overflow-hidden">
                    <img
                      src={serial.poster || FIXTURE_BG_IMAGE}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        if (e.currentTarget.src !== FIXTURE_BG_IMAGE) e.currentTarget.src = FIXTURE_BG_IMAGE;
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 p-3">
                    <h3 className="line-clamp-2 text-[13px] font-bold text-white">{serial.title}</h3>
                    <p className="text-muted text-[11px]">
                      {serial.episodesCount} {serial.episodesCount === 1 ? 'episode' : 'episodes'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
