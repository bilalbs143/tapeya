import { PageDock, ScreenBar } from '@/shared/layout';
import { cn } from '@/shared/lib/cn';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';

import { RANKING_HUB_EMPTY, RANKING_HUB_TABS } from '../lib/rankingPage';
import { rankingRoutes } from '../routes';
import { RankingSection } from './RankingSection';
import type { useRankingPage } from './useRankingPage';

type RankingPageFlow = ReturnType<typeof useRankingPage>;

type RankingPageBodyProps = {
  flow: RankingPageFlow;
};

/** Tabbed top-player hub for open tournaments. */
export function RankingPageBody({ flow }: RankingPageBodyProps) {
  const { tab, setTab, batting, bowling, sixes, fours, topBatters, topBowlers, mostSixes, mostFours, goBack } = flow;

  return (
    <PageDock header={<ScreenBar title="Top Players" subtitle="Open Tournament Leaders" onBack={goBack} />}>
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col px-4 pt-4 pb-8">
        <TabsList
          variant="underline"
          className="mb-4 h-auto w-full justify-start gap-1.5 rounded-none border-0 bg-transparent p-0"
        >
          {RANKING_HUB_TABS.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                'min-h-[38px] rounded-none border-b-0 px-2.5 text-2xs leading-normal font-semibold shadow-none',
                'data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-ink',
                'data-[state=active]:shadow-[inset_0_-2px_0_var(--color-brand)]',
                'data-[state=inactive]:text-muted'
              )}
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="batters" className="mt-0">
          <RankingSection
            title="Top Run Scorers"
            viewMoreTo={rankingRoutes.stats('run-scorers')}
            rows={topBatters}
            loading={batting.isLoading}
            error={batting.isError}
            onRetry={() => void batting.refetch()}
            emptyMessage={RANKING_HUB_EMPTY.batting}
          />
        </TabsContent>

        <TabsContent value="bowlers" className="mt-0">
          <RankingSection
            title="Top Wicket Takers"
            viewMoreTo={rankingRoutes.stats('wicket-takers')}
            rows={topBowlers}
            loading={bowling.isLoading}
            error={bowling.isError}
            onRetry={() => void bowling.refetch()}
            emptyMessage={RANKING_HUB_EMPTY.bowling}
          />
        </TabsContent>

        <TabsContent value="others" className="mt-0 flex flex-col gap-8">
          <RankingSection
            title="Most Sixes"
            viewMoreTo={rankingRoutes.stats('sixes')}
            rows={mostSixes}
            loading={sixes.isLoading}
            error={sixes.isError}
            onRetry={() => void sixes.refetch()}
            emptyMessage={RANKING_HUB_EMPTY.sixes}
          />
          <RankingSection
            title="Most Fours"
            viewMoreTo={rankingRoutes.stats('fours')}
            rows={mostFours}
            loading={fours.isLoading}
            error={fours.isError}
            onRetry={() => void fours.refetch()}
            emptyMessage={RANKING_HUB_EMPTY.fours}
          />
        </TabsContent>
      </Tabs>
    </PageDock>
  );
}
