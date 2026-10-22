import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { type Tournament, useGetTournamentsQuery, useGetTournamentTeamsQuery } from '@/features/tournaments';

import { getApiErrorMessage } from '@/shared/api/errors';
import { uploadMediaFile, useUploadMediaMutation } from '@/shared/api/mediaApi';
import { APP_PATHS } from '@/shared/config/paths';
import { toast } from '@/shared/ui/toast';

import { useCreateTournamentMatchMutation } from '../api/matchesApi';
import {
  filterStartMatchTournaments,
  START_MATCH_DEFAULT_OVERS,
  START_MATCH_DEFAULT_PLAYERS,
  START_MATCH_THUMB_MAX_MB,
  type StartMatchBusy,
  startMatchGroupIndex,
  type StartMatchGroupKey,
  type StartMatchPickSlot,
  startMatchTodayIso,
} from '../lib/startMatchForm';
import { buildStartMatchPayload, startMatchReady } from '../lib/startMatchPayload';
import { matchRoutes } from '../routes';

/** Tournament fixture wizard — pick sides, schedule, start or save. */
export function useStartMatchForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const prefillId = Number(params.get('tournamentId') ?? params.get('t') ?? 0) || null;

  const {
    data: tournamentsPage,
    isLoading: tournamentsLoading,
    isError: tournamentsError,
    refetch: refetchTournaments,
  } = useGetTournamentsQuery({ all: true });
  const tournaments = useMemo(
    () => filterStartMatchTournaments(tournamentsPage?.items ?? []),
    [tournamentsPage?.items]
  );

  const [tournamentId, setTournamentId] = useState<number | null>(prefillId);
  const [homeId, setHomeId] = useState<number | null>(null);
  const [awayId, setAwayId] = useState<number | null>(null);
  const [pickSlot, setPickSlot] = useState<StartMatchPickSlot>(null);
  const [pickTournament, setPickTournament] = useState(false);
  // `null` = no manual edit/selection yet, so the field follows the selected
  // tournament's venue. Typing or picking a tournament sets an explicit value.
  const [venueOverride, setVenueOverride] = useState<string | null>(null);
  const [date, setDate] = useState(startMatchTodayIso);
  const [time, setTime] = useState('17:30');
  const [overs, setOvers] = useState(START_MATCH_DEFAULT_OVERS);
  const [players, setPlayers] = useState(START_MATCH_DEFAULT_PLAYERS);
  const [busy, setBusy] = useState<StartMatchBusy>(null);
  const [matchGroupKey, setMatchGroupKey] = useState<StartMatchGroupKey>('knockout');
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const thumbInput = useRef<HTMLInputElement>(null);

  const selected = tournaments.find((t) => t.id === tournamentId) ?? null;
  const {
    data: allTeams = [],
    isLoading: teamsLoading,
    isError: teamsError,
    refetch: refetchTeams,
  } = useGetTournamentTeamsQuery(tournamentId ?? 0, { skip: !tournamentId });

  const [createMatch] = useCreateTournamentMatchMutation();
  const [uploadMedia] = useUploadMediaMutation();

  const numberOfGroups = selected?.groupCount ?? 1;
  const hasGroups = numberOfGroups > 1;
  const matchGroupIndex = startMatchGroupIndex(matchGroupKey);
  const teams =
    hasGroups && matchGroupIndex != null ? allTeams.filter((t) => t.groupIndex === matchGroupIndex) : allTeams;

  // Ignore picks that fall outside the filtered group list (no effect — derived).
  const resolvedHomeId = homeId != null && teams.some((t) => t.id === homeId) ? homeId : null;
  const resolvedAwayId = awayId != null && teams.some((t) => t.id === awayId) ? awayId : null;

  // Derived, not synced: follows the selected tournament's venue until the
  // user types their own (or picks a different tournament, which resets it).
  const venue = venueOverride ?? selected?.venueName ?? '';

  const thumbPreview = useMemo(() => (thumbFile ? URL.createObjectURL(thumbFile) : null), [thumbFile]);
  useEffect(() => {
    if (!thumbPreview) return undefined;
    return () => URL.revokeObjectURL(thumbPreview);
  }, [thumbPreview]);

  const home = teams.find((t) => t.id === resolvedHomeId) ?? null;
  const away = teams.find((t) => t.id === resolvedAwayId) ?? null;
  const ready = startMatchReady({
    ...(tournamentId != null ? { tournamentId } : {}),
    ...(resolvedHomeId != null ? { homeTeamId: resolvedHomeId } : {}),
    ...(resolvedAwayId != null ? { awayTeamId: resolvedAwayId } : {}),
    venue,
    matchDate: date,
    matchTime: time,
    overs,
    playersPerSide: players,
  });

  function selectTournament(next: Tournament) {
    setTournamentId(next.id);
    setHomeId(null);
    setAwayId(null);
    setVenueOverride(null);
    setMatchGroupKey('knockout');
    setPickTournament(false);
  }

  function pickTeam(teamId: number) {
    if (pickSlot === 'home') setHomeId(teamId);
    if (pickSlot === 'away') setAwayId(teamId);
    setPickSlot(null);
  }

  function pickThumb(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > START_MATCH_THUMB_MAX_MB * 1024 * 1024) {
      toast({ title: `Thumbnail must be ${START_MATCH_THUMB_MAX_MB} MB or smaller.`, tone: 'error' });
      return;
    }
    setThumbFile(file);
  }

  function setMatchGroup(key: StartMatchGroupKey) {
    setMatchGroupKey(key);
    setHomeId(null);
    setAwayId(null);
  }

  async function submit(kind: 'start' | 'save') {
    if (!ready || !tournamentId || !resolvedHomeId || !resolvedAwayId) return;
    setBusy(kind);
    try {
      const result = await createMatch({
        tournamentId,
        body: buildStartMatchPayload({
          tournamentId,
          homeTeamId: resolvedHomeId,
          awayTeamId: resolvedAwayId,
          venue,
          matchDate: date,
          matchTime: time,
          overs,
          playersPerSide: players,
          ...(matchGroupIndex != null ? { groupIndex: matchGroupIndex } : {}),
        }),
      }).unwrap();
      const id = result.data?.id;
      if (!id) {
        toast({ title: 'Match created, but the id was missing.', tone: 'error' });
        navigate(matchRoutes.list());
        return;
      }
      if (thumbFile) {
        try {
          await uploadMediaFile(uploadMedia, {
            type: 'match',
            id,
            field: 'thumbnail',
            file: thumbFile,
          });
        } catch {
          // Non-blocking — fixture/match already created (legacy StartMatch).
        }
      }
      if (kind === 'start') {
        navigate(matchRoutes.toss(id), { replace: true });
        return;
      }
      toast({ title: 'Fixture saved. You can start scoring later.', tone: 'success' });
      navigate(`${APP_PATHS.tournaments}/${tournamentId}`, { replace: true });
    } catch (error) {
      toast({
        title: getApiErrorMessage(error, kind === 'start' ? 'Could not start the match.' : 'Could not save fixture.'),
        tone: 'error',
      });
    } finally {
      setBusy(null);
    }
  }

  return {
    navigate,
    tournaments,
    tournamentsLoading,
    tournamentsError,
    refetchTournaments,
    selected,
    tournamentId,
    teams,
    teamsLoading,
    teamsError,
    refetchTeams,
    numberOfGroups,
    hasGroups,
    matchGroupKey,
    matchGroupIndex,
    setMatchGroup,
    home,
    away,
    resolvedHomeId,
    resolvedAwayId,
    ready,
    venue,
    setVenueOverride,
    date,
    setDate,
    time,
    setTime,
    overs,
    setOvers,
    players,
    setPlayers,
    busy,
    thumbPreview,
    thumbInput,
    pickThumb,
    pickSlot,
    setPickSlot,
    pickTournament,
    setPickTournament,
    selectTournament,
    pickTeam,
    submit,
    openTournamentPicker: () => setPickTournament(true),
  };
}
