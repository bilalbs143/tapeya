import { useMemo, useState } from 'react';

import { DEFAULT_PENALTY_RUNS, formatPenaltyRevisedScorePreview, teamDisplayScore } from '@/lib/utils/penaltyRunsUtils';

/**
 * Penalty Runs dialog state — team toggle, amount, reason, live revised-score preview.
 *
 * @param {object} params
 * @param {number} params.battingTeamId
 * @param {number} params.bowlingTeamId
 * @param {object|null} params.liveScore
 * @param {object[]} [params.allInnings]
 */
export function usePenaltyRuns({ battingTeamId, bowlingTeamId, liveScore, allInnings = [] }) {
  const [penaltyTeam, setPenaltyTeam] = useState('batting');
  const [direction, setDirection] = useState('award');
  const [amount, setAmount] = useState(DEFAULT_PENALTY_RUNS);
  const [penaltyReason, setPenaltyReason] = useState('');

  const runs = direction === 'award' ? amount : -amount;

  const stepAmount = (delta) => {
    setAmount((prev) => Math.max(1, Math.min(999, prev + delta)));
  };

  const battingScore = useMemo(
    () =>
      teamDisplayScore({
        side: 'batting',
        battingTeamId,
        bowlingTeamId,
        liveScore,
        allInnings,
      }),
    [battingTeamId, bowlingTeamId, liveScore, allInnings],
  );

  const bowlingScore = useMemo(
    () =>
      teamDisplayScore({
        side: 'bowling',
        battingTeamId,
        bowlingTeamId,
        liveScore,
        allInnings,
      }),
    [battingTeamId, bowlingTeamId, liveScore, allInnings],
  );

  const equation = useMemo(() => {
    const base = penaltyTeam === 'batting' ? battingScore : bowlingScore;
    return formatPenaltyRevisedScorePreview(base, runs);
  }, [penaltyTeam, battingScore, bowlingScore, runs]);

  const canSubmit = amount > 0 && Boolean(penaltyReason);

  return {
    penaltyTeam,
    setPenaltyTeam,
    direction,
    setDirection,
    amount,
    stepAmount,
    runs,
    penaltyReason,
    setPenaltyReason,
    battingScore,
    bowlingScore,
    equation,
    canSubmit,
  };
}
