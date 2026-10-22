import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { shareLink } from '@/shared/native/share';
import { toast } from '@/shared/ui/toast';

import { useSetPlayerOfMatchMutation } from '../api/matchesApi';
import { buildMotmCandidates, matchOverShareTitle, type MotmCandidate } from '../lib/matchOver';
import { matchRoutes } from '../routes';

type UseMatchOverArgs = {
  matchId: number;
  resultSummary: string | null;
  homeShort: string;
  awayShort: string;
  homeXi: MotmCandidate[];
  awayXi: MotmCandidate[];
  canOperate: boolean;
  existingMotmName?: string | null | undefined;
};

/** MotM picker state, save, and share for MatchOverScreen. */
export function useMatchOver({
  matchId,
  resultSummary,
  homeShort,
  awayShort,
  homeXi,
  awayXi,
  canOperate,
  existingMotmName,
}: UseMatchOverArgs) {
  const navigate = useNavigate();
  const [picking, setPicking] = useState(() => canOperate && !existingMotmName);
  const [motmName, setMotmName] = useState(existingMotmName ?? null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [setMotm, { isLoading }] = useSetPlayerOfMatchMutation();

  const candidates = useMemo(
    () => buildMotmCandidates(homeXi, awayXi, homeShort, awayShort),
    [awayShort, awayXi, homeShort, homeXi]
  );

  async function saveMotm() {
    if (selectedId == null) return;
    const picked = candidates.find((c) => c.id === selectedId);
    try {
      await setMotm({ matchId, playerOfMatchUserId: selectedId }).unwrap();
      setMotmName(picked?.name ?? 'Saved');
      toast({ title: 'Man of the Match Saved', tone: 'success' });
      setPicking(false);
    } catch (error) {
      toast({ title: getApiErrorMessage(error, 'Could not save Man of the Match.'), tone: 'error' });
    }
  }

  async function share() {
    const path = matchRoutes.card(matchId);
    const url = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;
    const result = await shareLink({
      title: matchOverShareTitle(resultSummary, homeShort, awayShort),
      ...(resultSummary ? { text: resultSummary } : {}),
      url,
    });
    if (result === 'copied') toast({ title: 'Link Copied', tone: 'success' });
  }

  function goList(replace = false) {
    navigate(matchRoutes.list(), replace ? { replace: true } : undefined);
  }

  function goCard() {
    navigate(matchRoutes.card(matchId));
  }

  return {
    picking,
    setPicking,
    motmName,
    selectedId,
    setSelectedId,
    isLoading,
    candidates,
    saveMotm,
    share,
    goList,
    goCard,
  };
}
