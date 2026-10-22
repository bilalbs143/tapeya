import { TabsContent } from '@/shared/ui/Tabs';

import type { BallLogEntry } from '../lib/ballLog';
import type { ScoringFixture } from '../model/scoringFixture';
import { BallLog } from './BallLog';
import { MatchInfoPanel } from './MatchInfoPanel';
import { PartnershipPanel } from './PartnershipPanel';
import { ScorecardPanel } from './ScorecardPanel';
import { StatsPanel } from './StatsPanel';

type ScoringDeskSecondaryTabsProps = {
  matchId: number;
  fixture: ScoringFixture;
  scorecardFaces: Parameters<typeof ScorecardPanel>[0]['faces'];
  ballLogInnings: Parameters<typeof BallLog>[0]['innings'];
  partnershipInnings: Parameters<typeof PartnershipPanel>[0]['innings'];
  statsInnings: Parameters<typeof StatsPanel>[0]['innings'];
  safeInnIndex: number;
  setPickedBallInn: (index: number | null) => void;
  scorecardLoading: boolean;
  scorecardError: boolean;
  onRetryScorecard: () => void;
  onEditBall: (inningsId: number, entry: BallLogEntry, overNo: number) => void;
  onDeleteBall: (inningsId: number, entry: BallLogEntry, overNo: number) => void;
};

/** Scorecard / balls / partnership / stats / info tab panels. */
export function ScoringDeskSecondaryTabs({
  matchId,
  fixture,
  scorecardFaces,
  ballLogInnings,
  partnershipInnings,
  statsInnings,
  safeInnIndex,
  setPickedBallInn,
  scorecardLoading,
  scorecardError,
  onRetryScorecard,
  onEditBall,
  onDeleteBall,
}: ScoringDeskSecondaryTabsProps) {
  return (
    <>
      <TabsContent
        value="card"
        className="mt-0 min-h-0 flex-1 overflow-y-auto px-4 pb-[max(16px,env(safe-area-inset-bottom))] data-[state=inactive]:hidden"
      >
        <ScorecardPanel
          faces={scorecardFaces}
          loading={scorecardLoading}
          error={scorecardError}
          onRetry={onRetryScorecard}
        />
      </TabsContent>

      <TabsContent
        value="balls"
        className="mt-0 min-h-0 flex-1 overflow-y-auto px-4 pb-[max(16px,env(safe-area-inset-bottom))] data-[state=inactive]:hidden"
      >
        <BallLog
          innings={ballLogInnings}
          innIndex={safeInnIndex}
          onInnIndexChange={setPickedBallInn}
          canOperate={fixture.canOperate}
          loading={scorecardLoading}
          error={scorecardError}
          onRetry={onRetryScorecard}
          onEdit={onEditBall}
          onDelete={onDeleteBall}
        />
      </TabsContent>

      <TabsContent
        value="partnership"
        className="mt-0 min-h-0 flex-1 overflow-y-auto px-4 pb-[max(16px,env(safe-area-inset-bottom))] data-[state=inactive]:hidden"
      >
        <PartnershipPanel
          innings={partnershipInnings}
          loading={scorecardLoading}
          error={scorecardError}
          onRetry={onRetryScorecard}
        />
      </TabsContent>

      <TabsContent
        value="stats"
        className="mt-0 min-h-0 flex-1 overflow-y-auto px-4 pb-[max(16px,env(safe-area-inset-bottom))] data-[state=inactive]:hidden"
      >
        <StatsPanel
          innings={statsInnings}
          match={{ homeShort: fixture.home?.short, awayShort: fixture.away?.short }}
          loading={scorecardLoading}
          error={scorecardError}
          onRetry={onRetryScorecard}
        />
      </TabsContent>

      <TabsContent
        value="info"
        className="mt-0 min-h-0 flex-1 overflow-y-auto px-4 pb-[max(16px,env(safe-area-inset-bottom))] data-[state=inactive]:hidden"
      >
        <MatchInfoPanel matchId={matchId} fixture={fixture} />
      </TabsContent>
    </>
  );
}
