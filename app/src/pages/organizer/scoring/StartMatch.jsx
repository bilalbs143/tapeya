import { useEffect, useMemo, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { TeamLogo } from '@/components/TeamLogo';
import { useDialog } from '@/context/DialogContext';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { toApiDate } from '@/lib/utils/dateUtils';
import { EMPTY_FILE_UPLOAD } from '@/lib/utils/fileUploadUtils';
import { getMatchOversOptions, getPlayersPerSideOptions } from '@/lib/utils/scoringMappers';
import { formatTimeForApi } from '@/lib/utils/scoringUtils';
import { startMatchSchema } from '@/lib/validations/startMatch';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { useUpdateTossMutation } from '@/store/api/matchApi';
import { uploadMediaFile, useUploadMediaMutation } from '@/store/api/mediaApi';
import { useCreateTournamentMatchMutation, useGetTournamentsQuery, useGetTournamentTeamsQuery } from '@/store/api/tournamentApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { DatePicker } from '@/ui/DatePicker';
import { FileUploadField } from '@/ui/FileUploadField';
import { FormField, formFieldLabelCheckoutClass } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { TimePicker } from '@/ui/TimePicker';

const oversInputBase =
  'flex h-12 w-full items-center rounded-[6px] bg-surface px-4 py-3 text-left text-white focus:outline-none focus:ring-2 focus:ring-brand/50 cursor-pointer';

function buildMatchPayload(data, groupIndex = null) {
  const payload = {
    tournamentId: data.tournament_id,
    home_team_id: Number(data.team_a_id),
    away_team_id: Number(data.team_b_id),
    match_date: toApiDate(data.match_date),
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
  const { openDialog } = useDialog();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tournamentIdFromUrl = searchParams.get('tournamentId') || location.state?.tournamentId;
  const tournamentPreSelected = !!tournamentIdFromUrl;

  const { data: enums = {} } = useGetEnumsQuery();
  const { data: tournamentsData } = useGetTournamentsQuery({
    all: true,
    organizer_tournaments: true,
  });
  const tournaments = tournamentsData?.data ?? [];

  const toast = useToast();
  const [createMatch, { isLoading: isCreatingMatch }] = useCreateTournamentMatchMutation();
  const [updateToss, { isLoading: isUpdatingToss }] = useUpdateTossMutation();
  const [uploadMedia] = useUploadMediaMutation();

  const oversOptions = useMemo(() => getMatchOversOptions(enums.match_overs), [enums.match_overs]);
  const playersPerSideOptions = useMemo(() => getPlayersPerSideOptions(enums.players_per_side), [enums.players_per_side]);

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
  const [thumbnailUpload, setThumbnailUpload] = useState(EMPTY_FILE_UPLOAD);

  const { tournament_id: tournamentId, team_a_id, team_b_id, overs, players_per_side: playersPerSide } = watch();
  const { data: tournamentTeams = [] } = useGetTournamentTeamsQuery(tournamentId || undefined, { skip: !tournamentId });
  const allTeams = Array.isArray(tournamentTeams) ? tournamentTeams : [];
  const selectedTournament = tournaments.find((t) => String(t.id) === tournamentId);
  const numberOfGroups = selectedTournament?.number_of_groups ?? 1;
  const hasGroups = numberOfGroups > 1;

  const [matchGroupKey, setMatchGroupKey] = useState('knockout');
  const matchGroupIndex = matchGroupKey !== '' && matchGroupKey !== 'knockout' ? Number(matchGroupKey) : null;
  const teams =
    hasGroups && matchGroupIndex != null ? allTeams.filter((t) => Number(t.group_index) === matchGroupIndex) : allTeams;

  useEffect(() => {
    if (tournamentIdFromUrl && getValues('tournament_id') !== String(tournamentIdFromUrl))
      setValue('tournament_id', String(tournamentIdFromUrl));
  }, [tournamentIdFromUrl, setValue, getValues]);

  useEffect(() => {
    if (!hasGroups) return;
    const aInList = !team_a_id || teams.some((t) => String(t.id) === team_a_id);
    const bInList = !team_b_id || teams.some((t) => String(t.id) === team_b_id);
    if (!aInList) setValue('team_a_id', '');
    if (!bInList) setValue('team_b_id', '');
  }, [hasGroups, matchGroupKey, teams, team_a_id, team_b_id, setValue]);

  const handleBack = () => navigate(-1);

  const onSaveFixture = async (data) => {
    try {
      const created = await createMatch(buildMatchPayload(data, matchGroupIndex)).unwrap();
      const matchId = created?.data?.id ?? created?.id;
      const thumbnailFile = thumbnailUpload.files[0] ?? null;
      if (matchId && thumbnailFile) {
        try {
          await uploadMediaFile(uploadMedia, { type: 'match', id: matchId, field: 'thumbnail', file: thumbnailFile });
        } catch {
          // Thumbnail upload failed — fixture was saved; non-blocking.
        }
      }
      toast.success('Fixture saved. You can start scoring from the match later.');
      navigate('/organizer/tournaments');
    } catch (err) {
      toast.error(getApiErrorMessage(err) ?? 'Could not save fixture. Please try again.');
    }
  };

  const onOpenToss = (data) => {
    validatedFormDataRef.current = data;
    const teamA = teams.find((t) => String(t.id) === data.team_a_id);
    const teamB = teams.find((t) => String(t.id) === data.team_b_id);
    openDialog('startMatchToss', {
      teamAName: teamA?.name ?? 'Team A',
      teamBName: teamB?.name ?? 'Team B',
      teamALogo: teamA?.logo ?? null,
      teamBLogo: teamB?.logo ?? null,
      onStartScoring: handleStartScoring,
    });
  };

  const handleStartScoring = async ({ tossWinner, tossDecision }) => {
    const data = validatedFormDataRef.current;
    if (!data) return;
    try {
      const created = await createMatch(buildMatchPayload(data, matchGroupIndex)).unwrap();
      const matchId = created?.data?.id ?? created?.id;
      const thumbnailFile = thumbnailUpload.files[0] ?? null;
      if (matchId && thumbnailFile) {
        try {
          await uploadMediaFile(uploadMedia, { type: 'match', id: matchId, field: 'thumbnail', file: thumbnailFile });
        } catch {
          // Thumbnail upload failed — match was created; non-blocking.
        }
      }
      if (matchId) {
        const winningTeamId = tossWinner === 'A' ? Number(data.team_a_id) : Number(data.team_b_id);
        await updateToss({
          matchId,
          winning_team_id: winningTeamId,
          chose_to_bat_or_bowl: tossDecision,
        }).unwrap();
        navigate(`/organizer/scoring/match/${matchId}`);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err) ?? 'Could not create match. Please try again.');
    }
  };

  return (
    <div className="bg-black">
      <AppSubpageHeader title="Start A Match" onBack={handleBack} titleClassName="truncate" />
      <Container>
        <div className="space-y-6 pb-8">
          {/* Tournament selection (hidden when opened from tournament hub with pre-selected tournament) */}
          {!tournamentPreSelected && (
            <FormField htmlFor="tournament_id" label="Tournament">
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
                aria-label="Select Tournament"
                aria-invalid={!!errors.tournament_id}
              >
                <option value="">Select Tournament</option>
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
            <FormField htmlFor="match_group" label="Match Type">
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
                aria-label="Match Type (Group or Knockout)"
              >
                <option value="knockout">Knockout / Playoff</option>
                {Array.from({ length: numberOfGroups }, (_, i) => i + 1).map((idx) => (
                  <option key={idx} value={String(idx)}>
                    Group {idx}
                  </option>
                ))}
              </select>
            </FormField>
          )}

          {/* Team selection: card view, tap opens TeamSelectDialog when tournament has teams */}
          <div className="flex items-stretch">
            <button
              type="button"
              disabled={!tournamentId || teams.length === 0}
              onClick={() =>
                openDialog('startMatchTeamSelect', {
                  title: 'Select Team A',
                  teams: teams.filter((t) => String(t.id) !== team_b_id),
                  selectedTeamId: team_a_id,
                  onSelect: (id) => setValue('team_a_id', id),
                })
              }
              className={`bg-surface flex flex-1 flex-col items-center justify-center gap-1 rounded-[17px] border border-[#FFFFFF0F] p-4 transition-opacity active:opacity-90 disabled:cursor-default disabled:opacity-60 ${errors.team_a_id ? 'border-red-500' : ''}`}
              aria-label="Select Team A"
            >
              <TeamLogo team={teams.find((t) => String(t.id) === team_a_id)} variant="match" />
              <span className="text-[16px] font-bold tracking-wide text-white uppercase">
                {team_a_id && teams.length > 0 ? (teams.find((t) => String(t.id) === team_a_id)?.name ?? 'Team A') : 'Team A'}
              </span>
              <span className="text-muted text-[13px] font-normal">
                {!tournamentId ? 'Select Tournament' : team_a_id ? null : 'Select Team'}
              </span>
            </button>
            <div className="relative z-10 -mx-3 flex shrink-0 items-center">
              <span className="bg-brand text-ink flex h-13 w-13 shrink-0 items-center justify-center rounded-full border-[8px] border-black text-[12px] font-bold tracking-wide uppercase">
                VS
              </span>
            </div>
            <button
              type="button"
              disabled={!tournamentId || teams.length === 0}
              onClick={() =>
                openDialog('startMatchTeamSelect', {
                  title: 'Select Team B',
                  teams: teams.filter((t) => String(t.id) !== team_a_id),
                  selectedTeamId: team_b_id,
                  onSelect: (id) => setValue('team_b_id', id),
                })
              }
              className={`bg-surface flex flex-1 flex-col items-center justify-center gap-1 rounded-[17px] border border-[#FFFFFF0F] p-4 transition-opacity active:opacity-90 disabled:cursor-default disabled:opacity-60 ${errors.team_b_id ? 'border-red-500' : ''}`}
              aria-label="Select Team B"
            >
              <TeamLogo team={teams.find((t) => String(t.id) === team_b_id)} variant="match" />
              <span className="text-[16px] font-bold tracking-wide text-white uppercase">
                {team_b_id && teams.length > 0 ? (teams.find((t) => String(t.id) === team_b_id)?.name ?? 'Team B') : 'Team B'}
              </span>
              <span className="text-muted text-[13px] font-normal">
                {!tournamentId ? 'Select Tournament' : team_b_id ? null : 'Select Team'}
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

          <FormField htmlFor="venue" label="Select a Venue">
            <Input id="venue" placeholder="Venue Name" error={errors.venue?.message} className="!mb-0" {...register('venue')} />
          </FormField>

          {/* Match date and time */}
          <div className="flex flex-col gap-1">
            <Label className={formFieldLabelCheckoutClass}>Match Date and Time</Label>
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
                    allowFuture
                  />
                )}
              />
              <Controller
                name="match_time"
                control={control}
                render={({ field }) => (
                  <TimePicker id={field.name} value={field.value} onChange={field.onChange} placeholder="Select Time" />
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
              <FormField htmlFor="overs" label="Overs">
                <button
                  type="button"
                  id="overs"
                  onClick={() =>
                    openDialog('startMatchOvers', {
                      initialOvers: overs,
                      options: oversOptions,
                      onChange: (v) => setValue('overs', v),
                    })
                  }
                  className={`${oversInputBase} ${!overs ? '!text-muted/47' : ''}`}
                  aria-label="Select Overs"
                >
                  {overs || 'Select Overs'}
                </button>
                {errors.overs?.message && (
                  <p className="text-sm text-red-200" role="alert">
                    {errors.overs.message}
                  </p>
                )}
              </FormField>
            </div>

            <div className="space-y-6">
              {/* Wickets / players per side */}
              <FormField htmlFor="players-per-side" label="Wickets">
                <button
                  type="button"
                  id="players-per-side"
                  onClick={() =>
                    openDialog('startMatchPlayersPerSide', {
                      initialPlayersPerSide: playersPerSide,
                      options: playersPerSideOptions,
                      onSelect: (val) => setValue('players_per_side', val),
                    })
                  }
                  className={`${oversInputBase} ${!playersPerSide ? '!text-muted/47' : ''}`}
                  aria-label="Select Players Per Side"
                >
                  {playersPerSide || 'Select Players Per Side'}
                </button>
                {errors.players_per_side?.message && (
                  <p className="text-sm text-red-200" role="alert">
                    {errors.players_per_side.message}
                  </p>
                )}
              </FormField>
            </div>
          </div>

          <FileUploadField
            label="Stream Thumbnail"
            value={thumbnailUpload}
            onChange={setThumbnailUpload}
            accept="image/jpeg,image/png,image/webp"
            acceptLabel="JPG, PNG, WebP"
            maxSizeMb={5}
            hint="Shown on the Live hub."
          />

          {/* Actions */}
          <div className="flex gap-3 pt-2 lg:justify-start">
            <Button
              type="button"
              variant="fixture"
              onClick={handleSubmit(onSaveFixture)}
              className="flex-1 cursor-pointer lg:w-[150px] lg:flex-none lg:whitespace-nowrap"
              disabled={isCreatingMatch}
            >
              {isCreatingMatch ? 'Saving…' : 'Save Fixture'}
            </Button>
            <Button
              type="button"
              variant="orange"
              onClick={handleSubmit(onOpenToss)}
              className="flex-1 cursor-pointer lg:w-[150px] lg:flex-none lg:whitespace-nowrap"
              disabled={isCreatingMatch || isUpdatingToss}
            >
              {isCreatingMatch || isUpdatingToss ? 'Starting…' : 'Start Match'}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
