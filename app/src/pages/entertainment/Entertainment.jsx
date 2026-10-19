import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { EntertainmentSearchPopover } from '@/components/entertainment/EntertainmentSearchPopover';
import { FIXTURE_BG_IMAGE } from '@/lib/constants/assets';
import { useGetEntertainmentsQuery } from '@/store/api/entertainmentApi';
import { Container } from '@/ui/Container';
import { ListEmpty, ListError } from '@/ui/ListState';
import { LoaderBlock } from '@/ui/Loader';

function EntertainmentCard({ item, onClick }) {
  const title = item.title || 'Entertainment';

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      aria-label={title}
      className="bg-surface-deep focus-visible:ring-brand aspect-[2/3] w-full overflow-hidden rounded-[14px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:opacity-90"
    >
      <img
        src={item.poster || FIXTURE_BG_IMAGE}
        alt=""
        className="h-full w-full object-cover"
        onError={(e) => {
          if (e.currentTarget.src !== FIXTURE_BG_IMAGE) e.currentTarget.src = FIXTURE_BG_IMAGE;
        }}
      />
    </button>
  );
}

export default function Entertainment() {
  const navigate = useNavigate();
  const { data: entertainments = [], isLoading, isError, refetch } = useGetEntertainmentsQuery({ per_page: 50 });

  return (
    <div>
      <AppSubpageHeader title="ENTERTAINMENT" />
      <Container>
        <div className="flex flex-col gap-6 pb-6">
          <EntertainmentSearchPopover />

          {isLoading ? <LoaderBlock label="Loading entertainment" className="py-16" /> : null}
          {isError && !isLoading ? <ListError message="Could not load entertainment." onRetry={() => refetch()} /> : null}
          {!isLoading && !isError && entertainments.length === 0 ? (
            <ListEmpty title="No Entertainment Yet." description="Entertainment will appear here when published." />
          ) : null}
          {!isLoading && !isError && entertainments.length > 0 ? (
            <ul className="grid grid-cols-3 gap-2">
              {entertainments.map((item) => (
                <li key={item.id}>
                  <EntertainmentCard item={item} onClick={(next) => navigate(`/entertainment/${next.id}`)} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
