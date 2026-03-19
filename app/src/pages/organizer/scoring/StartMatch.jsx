import { useEffect, useMemo, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import teamMatchIcon from '@/assets/images/icons/team-match-icon.svg';
import OversDialog from '@/components/dialogs/scoring/OversDialog';
import PlayersPerSideDialog from '@/components/dialogs/scoring/PlayersPerSideDialog';
import TeamSelectDialog from '@/components/dialogs/scoring/TeamSelectDialog';
import TossDialog from '@/components/dialogs/scoring/TossDialog';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { startMatchSchema } from '@/lib/validations/startMatch';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { useUpdateTossMutation } from '@/store/api/matchApi';
import {
  useCreateTournamentMatchMutation,
  useGetTournamentsQuery,
  useGetTournamentTeamsQuery,
} from '@/store/api/tournamentApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { DatePicker } from '@/ui/DatePicker';
import { FormField, formFieldLabelCheckoutClass } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { TimePicker } from '@/ui/TimePicker';

import {
  getMatchOversOptions,
  getPlayersPerSideOptions,
} from './scoringMappers';
import { formatDateForApi, formatTimeForApi } from './scoringUtils';

const oversInputBase =
  'flex h-12 w-full items-center rounded-[6px] bg-[#141412] px-4 py-3 text-left text-white focus:outline-none focus:ring-2 focus:ring-[#DA9811]/50 cursor-pointer';

function buildMatchPayload(data, groupIndex = null) {
  const payload = {
    tournamentId: data.tournament_id,
    home_team_id: Number(data.team_a_id),
    away_team_id: Number(data.team_b_id),
    match_date: formatDateForApi(data.match_date),
    match_time: formatTimeForApi(data.match_time),
    venue_name: data.venue.trim(),
    players_per_side: Number(data.players_per_side),
    overs: data.overs,
  };
  if (groupIndex != null && groupIndex > 0) {
    payload.group_index = groupIndex;
  }
  return payload;
}

export default function StartMatch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tournamentIdFromUrl = searchParams.get('tournamentId') || location.state?.tournamentId;
  const tournamentPreSelected = !!tournamentIdFromUrl;

  const { data: enums = {} } = useGetEnumsQuery();
  const { data: tournamentsData } = useGetTournamentsQuery({ all: true });
  const tournaments = tournamentsData?.data ?? [];

  const toast = useToast();
  const [createMatch, { isLoading: isCreatingMatch }] =
    useCreateTournamentMatchMutation();
  const [updateToss, { isLoading: isUpdatingToss }] = useUpdateTossMutation();

  const oversOptions = useMemo(
    () => getMatchOversOptions(enums.match_overs),
    [enums.match_overs],
  );
  const playersPerSideOptions = useMemo(
    () => getPlayersPerSideOptions(enums.players_per_side),
    [enums.players_per_side],
  );

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(startMatchSchema),
    defaultValues: {
      tournament_id: tournamentIdFromUrl ? String(tournamentIdFromUrl) : '',
      team_a_id: '',
      team_b_id: '',
      venue: '',
      match_date: '',
      match_time: '',
      players_per_side: '',
      overs: '',
    },
    mode: 'onChange',
  });

  const validatedFormDataRef = useRef(null);

  const {
    tournament_id: tournamentId,
    team_a_id,
    team_b_id,
    overs,
    players_per_side: playersPerSide,
  } = watch();
  const { data: tournamentTeams = [] } = useGetTournamentTeamsQuery(
    tournamentId || undefined,
    { skip: !tournamentId },
  );
  const allTeams = Array.isArray(tournamentTeams) ? tournamentTeams : [];
  const selectedTournament = tournaments.find(
    (t) => String(t.id) === tournamentId,
  );
  const numberOfGroups = selectedTournament?.number_of_groups ?? 1;
  const hasGroups = numberOfGroups > 1;

  const [matchGroupKey, setMatchGroupKey] = useState('knockout');
  const matchGroupIndex =
    matchGroupKey !== '' && matchGroupKey !== 'knockout'
      ? Number(matchGroupKey)
      : null;
  const teams =
    hasGroups && matchGroupIndex != null
      ? allTeams.filter((t) => Number(t.group_index) === matchGroupIndex)
      : allTeams;

  useEffect(() => {
    if (
      tournamentIdFromUrl &&
      getValues('tournament_id') !== String(tournamentIdFromUrl)
    )
      setValue('tournament_id', String(tournamentIdFromUrl));
  }, [tournamentIdFromUrl, setValue, getValues]);

  useEffect(() => {
    if (!hasGroups) return;
    const aInList = !team_a_id || teams.some((t) => String(t.id) === team_a_id);
    const bInList = !team_b_id || teams.some((t) => String(t.id) === team_b_id);
    if (!aInList) setValue('team_a_id', '');
    if (!bInList) setValue('team_b_id', '');
  }, [hasGroups, matchGroupKey, teams, team_a_id, team_b_id, setValue]);

  const [teamSelectDialogOpen, setTeamSelectDialogOpen] = useState(false);
  const [teamSelectSide, setTeamSelectSide] = useState(null); // 'A' | 'B'
  const [oversDialogOpen, setOversDialogOpen] = useState(false);
  const [wicketsDialogOpen, setWicketsDialogOpen] = useState(false);
  const [tossDialogOpen, setTossDialogOpen] = useState(false);
  const [tossWinner, setTossWinner] = useState('');
  const [tossDecision, setTossDecision] = useState('');

  const handleBack = () => navigate(-1);
  const onSaveFixture = async (data) => {
    try {
      await createMatch(buildMatchPayload(data, matchGroupIndex)).unwrap();
      toast.success(
        'Fixture saved. You can start scoring from the match later.',
      );
      navigate('/organizer/tournaments');
    } catch (err) {
      toast.error(
        getApiErrorMessage(err) ?? 'Could not save fixture. Please try again.',
      );
    }
  };

  const onOpenToss = (data) => {
    validatedFormDataRef.current = data;
    setTossDialogOpen(true);
  };

  const handleStartScoring = async () => {
    const data = validatedFormDataRef.current;
    if (!data) return;

    if (!tossWinner || !tossDecision) return;

    setTossDialogOpen(false);
    setTossWinner('');
    setTossDecision('');

    try {
      const created = await createMatch(
        buildMatchPayload(data, matchGroupIndex),
      ).unwrap();
      const matchId = created?.id;
      if (matchId) {
        const winningTeamId =
          tossWinner === 'A' ? Number(data.team_a_id) : Number(data.team_b_id);
        await updateToss({
          matchId,
          winning_team_id: winningTeamId,
          chose_to_bat_or_bowl: tossDecision,
        }).unwrap();
        navigate(`/organizer/scoring/match/${matchId}`);
        return;
      }
    } catch (err) {
      toast.error(
        getApiErrorMessage(err) ?? 'Could not create match. Please try again.',
      );
      return;
    }
  };

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-6 lg:mt-0">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-[27px] w-[27px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
            aria-label="Back"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 truncate pr-[27px] text-center text-[16px] font-bold tracking-wide text-white uppercase">
            Start A Match
          </h1>
        </header>

        <div className="space-y-6 pb-8">
          {/* Tournament selection (hidden when opened from tournament hub with pre-selected tournament) */}
          {!tournamentPreSelected && (
            <FormField
              htmlFor="tournament_id"
              label="Tournament"
              className="space-y-2"
              labelClassName={`!mb-2 ${formFieldLabelCheckoutClass}`}
            >
              <select
                id="tournament_id"
                value={tournamentId}
                onChange={(e) => {
                  const v = e.target.value;
                  setValue('tournament_id', v || '');
                  setValue('team_a_id', '');
                  setValue('team_b_id', '');
                }}
                className={`${oversInputBase} w-full ${errors.tournament_id ? 'border-red-500' : ''}`}
                aria-label="Select tournament"
                aria-invalid={!!errors.tournament_id}
              >
                <option value="">Select tournament</option>
                {tournaments.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.tournament_name ?? t.name ?? `Tournament ${t.id}`}
                  </option>
                ))}
              </select>
              {errors.tournament_id?.message && (
                <p className="text-sm text-red-200" role="alert">
                  {errors.tournament_id.message}
                </p>
              )}
            </FormField>
          )}

          {hasGroups && (
            <FormField
              htmlFor="match_group"
              label="Match type"
              className="space-y-2"
              labelClassName={`!mb-2 ${formFieldLabelCheckoutClass}`}
            >
              <select
                id="match_group"
                value={matchGroupKey}
                onChange={(e) => {
                  const v = e.target.value;
                  setMatchGroupKey(v ?? '');
                  setValue('team_a_id', '');
                  setValue('team_b_id', '');
                }}
                className={`${oversInputBase} w-full`}
                aria-label="Match type (group or knockout)"
              >
                <option value="knockout">Knockout / Playoff</option>
                {Array.from({ length: numberOfGroups }, (_, i) => i + 1).map(
                  (idx) => (
                    <option key={idx} value={String(idx)}>
                      Group {idx}
                    </option>
                  ),
                )}
              </select>
            </FormField>
          )}

          {/* Team selection: card view, tap opens TeamSelectDialog when tournament has teams */}
          <div className="flex items-stretch">
            <button
              type="button"
              disabled={!tournamentId || teams.length === 0}
              onClick={() => {
                setTeamSelectSide('A');
                setTeamSelectDialogOpen(true);
              }}
              className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-[17px] border border-[#FFFFFF0F] bg-[#141412] p-4 transition-opacity active:opacity-90 disabled:cursor-default disabled:opacity-60 ${errors.team_a_id ? 'border-red-500' : ''}`}
              aria-label="Select Team A"
            >
              <img
                src={teamMatchIcon}
                alt=""
                className="h-10 w-10 shrink-0"
                aria-hidden
              />
              <span className="text-[16px] font-bold tracking-wide text-white uppercase">
                {team_a_id && teams.length > 0
                  ? (teams.find((t) => String(t.id) === team_a_id)?.name ??
                    'Team A')
                  : 'Team A'}
              </span>
              <span className="text-[13px] font-normal text-[#A2A6AB]">
                {!tournamentId
                  ? 'Select tournament'
                  : team_a_id
                    ? null
                    : 'Select Team'}
              </span>
            </button>
            <div className="relative z-10 -mx-3 flex shrink-0 items-center">
              <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border-[8px] border-black bg-[#DA9811] text-[12px] font-bold tracking-wide text-[#080807] uppercase">
                VS
              </span>
            </div>
            <button
              type="button"
              disabled={!tournamentId || teams.length === 0}
              onClick={() => {
                setTeamSelectSide('B');
                setTeamSelectDialogOpen(true);
              }}
              className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-[17px] border border-[#FFFFFF0F] bg-[#141412] p-4 transition-opacity active:opacity-90 disabled:cursor-default disabled:opacity-60 ${errors.team_b_id ? 'border-red-500' : ''}`}
              aria-label="Select Team B"
            >
              <img
                src={teamMatchIcon}
                alt=""
                className="h-10 w-10 shrink-0"
                aria-hidden
              />
              <span className="text-[16px] font-bold tracking-wide text-white uppercase">
                {team_b_id && teams.length > 0
                  ? (teams.find((t) => String(t.id) === team_b_id)?.name ??
                    'Team B')
                  : 'Team B'}
              </span>
              <span className="text-[13px] font-normal text-[#A2A6AB]">
                {!tournamentId
                  ? 'Select tournament'
                  : team_b_id
                    ? null
                    : 'Select Team'}
              </span>
            </button>
          </div>
          {errors.team_a_id?.message && (
            <p className="text-sm text-red-200" role="alert">
              {errors.team_a_id.message}
            </p>
          )}
          {errors.team_b_id?.message && (
            <p className="text-sm text-red-200" role="alert">
              {errors.team_b_id.message}
            </p>
          )}

          <FormField
            htmlFor="venue"
            label="Select a Venue"
            className="space-y-2"
            labelClassName={`!mb-2 ${formFieldLabelCheckoutClass}`}
          >
            <Input
              id="venue"
              placeholder="Venue Name"
              error={errors.venue?.message}
              className="!mb-0"
              {...register('venue')}
            />
          </FormField>

          {/* Match date and time */}
          <div className="space-y-2">
            <Label className={`!mb-2 ${formFieldLabelCheckoutClass}`}>
              Match Date and Time
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="match_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    id={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Date"
                  />
                )}
              />
              <Controller
                name="match_time"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    id={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Time"
                  />
                )}
              />
            </div>
            {(errors.match_date?.message || errors.match_time?.message) && (
              <p className="text-sm text-red-200" role="alert">
                {errors.match_date?.message || errors.match_time?.message}
              </p>
            )}
          </div>

          {/* Overs + Wickets */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="space-y-6">
              <FormField
                htmlFor="overs"
                label="Overs"
                className="space-y-2"
                labelClassName={`!mb-2 ${formFieldLabelCheckoutClass}`}
              >
                <button
                  type="button"
                  id="overs"
                  onClick={() => setOversDialogOpen(true)}
                  className={`${oversInputBase} ${!overs ? '!text-[#A2A6AB78]' : ''}`}
                  aria-label="Select overs"
                >
                  {overs || 'Select Overs'}
                </button>
                {errors.overs?.message && (
                  <p className="text-sm text-red-200" role="alert">
                    {errors.overs.message}
                  </p>
                )}
              </FormField>

              <OversDialog
                open={oversDialogOpen}
                onOpenChange={setOversDialogOpen}
                overs={overs}
                options={oversOptions}
                onChange={(v) => setValue('overs', v)}
              />
            </div>

            <div className="space-y-6">
              {/* Wickets / players per side */}
              <FormField
                htmlFor="players-per-side"
                label="Wickets"
                className="space-y-2"
                labelClassName={`!mb-2 ${formFieldLabelCheckoutClass}`}
              >
                <button
                  type="button"
                  id="players-per-side"
                  onClick={() => setWicketsDialogOpen(true)}
                  className={`${oversInputBase} ${
                    !playersPerSide ? '!text-[#A2A6AB78]' : ''
                  }`}
                  aria-label="Select players per side"
                >
                  {playersPerSide || 'Select Players Per Side'}
                </button>
                {errors.players_per_side?.message && (
                  <p className="text-sm text-red-200" role="alert">
                    {errors.players_per_side.message}
                  </p>
                )}
              </FormField>

              <PlayersPerSideDialog
                open={wicketsDialogOpen}
                onOpenChange={setWicketsDialogOpen}
                playersPerSide={playersPerSide}
                options={playersPerSideOptions}
                onSelect={(val) => setValue('players_per_side', val)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 lg:justify-start">
            <Button
              type="button"
              variant="fixture"
              onClick={handleSubmit(onSaveFixture)}
              className="flex-1 cursor-pointer lg:flex-none lg:w-[150px] lg:whitespace-nowrap"
              disabled={isCreatingMatch}
            >
              {isCreatingMatch ? 'Saving…' : 'Save Fixture'}
            </Button>
            <Button
              type="button"
              variant="orange"
              onClick={handleSubmit(onOpenToss)}
              className="flex-1 cursor-pointer lg:flex-none lg:w-[150px] lg:whitespace-nowrap"
              disabled={isCreatingMatch || isUpdatingToss}
            >
              {isCreatingMatch || isUpdatingToss ? 'Starting…' : 'Start Match'}
            </Button>
          </div>
        </div>
      </Container>

      <TeamSelectDialog
        open={teamSelectDialogOpen}
        onOpenChange={(open) => {
          setTeamSelectDialogOpen(open);
          if (!open) setTeamSelectSide(null);
        }}
        title={teamSelectSide === 'A' ? 'Select Team A' : 'Select Team B'}
        teams={
          teamSelectSide === 'B'
            ? teams.filter((t) => String(t.id) !== team_a_id)
            : teams.filter((t) => String(t.id) !== team_b_id)
        }
        selectedTeamId={teamSelectSide === 'A' ? team_a_id : team_b_id}
        onSelect={(id) => {
          if (teamSelectSide === 'A') setValue('team_a_id', id);
          else if (teamSelectSide === 'B') setValue('team_b_id', id);
        }}
      />

      <TossDialog
        open={tossDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setTossWinner('');
            setTossDecision('');
          }
          setTossDialogOpen(open);
        }}
        teamAName={
          teams.find((t) => String(t.id) === team_a_id)?.name ?? 'Team A'
        }
        teamBName={
          teams.find((t) => String(t.id) === team_b_id)?.name ?? 'Team B'
        }
        tossWinner={tossWinner}
        setTossWinner={setTossWinner}
        tossDecision={tossDecision}
        setTossDecision={setTossDecision}
        onStartScoring={handleStartScoring}
        disabled={isCreatingMatch || isUpdatingToss}
        canConfirm={!!tossWinner && !!tossDecision}
      />
    </div>
  );
}
