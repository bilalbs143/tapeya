import { cn } from '@/shared/lib/cn';
import { EmptyState, Skeleton } from '@/shared/ui/states';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';

import { creaseBatters } from '../lib/fanMatchView';
import type { ScoringFixture } from '../model/scoringFixture';
import { CommentaryFeed } from './CommentaryFeed';
import { FanLiveDock } from './FanLiveDock';
import { FanLivePanel } from './FanLivePanel';
import { FanPublicScoreCard } from './FanPublicScoreCard';
import { MatchInfoPanel } from './MatchInfoPanel';
import { PartnershipPanel } from './PartnershipPanel';
import { PlayingElevenPanel } from './PlayingElevenPanel';
import { ScorecardPanel } from './ScorecardPanel';
import { StandingsPane } from './StandingsPane';
import { StatsPanel } from './StatsPanel';
import type { useMatchCard } from './useMatchCard';

type MatchCardFlow = ReturnType<typeof useMatchCard>;

type MatchCardBodyProps = {
  flow: MatchCardFlow;
  fixture: ScoringFixture;
};

/** Tabs, score band, and live dock for MatchCardPage (under ScreenBar). */
export function MatchCardBody({ flow, fixture }: MatchCardBodyProps) {
  const {
    matchId,
    scorecardQuery,
    session,
    tab,
    tabDefs,
    selectTab,
    scorecardFaces,
    commentaryItems,
    partnershipInnings,
    statsInnings,
    band,
    xiSides,
    notStarted,
    showLiveDock,
    hasTable,
  } = flow;

  return (
    <>
      {/* Body under match header — tabs stay here, never in the header chrome. */}
      <div className={cn('flex flex-col gap-3 px-4 pt-4', showLiveDock ? 'pb-4' : 'pb-6')}>
        {!notStarted && band ? <FanPublicScoreCard band={band} className="px-0 pb-0" /> : null}

        {notStarted ? (
          <ScheduledHero
            home={fixture.home?.name ?? 'Home'}
            away={fixture.away?.name ?? 'Away'}
            venue={fixture.venue}
            status={fixture.status}
          />
        ) : null}

        <Tabs value={tab} onValueChange={selectTab} className="flex flex-col gap-3">
          <TabsList variant="chip">
            {tabDefs.map((t) => (
              <TabsTrigger key={t.id} value={t.id}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="live" className="mt-0 data-[state=inactive]:hidden">
            <FanLivePanel
              batters={creaseBatters(session)}
              bowler={session?.bowler ?? null}
              commentary={commentaryItems}
            />
          </TabsContent>

          <TabsContent value="scorecard" className="mt-0 data-[state=inactive]:hidden">
            <ScorecardPanel
              faces={scorecardFaces}
              loading={scorecardQuery.isLoading}
              error={scorecardQuery.isError}
              onRetry={() => void scorecardQuery.refetch()}
            />
          </TabsContent>

          <TabsContent value="commentary" className="mt-0 data-[state=inactive]:hidden">
            {scorecardQuery.isLoading ? (
              <div className="flex flex-col gap-2.5" aria-busy="true" aria-label="Loading Commentary">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="border-border-subtle flex gap-2.5 rounded-panel border p-3">
                    <Skeleton className="h-5 w-8 shrink-0 rounded-chip" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <Skeleton className="h-2.5 w-full" />
                      <Skeleton className="h-2 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : scorecardQuery.isError ? (
              <EmptyState title="Couldn't Load Overs" description="Try again in a moment." />
            ) : (
              <CommentaryFeed items={commentaryItems} />
            )}
          </TabsContent>

          <TabsContent value="partnership" className="mt-0 data-[state=inactive]:hidden">
            <PartnershipPanel
              innings={partnershipInnings}
              loading={scorecardQuery.isLoading}
              error={scorecardQuery.isError}
              onRetry={() => void scorecardQuery.refetch()}
            />
          </TabsContent>

          <TabsContent value="stats" className="mt-0 data-[state=inactive]:hidden">
            <StatsPanel
              innings={statsInnings}
              match={{ homeShort: fixture.home?.short, awayShort: fixture.away?.short }}
              loading={scorecardQuery.isLoading}
              error={scorecardQuery.isError}
              onRetry={() => void scorecardQuery.refetch()}
            />
          </TabsContent>

          <TabsContent value="squads" className="mt-0 data-[state=inactive]:hidden">
            <PlayingElevenPanel sides={xiSides} />
          </TabsContent>

          <TabsContent value="info" className="mt-0 data-[state=inactive]:hidden">
            <MatchInfoPanel matchId={matchId} fixture={fixture} />
          </TabsContent>

          <TabsContent value="fixture" className="mt-0 data-[state=inactive]:hidden">
            <FixturePanel
              home={fixture.home?.name ?? 'Home'}
              away={fixture.away?.name ?? 'Away'}
              venue={fixture.venue}
              overs={fixture.overs}
              playersPerSide={fixture.playersPerSide}
            />
          </TabsContent>

          {hasTable && fixture.tournamentId != null ? (
            <TabsContent value="table" className="mt-0 data-[state=inactive]:hidden">
              <StandingsPane
                tournamentId={fixture.tournamentId}
                homeTeamId={fixture.home?.id ?? null}
                awayTeamId={fixture.away?.id ?? null}
              />
            </TabsContent>
          ) : null}
        </Tabs>
      </div>

      {showLiveDock && fixture.stream != null ? (
        <FanLiveDock
          streamId={fixture.stream.id}
          homeShort={fixture.home?.short ?? 'HOME'}
          awayShort={fixture.away?.short ?? 'AWAY'}
          onOpenScorecard={() => selectTab('scorecard')}
        />
      ) : null}
    </>
  );
}

function ScheduledHero({
  home,
  away,
  venue,
  status,
}: {
  home: string;
  away: string;
  venue: string | null;
  status: string;
}) {
  return (
    <div className="border-border-subtle bg-surface rounded-card border px-3.5 py-3.5">
      <p className="font-mono text-dim text-4xs leading-normal font-bold tracking-[.13em] uppercase">
        {[venue].filter(Boolean).join(' · ') || 'TBC'}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <p className="min-w-0 flex-1 truncate text-body-lg leading-normal font-extrabold text-ink">{home}</p>
        <span className="text-dim text-xs font-bold">vs</span>
        <p className="min-w-0 flex-1 truncate text-right text-body-lg leading-normal font-extrabold text-ink">{away}</p>
      </div>
      <p className="text-muted mt-2.5 text-3xs leading-snug">
        {status === 'no_toss'
          ? 'Toss not saved yet. Live scoring appears here when it starts.'
          : 'Toss at the ground. Live scoring appears here when it starts.'}
      </p>
    </div>
  );
}

function FixturePanel({
  home,
  away,
  venue,
  overs,
  playersPerSide,
}: {
  home: string;
  away: string;
  venue: string | null;
  overs: number | null;
  playersPerSide: number | null;
}) {
  const rows: Array<[string, string]> = [
    ['Home', home],
    ['Away', away],
    ['Venue', venue?.trim() || '—'],
    ['Overs', overs != null ? String(overs) : '—'],
    ['Players / side', playersPerSide != null ? String(playersPerSide) : '—'],
  ];
  return (
    <ul className="border-border-subtle bg-surface overflow-hidden rounded-card border">
      {rows.map(([label, value], i) => (
        <li
          key={label}
          className={`flex min-h-11 items-center justify-between gap-3 px-3.5 ${
            i < rows.length - 1 ? 'border-border-subtle border-b' : ''
          }`}
        >
          <span className="font-mono text-dim text-4xs font-bold tracking-eyebrow uppercase">{label}</span>
          <span className="truncate text-right text-xs font-bold text-ink">{value}</span>
        </li>
      ))}
    </ul>
  );
}
