import { useMemo, useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import { toast } from '@/shared/ui/toast';

import {
  useAddQuickMatchPlayerMutation,
  useGetMatchTeamSquadQuery,
  useGetTeamSquadQuery,
  useStoreMatchSquadMutation,
  useStorePlayingElevenMutation,
  useUpdateMatchCaptainMutation,
  useUpdateMatchWicketKeeperMutation,
} from '../api/matchesApi';
import {
  buildInitialRoster,
  type DeclareSquadSideKey,
  type DeclareSquadSideState,
  EMPTY_DECLARE_SQUAD_SIDES,
} from '../lib/declareSquadRoster';
import type { QuickMatchPlayer } from '../lib/quickMatchPayload';
import type { XiPlayer } from '../model/scoringSession';
import {
  blockerFor,
  type DeclareSquadPlayer,
  isValidXi,
  otherNeeds,
  type TeamSquadPlayer,
} from '../model/squadSchemas';

export type UseDeclareSquadScreenArgs = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: number;
  tournamentId: number | null;
  playersPerSide: number;
  home: { id: number; short: string };
  away: { id: number; short: string };
  battingSide: DeclareSquadSideKey;
  homeXi: XiPlayer[];
  awayXi: XiPlayer[];
};

/** Draft seed, side edits, and persist for Declare Squad sheet. */
export function useDeclareSquadScreen({
  open,
  onOpenChange,
  matchId,
  tournamentId,
  playersPerSide,
  home,
  away,
  battingSide,
  homeXi,
  awayXi,
}: UseDeclareSquadScreenArgs) {
  const homeTeamId = home.id;
  const awayTeamId = away.id;
  const isQuick = tournamentId == null;

  const homePool = useGetTeamSquadQuery(homeTeamId, { skip: !open });
  const awayPool = useGetTeamSquadQuery(awayTeamId, { skip: !open });
  const homeMatchSquad = useGetMatchTeamSquadQuery({ matchId, teamId: homeTeamId }, { skip: !open });
  const awayMatchSquad = useGetMatchTeamSquadQuery({ matchId, teamId: awayTeamId }, { skip: !open });

  const [storeSquad] = useStoreMatchSquadMutation();
  const [storeXi] = useStorePlayingElevenMutation();
  const [updateCaptain] = useUpdateMatchCaptainMutation();
  const [updateKeeper] = useUpdateMatchWicketKeeperMutation();
  const [addQuickPlayer] = useAddQuickMatchPlayerMutation();

  /** null = this open session has not been seeded yet (or sheet is closed). */
  const [draft, setDraft] = useState<DeclareSquadSideState | null>(null);
  const [side, setSide] = useState<DeclareSquadSideKey>('home');
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [walkUpOpen, setWalkUpOpen] = useState(false);

  const queriesSettled =
    !homePool.isLoading && !awayPool.isLoading && !homeMatchSquad.isLoading && !awayMatchSquad.isLoading;

  // Drop draft when sheet closes (next open reseeds from server) — render-time sync, not useEffect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setDraft(null);
      setQuery('');
      setWalkUpOpen(false);
      setSaving(false);
      setSide('home');
    }
  }

  // Seed once when queries settle for this open. `draft != null` means the form
  // owns state — later cache updates are ignored until close. Setting state
  // directly during render here is safe: once `draft` is set, the condition
  // below is false, so it never loops.
  if (open && draft == null && queriesSettled) {
    setDraft({
      home: buildInitialRoster({
        pool: homePool.data ?? [],
        matchIds: homeMatchSquad.data?.playerIds ?? [],
        xi: homeXi,
        captainId: homeMatchSquad.data?.captainId ?? null,
        keeperId: homeMatchSquad.data?.wicketKeeperId ?? null,
      }),
      away: buildInitialRoster({
        pool: awayPool.data ?? [],
        matchIds: awayMatchSquad.data?.playerIds ?? [],
        xi: awayXi,
        captainId: awayMatchSquad.data?.captainId ?? null,
        keeperId: awayMatchSquad.data?.wicketKeeperId ?? null,
      }),
    });
    setSide(battingSide);
  }

  const squads = draft ?? EMPTY_DECLARE_SQUAD_SIDES;
  const draftReady = draft != null;

  const poolBySide = useMemo(
    () => ({
      home: homePool.data ?? [],
      away: awayPool.data ?? [],
    }),
    [awayPool.data, homePool.data]
  );

  const assignedIds = useMemo(
    () => new Set([...squads.home, ...squads.away].map((p) => p.id)),
    [squads.away, squads.home]
  );

  const q = query.trim().toLowerCase();
  const candidates = poolBySide[side].filter((p) => !assignedIds.has(p.id) && p.name.toLowerCase().includes(q));
  const exactMatch = Boolean(q && candidates.some((p) => p.name.toLowerCase() === q));

  const roster = squads[side];
  const otherSide: DeclareSquadSideKey = side === 'home' ? 'away' : 'home';
  const blocker = blockerFor(roster, playersPerSide);
  const otherValid = isValidXi(squads[otherSide], playersPerSide);
  const bothValid = !blocker && otherValid;

  const short = (s: DeclareSquadSideKey) => (s === 'home' ? home.short : away.short);
  const teamIdFor = (s: DeclareSquadSideKey) => (s === 'home' ? homeTeamId : awayTeamId);
  const roleLabel = (s: DeclareSquadSideKey) => (s === battingSide ? 'Batting' : 'Fielding');

  function updateSide(key: DeclareSquadSideKey, updater: (players: DeclareSquadPlayer[]) => DeclareSquadPlayer[]) {
    setDraft((prev) => {
      if (prev == null) return prev;
      return { ...prev, [key]: updater(prev[key]) };
    });
  }

  function addFromPool(player: TeamSquadPlayer) {
    updateSide(side, (players) => [
      ...players,
      {
        id: player.id,
        name: player.name,
        role: player.role,
        hand: player.hand,
        captain: false,
        keeper: false,
        playing: true,
      },
    ]);
    setQuery('');
  }

  function setPlaying(id: number, playing: boolean) {
    updateSide(side, (players) =>
      players.map((p) =>
        p.id === id ? { ...p, playing, captain: playing ? p.captain : false, keeper: playing ? p.keeper : false } : p
      )
    );
  }

  function setCaptain(id: number) {
    updateSide(side, (players) => players.map((p) => ({ ...p, captain: p.id === id ? !p.captain : false })));
  }

  function setKeeper(id: number) {
    updateSide(side, (players) => players.map((p) => ({ ...p, keeper: p.id === id ? !p.keeper : false })));
  }

  async function persistSide(key: DeclareSquadSideKey, rows: DeclareSquadPlayer[]) {
    const teamId = teamIdFor(key);
    const allIds = rows.map((p) => p.id);
    const playingIds = rows.filter((p) => p.playing).map((p) => p.id);
    const captainId = rows.find((p) => p.captain)?.id ?? null;
    const keeperId = rows.find((p) => p.keeper)?.id ?? null;

    await storeSquad({ matchId, teamId, playerIds: allIds }).unwrap();
    await storeXi({ matchId, teamId, playerIds: playingIds }).unwrap();
    if (captainId != null) {
      await updateCaptain({ matchId, teamId, captainId }).unwrap();
    }
    if (keeperId != null) {
      await updateKeeper({ matchId, teamId, wicketKeeperId: keeperId }).unwrap();
    }
  }

  async function save() {
    if (blocker || draft == null) return;
    setSaving(true);
    try {
      await persistSide(side, draft[side]);
      if (bothValid) {
        await persistSide(otherSide, draft[otherSide]);
        toast({ title: 'Playing XIs Saved', tone: 'success' });
        onOpenChange(false);
      } else {
        toast({ title: `${short(side)} XI saved.`, tone: 'success' });
        setSide(otherSide);
      }
    } catch (error) {
      toast({ title: getApiErrorMessage(error, 'Could not save playing XI.'), tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function addWalkUp(player: QuickMatchPlayer) {
    try {
      let body: { user_id: number } | { name: string; phone: string };
      if (player.userId != null) {
        body = { user_id: player.userId };
      } else if (player.phone) {
        body = { name: player.name, phone: player.phone };
      } else {
        return;
      }
      const created = await addQuickPlayer({
        matchId,
        teamId: teamIdFor(side),
        body,
      }).unwrap();
      addFromPool({
        id: created.id,
        name: created.name,
        role: null,
        hand: null,
      });
      setWalkUpOpen(false);
      setQuery('');
    } catch (error) {
      toast({
        title: getApiErrorMessage(error, 'Could not add player.'),
        tone: 'error',
      });
    }
  }

  return {
    isQuick,
    side,
    setSide,
    query,
    setQuery,
    saving,
    walkUpOpen,
    setWalkUpOpen,
    draftReady,
    squads,
    roster,
    candidates,
    exactMatch,
    assignedIds,
    blocker,
    bothValid,
    otherSide,
    otherNeedsLabel: otherNeeds(squads[otherSide], playersPerSide),
    short,
    roleLabel,
    addFromPool,
    setPlaying,
    setCaptain,
    setKeeper,
    save,
    addWalkUp,
  };
}
