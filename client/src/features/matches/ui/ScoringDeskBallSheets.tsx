import type { MutableRefObject } from 'react';

import type { BallLogEntry } from '../lib/ballLog';
import type { EditBallFormPatch } from '../lib/editBallPayload';
import type { UiBall } from '../lib/storeBallPayload';
import { undoLastScoredBall } from '../lib/undoLastScoredBall';
import type { WicketSummaryModel } from '../lib/wicketSummary';
import type { CreasePlayer, XiPlayer } from '../model/scoringSession';
import { EditBallSheet } from './EditBallSheet';
import type { WicketChoice } from './WicketSheet';
import { WicketSheet } from './WicketSheet';
import { WicketSummaryScreen } from './WicketSummaryScreen';

type ScoringDeskBallSheetsProps = {
  matchId: number;
  inningsId: number | null;
  freeHit: boolean;
  overNumber: number;
  ballsInOver: number;
  striker: CreasePlayer | null;
  nonStriker: CreasePlayer | null;
  bowlerName: string | null;
  fielders: XiPlayer[];

  wicketOpen: boolean;
  wicketFromExtra: 'wd' | 'nb' | null;
  onWicketOpenChange: (open: boolean) => void;
  confirmWicket: (choice: WicketChoice, submit: (ball: UiBall) => void | Promise<void>) => void;
  submit: (ball: UiBall) => void | Promise<void>;

  summaryOpen: boolean;
  summaryModel: WicketSummaryModel | null;
  undoing: boolean;
  savingRef: MutableRefObject<boolean>;
  deleteLastBall: (arg: { matchId: number; inningsId: number }) => { unwrap: () => Promise<unknown> };
  onSummaryClosed: () => void;
  onSummaryProceed: () => void;

  editing: { inningsId: number; entry: BallLogEntry; overNo: number } | null;
  setEditing: (next: null) => void;
  onEditSave: (patch: EditBallFormPatch) => void;
  editSaving: boolean;
};

/** Wicket sheet, wicket summary, and ball-log edit sheet. */
export function ScoringDeskBallSheets({
  matchId,
  inningsId,
  freeHit,
  overNumber,
  ballsInOver,
  striker,
  nonStriker,
  bowlerName,
  fielders,
  wicketOpen,
  wicketFromExtra,
  onWicketOpenChange,
  confirmWicket,
  submit,
  summaryOpen,
  summaryModel,
  undoing,
  savingRef,
  deleteLastBall,
  onSummaryClosed,
  onSummaryProceed,
  editing,
  setEditing,
  onEditSave,
  editSaving,
}: ScoringDeskBallSheetsProps) {
  return (
    <>
      <WicketSheet
        open={wicketOpen}
        onOpenChange={onWicketOpenChange}
        freeHit={freeHit}
        fromExtra={wicketFromExtra}
        striker={striker}
        nonStriker={nonStriker}
        fielders={fielders}
        bowlerName={bowlerName}
        overNumber={overNumber}
        ballInOver={ballsInOver + 1}
        onConfirm={(choice) => confirmWicket(choice, submit)}
      />

      <WicketSummaryScreen
        open={summaryOpen}
        model={summaryModel}
        undoing={undoing}
        onUndo={() => {
          void undoLastScoredBall({
            matchId,
            inningsId,
            savingRef,
            deleteLastBall,
            onSuccess: onSummaryClosed,
          });
        }}
        onProceed={onSummaryProceed}
      />

      <EditBallSheet
        entry={editing?.entry ?? null}
        overNo={editing?.overNo ?? null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onSave={(patch) => void onEditSave(patch)}
        saving={editSaving}
      />
    </>
  );
}
