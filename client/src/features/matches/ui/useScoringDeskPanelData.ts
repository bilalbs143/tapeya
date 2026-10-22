import { useMemo } from 'react';

import { scorecardToBallLog } from '../lib/ballLog';
import { toPartnershipInnings } from '../lib/partnerships';
import { toScorecardFaces } from '../lib/scorecardFace';
import { toStatsInnings } from '../lib/statsFromScorecard';
import type { ScoringFixture } from '../model/scoringFixture';
import type { ScoringSession } from '../model/scoringSession';

type ScorecardData = {
  innings: Parameters<typeof scorecardToBallLog>[0];
};

/** Derived scorecard / ball-log / partnership / stats panels. */
export function useScoringDeskPanelData(args: {
  fixture: ScoringFixture | undefined;
  session: ScoringSession | undefined;
  scorecard: ScorecardData | undefined;
}) {
  const { fixture, session, scorecard } = args;

  const nameById = useMemo(() => {
    const map: Record<string, string> = {};
    if (!session) return map;
    for (const p of [...session.homeXi, ...session.awayXi]) {
      map[String(p.id)] = p.name;
    }
    return map;
  }, [session]);

  const ballLogInnings = useMemo(() => {
    if (!scorecard) return [];
    return scorecardToBallLog(scorecard.innings, nameById, {
      matchComplete: session?.matchComplete,
    });
  }, [scorecard, nameById, session?.matchComplete]);

  const scorecardFaces = useMemo(() => {
    if (!scorecard || !fixture) return [];
    return toScorecardFaces(scorecard.innings, {
      homeTeamId: fixture.home?.id ?? null,
      awayTeamId: fixture.away?.id ?? null,
      homeShort: fixture.home?.short ?? null,
      awayShort: fixture.away?.short ?? null,
      activeBowlerId: session?.bowler?.id ?? null,
      runsToWin: session?.runsToWin ?? null,
      ballsRemaining: session?.ballsRemaining ?? null,
    });
  }, [scorecard, fixture, session?.bowler?.id, session?.runsToWin, session?.ballsRemaining]);

  const partnershipInnings = useMemo(() => {
    if (!scorecard || !fixture) return [];
    return toPartnershipInnings(scorecard.innings, {
      nameById,
      homeTeamId: fixture.home?.id ?? null,
      awayTeamId: fixture.away?.id ?? null,
      homeShort: fixture.home?.short ?? null,
      awayShort: fixture.away?.short ?? null,
    });
  }, [scorecard, fixture, nameById]);

  const statsInnings = useMemo(() => {
    if (!scorecard || !fixture) return [];
    return toStatsInnings(scorecard.innings, {
      oversPerSide: fixture.overs,
      homeTeamId: fixture.home?.id ?? null,
      awayTeamId: fixture.away?.id ?? null,
      homeShort: fixture.home?.short ?? null,
      awayShort: fixture.away?.short ?? null,
    });
  }, [scorecard, fixture]);

  return {
    ballLogInnings,
    scorecardFaces,
    partnershipInnings,
    statsInnings,
  };
}
