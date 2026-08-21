import { useEffect, useMemo, useRef } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useDialog } from '@/context/DialogContext';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { FORM_FIELD_ERROR_CLASS, FORM_SECTION_DIVIDER_CLASS } from '@/lib/constants/formLayout';
import { getMatchOversOptions, getPlayersPerSideOptions } from '@/lib/utils/scoringMappers';
import { buildQuickMatchPayload, firstQuickMatchFormError, quickMatchSchema } from '@/lib/validations/quickMatch';
import { QuickMatchSettingsFields } from '@/pages/quick-match/QuickMatchSettingsFields';
import { QuickMatchSidePanel, QuickMatchSideSummaryCard } from '@/pages/quick-match/QuickMatchSidePanel';
import { ResumeScheduledQuickMatch } from '@/pages/quick-match/ResumeScheduledQuickMatch';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { useCreateQuickMatchMutation, useGetQuickMatchQuery } from '@/store/api/quickMatchApi';
import { useLazyGetTeamSquadQuery, useSearchTeamsQuery } from '@/store/api/teamApi';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUserAndToken } from '@/store/selectors';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { FormActions } from '@/ui/form/FormActions';
import { FormStack } from '@/ui/form/FormStack';
import { PageLoader } from '@/ui/Loader';

function scrollToSide(sideId) {
  document.getElementById(sideId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const DEFAULTS = {
  cricket_format: 'tape_ball',
  overs: 20,
  players_per_side: 11,
  home: { name: '', team_id: '', players: [] },
  away: { name: '', team_id: '', players: [] },
};

export default function QuickMatchWizard() {
  const { matchId: resumeId } = useParams();
  const navigate = useNavigate();
  const { openDialog } = useDialog();
  const toast = useToast();
  const { user } = useAppSelector(selectAuthUserAndToken);

  const { data: enums = {} } = useGetEnumsQuery();
  const oversOptions = useMemo(() => getMatchOversOptions(enums.match_overs), [enums.match_overs]);
  const playersPerSideOptions = useMemo(() => getPlayersPerSideOptions(enums.players_per_side), [enums.players_per_side]);
  const formatOptions = useMemo(() => {
    const list = enums.cricket_format;
    if (!Array.isArray(list)) return [];
    return list.map((o) => ({ value: o.value, label: o.label ?? o.value }));
  }, [enums.cricket_format]);

  const [createQuickMatch, { isLoading: isCreating }] = useCreateQuickMatchMutation();
  const [fetchSquad] = useLazyGetTeamSquadQuery();
  const { data: ownedTeams = [] } = useSearchTeamsQuery({ mine: true }, { skip: Boolean(resumeId) || !user?.id });
  const validatedRef = useRef(null);

  const {
    data: existingMatch,
    isLoading: resumeLoading,
    isError: resumeError,
  } = useGetQuickMatchQuery(resumeId, { skip: !resumeId });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(quickMatchSchema),
    defaultValues: DEFAULTS,
    mode: 'onChange',
  });

  const overs = watch('overs');
  const playersPerSide = watch('players_per_side');
  const cricketFormat = watch('cricket_format');
  const home = watch('home');
  const away = watch('away');

  useEffect(() => {
    if (!resumeId || !existingMatch) return;
    if (existingMatch.status !== 'scheduled') {
      navigate(`/organizer/scoring/match/${existingMatch.id}`, { replace: true });
    }
  }, [resumeId, existingMatch, navigate]);

  const isBusy = isCreating;

  const homeUserIds = useMemo(
    () => (home?.players ?? []).filter((p) => p.user_id != null).map((p) => Number(p.user_id)),
    [home?.players],
  );
  const awayUserIds = useMemo(
    () => (away?.players ?? []).filter((p) => p.user_id != null).map((p) => Number(p.user_id)),
    [away?.players],
  );

  const pps = Number(playersPerSide) > 0 ? Number(playersPerSide) : 11;

  const applyTeam = async (side, team) => {
    setValue(`${side}.team_id`, Number(team.id), { shouldValidate: true });
    setValue(`${side}.name`, team.name ?? '', { shouldValidate: true });
    try {
      const squad = await fetchSquad(team.id).unwrap();
      const players = (Array.isArray(squad) ? squad : [])
        .filter((p) => p?.id != null)
        .slice(0, pps)
        .map((p) => ({
          user_id: Number(p.id),
          name: p.name ?? p.nickname ?? 'Player',
          nickname: p.nickname,
        }));
      setValue(`${side}.players`, players, { shouldValidate: true });
      if ((Array.isArray(squad) ? squad : []).length > pps) {
        toast.success(`Loaded first ${pps} players from squad (players per side limit).`);
      }
    } catch {
      toast.error('Could not load team squad.');
      setValue(`${side}.players`, [], { shouldValidate: true });
    }
  };

  const applyNewSide = (side, teamName) => {
    setValue(`${side}.team_id`, '', { shouldValidate: true });
    setValue(`${side}.name`, teamName, { shouldValidate: true });
    setValue(`${side}.players`, [], { shouldValidate: true });
  };

  const clearSide = (side) => {
    setValue(`${side}.team_id`, '', { shouldValidate: true });
    setValue(`${side}.name`, '', { shouldValidate: true });
    setValue(`${side}.players`, [], { shouldValidate: true });
  };

  const addPlayerToSide = (side) => (player) => {
    const current = side === 'home' ? homePlayers : awayPlayers;
    if (current.length >= pps) {
      toast.error(`This side already has ${pps} players.`);
      throw new Error(`This side already has ${pps} players.`);
    }
    setValue(`${side}.players`, [...current, player], { shouldValidate: true });
  };

  const openSetSide = (side) => {
    const current = side === 'home' ? home : away;
    const other = side === 'home' ? away : home;
    const label = side === 'home' ? 'Home' : 'Away';
    const hasName = Boolean((current?.name ?? '').trim());
    const excludeId = other?.team_id ? Number(other.team_id) : null;
    const availableOwned = (ownedTeams ?? []).filter((t) => t?.id != null && (excludeId == null || Number(t.id) !== excludeId));
    const initialMode = current?.team_id ? 'saved' : hasName || availableOwned.length === 0 ? 'new' : 'saved';

    openDialog('quickMatchWizardSetSide', {
      sideLabel: label,
      excludeTeamId: other?.team_id || null,
      initialMode,
      initialName: current?.name ?? '',
      onSelectSaved: (team) => {
        applyTeam(side, team);
        window.setTimeout(() => scrollToSide(`qm-${side}`), 80);
      },
      onSelectNew: (teamName) => {
        applyNewSide(side, teamName);
        window.setTimeout(() => scrollToSide(`qm-${side}`), 80);
      },
    });
  };

  const onSideCardPress = (side) => {
    const current = side === 'home' ? home : away;
    if ((current?.name ?? '').trim()) {
      scrollToSide(`qm-${side}`);
      return;
    }
    openSetSide(side);
  };

  const buildTossPayload = (tossWinner, tossDecision) => ({
    winning_side: tossWinner === 'A' ? 'home' : 'away',
    chose_to_bat_or_bowl: tossDecision,
  });

  const assertExactSidesForToss = (data) => {
    const n = Number(data.players_per_side);
    if (data.home.players.length !== n || data.away.players.length !== n) {
      toast.error(`Each side must have exactly ${n} players to start.`);
      return false;
    }
    return true;
  };

  const onInvalid = (formErrors) => {
    const msg = firstQuickMatchFormError(formErrors);
    toast.error(msg);
    const sideInvalid =
      formErrors.home?.name ||
      formErrors.home?.players ||
      formErrors.away?.name ||
      formErrors.away?.players ||
      formErrors.away?.team_id;
    if (sideInvalid) scrollToSide('qm-sides');
  };

  const onSaveForLater = async (data) => {
    try {
      await createQuickMatch(buildQuickMatchPayload(data, null)).unwrap();
      toast.success('Match saved. Resume anytime from My Matches.');
      navigate('/matches');
    } catch (err) {
      toast.error(getApiErrorMessage(err) ?? 'Could not save match.');
      throw err;
    }
  };

  const handleStartScoring = async ({ tossWinner, tossDecision }) => {
    const data = validatedRef.current;
    if (!data) return;
    if (!assertExactSidesForToss(data)) {
      throw new Error('invalid_xi');
    }
    try {
      const created = await createQuickMatch(buildQuickMatchPayload(data, buildTossPayload(tossWinner, tossDecision))).unwrap();
      const id = created?.id;
      if (id) {
        navigate(`/organizer/scoring/match/${id}`);
      } else {
        toast.error('Match created but could not open scoring.');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err) ?? 'Could not start match.');
      throw err;
    }
  };

  const onOpenToss = (data) => {
    if (!assertExactSidesForToss(data)) return;
    validatedRef.current = data;
    openDialog('startMatchToss', {
      teamAName: data.home.name || 'Home',
      teamBName: data.away.name || 'Away',
      teamALogo: null,
      teamBLogo: null,
      onStartScoring: handleStartScoring,
    });
  };

  if (resumeId) {
    if (resumeLoading) {
      return (
        <div className="bg-black">
          <AppSubpageHeader title="Quick Match" onBack={() => navigate(-1)} />
          <Container>
            <PageLoader label="Loading match" className="py-16" />
          </Container>
        </div>
      );
    }
    if (resumeError || !existingMatch) {
      return (
        <div className="bg-black">
          <AppSubpageHeader title="Quick Match" onBack={() => navigate(-1)} />
          <Container>
            <p className="py-8 text-center text-[14px] text-red-400">Match not found.</p>
            <Button variant="orange" className="w-full" onClick={() => navigate('/matches')}>
              My Matches
            </Button>
          </Container>
        </div>
      );
    }
    if (existingMatch.status === 'scheduled') {
      return <ResumeScheduledQuickMatch match={existingMatch} onBack={() => navigate(-1)} navigate={navigate} />;
    }
  }

  const homePlayers = home?.players ?? [];
  const awayPlayers = away?.players ?? [];
  const homeSideError = errors.home?.name?.message || errors.home?.players?.message || errors.home?.players?.root?.message;
  const awaySideError =
    errors.away?.name?.message ||
    errors.away?.players?.message ||
    errors.away?.players?.root?.message ||
    errors.away?.team_id?.message;

  return (
    <div className="bg-black">
      <AppSubpageHeader title="Quick Match" onBack={() => navigate(-1)} titleClassName="truncate" />
      <Container>
        <FormStack className="pb-8">
          <QuickMatchSettingsFields
            cricketFormat={cricketFormat}
            overs={overs}
            playersPerSide={playersPerSide}
            formatOptions={formatOptions}
            onOpenBallType={() =>
              openDialog('startMatchBallType', {
                initialValue: cricketFormat,
                options: formatOptions,
                onSelect: (v) => setValue('cricket_format', v, { shouldValidate: true }),
              })
            }
            onOpenOvers={() =>
              openDialog('startMatchOvers', {
                initialOvers: overs,
                options: oversOptions,
                onChange: (v) => setValue('overs', v, { shouldValidate: true }),
              })
            }
            onOpenPlayersPerSide={() =>
              openDialog('startMatchPlayersPerSide', {
                initialPlayersPerSide: playersPerSide,
                options: playersPerSideOptions,
                onSelect: (val) => setValue('players_per_side', val, { shouldValidate: true }),
              })
            }
            errors={errors}
            required
          />

          <div id="qm-sides" className={`flex scroll-mt-4 flex-col gap-6 ${FORM_SECTION_DIVIDER_CLASS}`}>
            <div className="flex items-stretch">
              <div className="flex flex-1 flex-col gap-2">
                <QuickMatchSideSummaryCard
                  name={home?.name}
                  playerCount={homePlayers.length}
                  playersPerSide={playersPerSide}
                  ariaLabel="Home"
                  onPress={() => onSideCardPress('home')}
                />
                {homeSideError ? (
                  <p className={FORM_FIELD_ERROR_CLASS} role="alert">
                    {homeSideError}
                  </p>
                ) : null}
              </div>
              <div className="relative z-10 -mx-3 flex shrink-0 items-center">
                <span className="bg-brand text-ink flex h-13 w-13 shrink-0 items-center justify-center rounded-full border-[8px] border-black text-[12px] font-bold tracking-wide uppercase">
                  VS
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <QuickMatchSideSummaryCard
                  name={away?.name}
                  playerCount={awayPlayers.length}
                  playersPerSide={playersPerSide}
                  ariaLabel="Away"
                  onPress={() => onSideCardPress('away')}
                />
                {awaySideError ? (
                  <p className={FORM_FIELD_ERROR_CLASS} role="alert">
                    {awaySideError}
                  </p>
                ) : null}
              </div>
            </div>

            {home?.name?.trim() ? (
              <QuickMatchSidePanel
                id="qm-home"
                label="Home"
                name={home?.name ?? ''}
                onChangeSide={() => openSetSide('home')}
                onClearSide={() => clearSide('home')}
                players={homePlayers}
                playersPerSide={playersPerSide}
                canAddPlayers={homePlayers.length < pps}
                onAddPlayer={addPlayerToSide('home')}
                onRemovePlayer={(idx) =>
                  setValue(
                    'home.players',
                    homePlayers.filter((_, i) => i !== idx),
                    { shouldValidate: true },
                  )
                }
                playersError={errors.home?.players?.message || errors.home?.players?.root?.message}
                otherSideUserIds={awayUserIds}
              />
            ) : null}

            {away?.name?.trim() ? (
              <QuickMatchSidePanel
                id="qm-away"
                label="Away"
                name={away?.name ?? ''}
                onChangeSide={() => openSetSide('away')}
                onClearSide={() => clearSide('away')}
                players={awayPlayers}
                playersPerSide={playersPerSide}
                canAddPlayers={awayPlayers.length < pps}
                onAddPlayer={addPlayerToSide('away')}
                onRemovePlayer={(idx) =>
                  setValue(
                    'away.players',
                    awayPlayers.filter((_, i) => i !== idx),
                    { shouldValidate: true },
                  )
                }
                playersError={
                  errors.away?.players?.message || errors.away?.players?.root?.message || errors.away?.team_id?.message
                }
                otherSideUserIds={homeUserIds}
              />
            ) : null}
          </div>

          <FormActions align="start" className="!flex-row !gap-3">
            <Button
              type="button"
              variant="fixture"
              className="min-w-0 flex-1 cursor-pointer"
              disabled={isBusy}
              loading={isBusy}
              onClick={handleSubmit(onSaveForLater, onInvalid)}
            >
              {isBusy ? 'Saving…' : 'Save for Later'}
            </Button>
            <Button
              type="button"
              variant="orange"
              className="min-w-0 flex-1 cursor-pointer"
              disabled={isBusy}
              onClick={handleSubmit(onOpenToss, onInvalid)}
            >
              Toss & Start Match
            </Button>
          </FormActions>
        </FormStack>
      </Container>
    </div>
  );
}
