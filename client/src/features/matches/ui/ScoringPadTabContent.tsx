import type { MutableRefObject } from 'react';

import { OverTimeline } from '@/shared/ui/BallChip';

import type { ScoringChaseView } from '../lib/scoringDeskDerived';
import type { ScoringCreaseNeeds, ScoringDeskSide } from '../lib/scoringDeskLayout';
import { undoLastScoredBall } from '../lib/undoLastScoredBall';
import type { ScoringSession } from '../model/scoringSession';
import { CreaseStrip } from './CreaseStrip';
import { FirstBallSetup } from './FirstBallSetup';
import { LiveInningsStrip } from './LiveInningsStrip';
import type { OverflowAction } from './OverflowSheet';
import { type ExtraCode, ScoringPad } from './ScoringPad';
import { ViewOnlyPad } from './ViewOnlyPad';

type ScoringPadTabContentProps = {
  canOperate: boolean;
  settingFirstBall: boolean;
  needDeclareXi: boolean;
  creaseNeeds: ScoringCreaseNeeds;
  battersDone: boolean;
  battersCount: number;
  playersPerSide: number;
  batting: ScoringDeskSide | null;
  fielding: ScoringDeskSide | null;
  session: ScoringSession;
  chase: ScoringChaseView | null;
  lastSix: number | null;
  overNum: number;
  overBalls: string[];
  ready: boolean;
  lockNote: string;
  saving: boolean;
  freeHitBall: number | null;
  legalBallsInOver: number;
  canUndo: boolean;
  connectionStale: boolean;
  matchId: number;
  savingRef: MutableRefObject<boolean>;
  deleteLastBall: (arg: { matchId: number; inningsId: number }) => { unwrap: () => Promise<unknown> };
  onDeclareXi: () => void;
  onOpenCrease: () => void;
  onRuns: (runs: number) => void;
  onExtra: (code: ExtraCode) => void;
  onWicket: () => void;
  onOverflowAction: (action: OverflowAction) => void;
};

/** Pad tab body (view-only / first-ball / live strip) + sticky ScoringPad. */
export function ScoringPadTabContent({
  canOperate,
  settingFirstBall,
  needDeclareXi,
  creaseNeeds,
  battersDone,
  battersCount,
  playersPerSide,
  batting,
  fielding,
  session,
  chase,
  lastSix,
  overNum,
  overBalls,
  ready,
  lockNote,
  saving,
  freeHitBall,
  legalBallsInOver,
  canUndo,
  connectionStale,
  matchId,
  savingRef,
  deleteLastBall,
  onDeclareXi,
  onOpenCrease,
  onRuns,
  onExtra,
  onWicket,
  onOverflowAction,
}: ScoringPadTabContentProps) {
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {!canOperate ? (
          <div className="px-3.5 pt-1 pb-2">
            <ViewOnlyPad
              battingShort={batting?.short ?? 'BAT'}
              runs={session.runs}
              wickets={session.wickets}
              oversDisplay={session.oversDisplay}
            />
          </div>
        ) : settingFirstBall ? (
          <div className="flex flex-col gap-3 px-3.5 pt-1 pb-2">
            <FirstBallSetup
              className="rounded-card border"
              battingName={batting?.name ?? 'Batting Side'}
              fieldingShort={fielding?.short ?? 'fielding'}
              squadSize={battersCount || playersPerSide}
              playersPerSide={playersPerSide}
              needs={creaseNeeds === 'bowler' ? 'bowler' : 'openers'}
              battersDone={battersDone && !needDeclareXi}
              battersLabel={
                battersDone
                  ? ([session.striker?.name, session.nonStriker?.name].filter(Boolean) as string[]).join(' · ')
                  : undefined
              }
              needDeclareXi={needDeclareXi}
              onDeclareXi={onDeclareXi}
              onSelectBatters={() => {
                if (!needDeclareXi) onOpenCrease();
              }}
              onSelectBowler={() => {
                if (!needDeclareXi) onOpenCrease();
              }}
            />
            <CreaseStrip
              striker={session.striker}
              nonStriker={session.nonStriker}
              bowler={session.bowler}
              empty={!battersDone}
              awaitingBowler={creaseNeeds === 'bowler' || !session.bowler}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-3.5 pt-1 pb-2">
            <LiveInningsStrip
              crr={session.currentRunRate ?? '0.00'}
              rrr={session.requiredRunRate}
              chase={Boolean(chase)}
              extras={session.extras}
              partnership={session.partnership}
              lastSix={lastSix}
            />
            <CreaseStrip striker={session.striker} nonStriker={session.nonStriker} bowler={session.bowler} />
            <OverTimeline over={overNum} balls={overBalls} emptyHint={overNum > 1 ? 'New Over' : 'Tap a Run'} />
          </div>
        )}
      </div>

      {canOperate ? (
        <div className="border-border-subtle bg-surface shrink-0 border-t px-4 pt-2.5 pb-[max(12px,env(safe-area-inset-bottom))]">
          <ScoringPad
            locked={!ready || settingFirstBall || connectionStale}
            lockNote={lockNote}
            showCustom={!settingFirstBall}
            saving={saving}
            freeHit={session.freeHit}
            freeHitBall={freeHitBall}
            overNum={overNum}
            ballInOver={legalBallsInOver + 1}
            strikerName={session.striker?.name ?? null}
            canUndo={canUndo}
            onRuns={onRuns}
            onExtra={onExtra}
            onWicket={onWicket}
            onOverflowAction={onOverflowAction}
            onUndo={() => {
              void undoLastScoredBall({
                matchId,
                inningsId: session.inningsId,
                savingRef,
                deleteLastBall,
              });
            }}
          />
        </div>
      ) : null}
    </>
  );
}
