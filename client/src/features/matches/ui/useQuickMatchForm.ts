import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCricketFormatOptions } from '@/shared/api/enumsApi';
import { getApiErrorMessage } from '@/shared/api/errors';
import { toast } from '@/shared/ui/toast';

import { useCreateQuickMatchMutation } from '../api/matchesApi';
import {
  QUICK_MATCH_DEFAULT_BALL,
  QUICK_MATCH_DEFAULT_OVERS,
  QUICK_MATCH_DEFAULT_PLAYERS,
  type QuickMatchAddMode,
  quickMatchSetupStatus,
  type QuickMatchSide,
} from '../lib/quickMatchForm';
import {
  type BallTypeId,
  buildQuickMatchPayload,
  quickMatchGate,
  type QuickMatchPlayer,
} from '../lib/quickMatchPayload';
import { matchRoutes } from '../routes';

/** Free overs/players steppers; toss only when both sides are a full XI. */
export function useQuickMatchForm() {
  const navigate = useNavigate();
  const [createMatch, { isLoading }] = useCreateQuickMatchMutation();
  const {
    options: ballTypes,
    isLoading: enumsLoading,
    isError: enumsError,
    refetch: refetchEnums,
  } = useCricketFormatOptions();
  const [homeName, setHomeName] = useState('');
  const [awayName, setAwayName] = useState('');
  const [homePlayers, setHomePlayers] = useState<QuickMatchPlayer[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<QuickMatchPlayer[]>([]);
  const [adding, setAdding] = useState<{ side: QuickMatchSide; mode: QuickMatchAddMode } | null>(null);
  const [overs, setOvers] = useState(QUICK_MATCH_DEFAULT_OVERS);
  const [players, setPlayers] = useState(QUICK_MATCH_DEFAULT_PLAYERS);
  const [ball, setBall] = useState<BallTypeId>(QUICK_MATCH_DEFAULT_BALL);

  const resolvedBall = ballTypes.some((o) => o.value === ball) ? ball : (ballTypes[0]?.value ?? ball);
  const gate = quickMatchGate({
    cricketFormat: resolvedBall,
    overs,
    playersPerSide: players,
    homeName,
    awayName,
    homePlayers,
    awayPlayers,
  });
  const takenIds = [...homePlayers, ...awayPlayers].flatMap((player) => (player.userId != null ? [player.userId] : []));
  const ballLabel = ballTypes.find((item) => item.value === resolvedBall)?.label ?? 'Ball';
  const status = quickMatchSetupStatus(gate, homeName, awayName, homePlayers.length, awayPlayers.length, players);

  function setSideSize(next: number) {
    setPlayers(next);
    if (homePlayers.length > next) setHomePlayers((list) => list.slice(0, next));
    if (awayPlayers.length > next) setAwayPlayers((list) => list.slice(0, next));
  }

  function addPlayer(side: QuickMatchSide, player: QuickMatchPlayer) {
    const list = side === 'home' ? homePlayers : awayPlayers;
    if (list.length >= players) {
      toast({ title: `This side already has ${players} players.`, tone: 'error' });
      return;
    }
    if (side === 'home') setHomePlayers((current) => [...current, player]);
    else setAwayPlayers((current) => [...current, player]);
  }

  function reset() {
    setHomeName('');
    setAwayName('');
    setHomePlayers([]);
    setAwayPlayers([]);
    setOvers(QUICK_MATCH_DEFAULT_OVERS);
    setPlayers(QUICK_MATCH_DEFAULT_PLAYERS);
    setBall(QUICK_MATCH_DEFAULT_BALL);
    setAdding(null);
  }

  async function start(kind: 'save' | 'toss') {
    if (kind === 'toss' && !gate.canToss) return;
    if (kind === 'save' && !gate.canSave) return;
    try {
      const result = await createMatch(
        buildQuickMatchPayload({
          cricketFormat: resolvedBall,
          overs,
          playersPerSide: players,
          homeName,
          awayName,
          homePlayers,
          awayPlayers,
        })
      ).unwrap();
      const id = result.data?.id;
      if (!id) {
        toast({ title: 'Match created, but the id was missing.', tone: 'error' });
        navigate(matchRoutes.list());
        return;
      }
      if (kind === 'toss') navigate(matchRoutes.toss(id), { replace: true });
      else {
        toast({ title: 'Match saved. Finish the sides, then toss.', tone: 'success' });
        navigate(matchRoutes.list(), { replace: true });
      }
    } catch (error) {
      toast({ title: getApiErrorMessage(error, 'Could not start the quick match.'), tone: 'error' });
    }
  }

  return {
    navigate,
    isLoading,
    ballTypes,
    enumsLoading,
    enumsError,
    refetchEnums,
    homeName,
    setHomeName,
    awayName,
    setAwayName,
    homePlayers,
    setHomePlayers,
    awayPlayers,
    setAwayPlayers,
    adding,
    setAdding,
    overs,
    setOvers,
    players,
    setSideSize,
    resolvedBall,
    setBall,
    gate,
    takenIds,
    ballLabel,
    status,
    addPlayer,
    reset,
    start,
  };
}
