import { Link, useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useToast } from '@/hooks/useToast';
import { buildQuickMatchScorecardShareUrl, shareLink } from '@/lib/share';
import { QuickMatchListCard } from '@/pages/quick-match/QuickMatchListCard';
import { useGetQuickMatchesQuery } from '@/store/api/quickMatchApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { ListEmpty, ListError } from '@/ui/ListState';
import { PageLoader } from '@/ui/Loader';

export default function MyMatches() {
  const navigate = useNavigate();
  const toast = useToast();

  const { data, isLoading, isError, refetch } = useGetQuickMatchesQuery({ all: true });

  const matches = data?.data ?? [];

  const handleShare = async (event, match) => {
    event.preventDefault();
    event.stopPropagation();
    const home = match.home_team?.name ?? 'Home';
    const away = match.away_team?.name ?? 'Away';
    const result = await shareLink({
      url: buildQuickMatchScorecardShareUrl(match.id),
      title: `${home} vs ${away}`,
      text: `Watch on Tapeya: ${home} vs ${away}`,
    });
    if (result === 'copy_link') {
      toast.success('Link copied.');
    }
  };

  return (
    <div className="bg-black">
      <AppSubpageHeader
        title="My Matches"
        right={
          matches.length > 0 ? (
            <Link
              to="/quick-match"
              className="bg-brand flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-black"
              aria-label="Start Quick Match"
            >
              +
            </Link>
          ) : undefined
        }
      />
      <Container>
        {isLoading ? <PageLoader label="Loading matches" className="py-16" /> : null}
        {isError ? <ListError message="Could not load matches." onRetry={() => refetch()} /> : null}

        {!isLoading && !isError && matches.length === 0 ? (
          <ListEmpty
            title="No Quick Matches Yet."
            description="Just playing today? Start a Quick Match."
            action={
              <Button type="button" variant="orange" onClick={() => navigate('/quick-match')}>
                Start Quick Match
              </Button>
            }
          />
        ) : null}

        <ul className="space-y-3 pb-10">
          {matches.map((match) => (
            <li key={match.id}>
              <QuickMatchListCard match={match} onShare={handleShare} />
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
