import { Link, useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useToast } from '@/hooks/useToast';
import { buildQuickMatchScorecardShareUrl, shareLink } from '@/lib/share';
import { QuickMatchListCard } from '@/pages/quick-match/QuickMatchListCard';
import { useGetQuickMatchesQuery } from '@/store/api/quickMatchApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';

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
        {isLoading ? (
          <div className="flex justify-center py-16" role="status" aria-label="Loading">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />
          </div>
        ) : null}
        {isError ? (
          <div className="py-10 text-center">
            <p className="text-[14px] text-red-400">Could not load matches.</p>
            <button type="button" className="text-brand mt-2 text-[14px]" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && matches.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted text-[14px]">No Quick Matches Yet.</p>
            <p className="text-muted mt-1 text-[13px]">Just playing today? Start a Quick Match.</p>
            <Button type="button" variant="orange" className="mt-4" onClick={() => navigate('/quick-match')}>
              Start Quick Match
            </Button>
          </div>
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
