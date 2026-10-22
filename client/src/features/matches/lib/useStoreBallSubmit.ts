import { type MutableRefObject, useCallback } from 'react';

import { getApiErrorMessage, isNetworkError } from '@/shared/api/errors';
import { toast } from '@/shared/ui/toast';

import type { ScoringFixture } from '../model/scoringFixture';
import type { ScoringSession } from '../model/scoringSession';
import type { StoreBallResult } from '../model/storeBallSchemas';
import { endSave, tryBeginSave } from './scoringSaveGate';
import { type StoreBallPayload, type UiBall, uiBallToStoreBallPayload } from './storeBallPayload';
import { buildWicketSummaryModel, isCountableWicketBall, type WicketSummaryModel } from './wicketSummary';

type StoreBallFn = (arg: { matchId: number; inningsId: number; payload: StoreBallPayload }) => {
  unwrap: () => Promise<StoreBallResult>;
};

type EnqueueBallFn = (arg: { inningsId: number; payload: StoreBallPayload }) => unknown;

export type UseStoreBallSubmitArgs = {
  matchId: number;
  session: ScoringSession | null | undefined;
  fixture: ScoringFixture | null | undefined;
  queueConflict: boolean;
  savingRef: MutableRefObject<boolean>;
  storeBall: StoreBallFn;
  enqueueBall: EnqueueBallFn;
  onWicketSummary: (model: WicketSummaryModel) => void;
};

/**
 * Ball submit path — online store, offline queue, wicket-summary side effect.
 * Behavior mirrored from ScoringDesk; keep call sites using the returned `submit` only.
 */
export function useStoreBallSubmit({
  matchId,
  session,
  fixture,
  queueConflict,
  savingRef,
  storeBall,
  enqueueBall,
  onWicketSummary,
}: UseStoreBallSubmitArgs): (ball: UiBall) => Promise<void> {
  return useCallback(
    async (ball: UiBall) => {
      if (!session?.inningsId || !session.striker || !session.nonStriker || !session.bowler) return;
      if (queueConflict) {
        toast({
          title: 'Match Moved on Without You',
          description: 'Discard the queued balls or review them before scoring again.',
          tone: 'error',
        });
        return;
      }
      if (!tryBeginSave(savingRef)) return;
      try {
        const payload = uiBallToStoreBallPayload({
          ball: {
            ...ball,
            strikerId: ball.strikerId ?? session.striker.id,
            bowlerId: ball.bowlerId ?? session.bowler.id,
          },
          nonStrikerId: session.nonStriker.id,
          fielderId: ball.fielderId,
        });

        const offline = typeof navigator !== 'undefined' && !navigator.onLine;
        if (offline) {
          enqueueBall({ inningsId: session.inningsId, payload });
          toast({
            title: 'Ball Queued Offline',
            description: 'It will sync when the signal returns.',
            tone: 'info',
          });
          return;
        }

        try {
          const result = await storeBall({ matchId, inningsId: session.inningsId, payload }).unwrap();
          if (isCountableWicketBall(result.ball) && fixture) {
            const names: Record<string, string> = {};
            for (const p of [...result.matchState.homeXi, ...result.matchState.awayXi]) {
              names[String(p.id)] = p.name;
            }
            const battingSide =
              result.matchState.battingTeamId != null && fixture.away?.id === result.matchState.battingTeamId
                ? fixture.away
                : fixture.home;
            onWicketSummary(
              buildWicketSummaryModel({
                apiBall: result.ball,
                matchState: result.matchState,
                nameById: names,
                battingShort: battingSide?.short ?? 'BAT',
                oversPerSide: fixture.overs,
                playersPerSide: fixture.playersPerSide ?? 11,
              })
            );
          }
        } catch (error) {
          if (isNetworkError(error)) {
            enqueueBall({ inningsId: session.inningsId, payload });
            toast({
              title: 'Ball Queued',
              description: 'Connection dropped — will sync when back online.',
              tone: 'info',
            });
            return;
          }
          toast({ title: getApiErrorMessage(error, 'Ball not saved.'), tone: 'error' });
        }
      } finally {
        endSave(savingRef);
      }
    },
    [enqueueBall, fixture, matchId, onWicketSummary, queueConflict, savingRef, session, storeBall]
  );
}
