import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';

import { useGetEnumsQuery } from '@/shared/api/enumsApi';
import { APP_PATHS } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { statsBucketOptions } from '@/shared/model/enums';
import { Button } from '@/shared/ui/Button';
import { Chip, ChipRow } from '@/shared/ui/Chip';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { useGetPlayerStatsQuery, useGetPlayerTeamsQuery } from '../api/statsApi';
import { formatNum } from '../lib/format';
import {
  buildBattingCareer,
  buildBowlingCareer,
  buildFieldingCareer,
  buildSummaryStats,
  type StatCell,
  type StatsBucket,
} from '../model/schemas';

const TEAMS_PREVIEW_COUNT = 3;

type ProfileStatsProps = {
  /** Omit on `/stats` — uses the signed-in user. */
  userId?: number | undefined;
  className?: string | undefined;
};

function CareerStatSection({ title, items, emptyMessage }: { title: string; items: StatCell[]; emptyMessage: string }) {
  return (
    <section className="bg-page rounded-panel px-4 py-5">
      <h2 className="text-muted text-3xs font-bold tracking-eyebrow uppercase">{title}</h2>
      {items.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-x-6 gap-y-5">
          {items.map(({ label, value }) => (
            <div key={label} className="flex min-w-0 flex-col gap-0.5">
              <span className="text-muted text-2xs font-bold tracking-eyebrow uppercase">{label}:</span>
              <span className="font-mono text-body-sm text-ink tabular-nums">{formatNum(value)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted mt-3 text-2xs">{emptyMessage}</p>
      )}
    </section>
  );
}

function SummaryHighlight({ label, value }: StatCell) {
  return (
    <div className="bg-page flex min-w-0 flex-col items-center justify-center rounded-panel px-3 py-5 text-center">
      <p className="text-brand-text font-mono text-display-sm leading-none font-bold tabular-nums">
        {formatNum(value)}
      </p>
      <p className="text-muted mt-2 text-3xs font-bold tracking-eyebrow uppercase">{label}</p>
    </div>
  );
}

/** Career batting / bowling / fielding for `/stats` and public profile Stats tab. */

export function ProfileStats({ userId: userIdProp, className }: ProfileStatsProps) {
  const [teamsExpanded, setTeamsExpanded] = useState(false);
  const [tournamentType, setTournamentType] = useState<StatsBucket>('all');
  const { data: me } = useMeQuery();
  const { data: enums, isLoading: enumsLoading, isError: enumsError, refetch: refetchEnums } = useGetEnumsQuery();
  const bucketOptions = statsBucketOptions(enums);
  const userId = userIdProp ?? me?.id ?? null;
  const isOwnStats = me != null && userId != null && me.id === userId;

  const { data: statsData, isLoading: statsLoading } = useGetPlayerStatsQuery(
    { userId: userId ?? 0, tournamentType },
    { skip: userId == null }
  );
  const { data: teamsData = [], isLoading: teamsLoading } = useGetPlayerTeamsQuery(userId ?? 0, {
    skip: userId == null,
  });

  const batting = statsData?.batting ?? null;
  const bowling = statsData?.bowling ?? null;
  const fielding = statsData?.fielding ?? null;
  const teamNames = teamsData.map((t) => t.name).filter(Boolean);
  const teamsToShow = teamsExpanded ? teamNames : teamNames.slice(0, TEAMS_PREVIEW_COUNT);
  const hasMoreTeams = teamNames.length > TEAMS_PREVIEW_COUNT;
  const showMoreLink = hasMoreTeams && !teamsExpanded;
  const showLessLink = hasMoreTeams && teamsExpanded;

  const summaryStats = buildSummaryStats(batting);
  const careerAverages = buildBattingCareer(batting);
  const bowlingCareer = buildBowlingCareer(bowling);
  const fieldingCareer = buildFieldingCareer(fielding);

  if (userId == null) {
    return (
      <EmptyState
        className={className}
        title="Sign In to See Stats"
        description="Your career batting, bowling, and fielding stats live here."
        action={
          <Button asChild variant="primary">
            <Link to={APP_PATHS.login}>Log In</Link>
          </Button>
        }
      />
    );
  }

  const highlightsEmptyDescription = isOwnStats
    ? 'Play matches to build your record.'
    : 'This player has no batting highlights yet.';
  const battingEmpty = isOwnStats ? 'No batting stats recorded yet.' : 'No batting stats recorded for this player.';
  const bowlingEmpty = isOwnStats ? 'No bowling stats recorded yet.' : 'No bowling stats recorded for this player.';
  const fieldingEmpty = isOwnStats ? 'No fielding stats recorded yet.' : 'No fielding stats recorded for this player.';
  const teamsEmpty = isOwnStats ? 'No Teams Yet' : 'No Teams Listed';

  return (
    <div className={cn('flex flex-col gap-5 pb-8', className)}>
      {enumsError ? (
        <ErrorState
          title="Couldn’t Load Filters"
          description="Stats buckets come from the server."
          onRetry={() => void refetchEnums()}
        />
      ) : enumsLoading && bucketOptions.length <= 1 ? (
        <Skeleton className="h-8 w-full rounded-panel" aria-label="Loading Filters" />
      ) : (
        <ChipRow className="mx-0 px-0" role="radiogroup" aria-label="Tournament Type">
          {bucketOptions.map((opt) => (
            <Chip
              key={opt.value}
              size="sm"
              role="radio"
              aria-checked={tournamentType === opt.value}
              selected={tournamentType === opt.value}
              disabled={enumsLoading}
              onClick={() => setTournamentType(opt.value)}
            >
              {opt.label}
            </Chip>
          ))}
        </ChipRow>
      )}

      {statsLoading ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading Stats">
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-20 rounded-panel" />
            <Skeleton className="h-20 rounded-panel" />
            <Skeleton className="h-20 rounded-panel" />
          </div>
          <Skeleton className="h-28 rounded-panel" />
          <Skeleton className="h-40 rounded-panel" />
        </div>
      ) : (
        <>
          {summaryStats.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {summaryStats.map((cell) => (
                <SummaryHighlight key={cell.label} {...cell} />
              ))}
            </div>
          ) : (
            <EmptyState title="No Batting Highlights Yet" description={highlightsEmptyDescription} />
          )}

          <section className="bg-page rounded-panel px-4 py-4">
            <h2 className="text-muted text-3xs font-bold tracking-eyebrow uppercase">Teams</h2>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-1 gap-y-1">
              {teamsLoading ? (
                <Skeleton className="h-4 w-40" />
              ) : teamNames.length > 0 ? (
                <>
                  <span className="text-ink text-body-sm font-normal">
                    {teamsToShow.join(', ')}
                    {showMoreLink ? '…' : ''}
                  </span>
                  {showMoreLink ? (
                    <button
                      type="button"
                      className="text-brand-text text-body-sm font-normal underline underline-offset-2"
                      onClick={() => setTeamsExpanded(true)}
                    >
                      More
                    </button>
                  ) : null}
                  {showLessLink ? (
                    <button
                      type="button"
                      className="text-brand-text ml-1 text-body-sm font-normal underline underline-offset-2"
                      onClick={() => setTeamsExpanded(false)}
                    >
                      Less
                    </button>
                  ) : null}
                </>
              ) : (
                <span className="text-muted text-body-sm">{teamsEmpty}</span>
              )}
            </div>
          </section>

          <CareerStatSection title="Batting" items={careerAverages} emptyMessage={battingEmpty} />
          <CareerStatSection title="Bowling" items={bowlingCareer} emptyMessage={bowlingEmpty} />
          <CareerStatSection title="Fielding" items={fieldingCareer} emptyMessage={fieldingEmpty} />
        </>
      )}
    </div>
  );
}
