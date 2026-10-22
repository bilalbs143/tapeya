import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTossChoiceOptions } from '@/shared/api/enumsApi';
import { getApiErrorMessage } from '@/shared/api/errors';
import { toast } from '@/shared/ui/toast';

import { useGetScoringFixtureQuery, useUpdateTossMutation } from '../api/matchesApi';
import {
  matchTossSubtitle,
  resolveTossChoseTo,
  resolveTossDecisions,
  tossSummaryLine,
  type TossWinnerSide,
} from '../lib/matchToss';
import { matchRoutes } from '../routes';

/** Winner/decision drafts and PATCH toss → score pad. */
export function useMatchToss(matchId: number, valid: boolean) {
  const navigate = useNavigate();
  const fixtureQuery = useGetScoringFixtureQuery(matchId, { skip: !valid });
  const { data, isLoading, isError, refetch } = fixtureQuery;
  const { options: tossOptions } = useTossChoiceOptions();
  const [updateToss, { isLoading: saving }] = useUpdateTossMutation();
  const [winner, setWinner] = useState<TossWinnerSide>('home');
  const [decision, setDecision] = useState('');

  const decisions = resolveTossDecisions(tossOptions);
  const choseTo = resolveTossChoseTo(decision);
  const ready = choseTo != null;
  const home = data?.home ?? null;
  const away = data?.away ?? null;
  const winnerSide = winner === 'home' ? home : away;
  const decisionLabel = decisions.find((option) => option.value === decision)?.label ?? decision;
  const subtitle = home && away ? matchTossSubtitle(home.short, away.short, data?.overs, data?.venue) : '';
  const summary = ready && winnerSide ? tossSummaryLine(winnerSide.short, decisionLabel) : null;

  async function save() {
    if (!home || !away || !choseTo) return;
    const winningTeamId = winner === 'home' ? home.id : away.id;
    try {
      const result = await updateToss({ matchId, winningTeamId, choseTo }).unwrap();
      if (result.message) toast({ title: result.message, tone: 'success' });
      navigate(matchRoutes.score(matchId), { replace: true });
    } catch (error) {
      toast({ title: getApiErrorMessage(error, 'Could not save the toss.'), tone: 'error' });
    }
  }

  function dismiss() {
    navigate(matchRoutes.list());
  }

  return {
    isLoading,
    isError,
    refetch,
    data,
    home,
    away,
    winner,
    setWinner,
    decision,
    setDecision,
    decisions,
    ready,
    subtitle,
    summary,
    saving,
    save,
    dismiss,
  };
}
