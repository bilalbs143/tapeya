import { useEffect, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { teamFormSchema } from '@/lib/validations/team';
import {
  useGetCitiesQuery,
  useGetCountriesQuery,
} from '@/store/api/locationApi';
import { useSearchPlayersQuery } from '@/store/api/playerApi';
import { useSearchSponsorsQuery } from '@/store/api/sponsorApi';
import {
  useCreateTeamMutation,
  useSearchTeamsQuery,
} from '@/store/api/teamApi';
import {
  useAttachTeamsToTournamentMutation,
  useGetTournamentQuery,
} from '@/store/api/tournamentApi';
import { Button } from '@/ui/Button';
import { Checkbox } from '@/ui/Checkbox';
import { Container } from '@/ui/Container';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import {
  Select,
  SelectContent,
  selectContentInputClass,
  SelectItem,
  selectItemInputClass,
  SelectTrigger,
  selectTriggerInputClass,
  SelectValue,
  selectViewportInputClass,
} from '@/ui/Select';

const DEFAULT_VALUES = {
  name: '',
  code: '',
  sponsor_user_id: '',
  country: '',
  city: '',
  icon_player_ids: [],
};

const DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;

const labelClass = 'mb-4 block capitalize text-[16px] text-white';

function CloseIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export default function TournamentAddTeam() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { tournamentId } = useParams();
  const toast = useToast();
  const tournamentFromState = state?.tournament ?? null;

  const tournamentIdNum =
    tournamentId != null && tournamentId !== ''
      ? Number(tournamentId)
      : tournamentFromState?.id;
  const isValidId = Number.isInteger(tournamentIdNum) && tournamentIdNum > 0;

  const { data: tournamentFromApi } = useGetTournamentQuery(
    { id: tournamentIdNum },
    { skip: !isValidId || !!tournamentFromState },
  );
  const tournament = tournamentFromState ?? tournamentFromApi ?? null;

  useEffect(() => {
    if (!isValidId) {
      navigate('/organizer/tournaments', { replace: true });
    }
  }, [isValidId, navigate]);

  const fileInputRef = useRef(null);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [logoName, setLogoName] = useState('No File Selected');
  const [logoFile, setLogoFile] = useState(/** @type {File | null} */ (null));
  const [selectedSponsor, setSelectedSponsor] = useState(
    /** @type {{ id: number; name: string } | null} */ (null),
  );
  const [sponsorSearch, setSponsorSearch] = useState('');
  const [debouncedSponsorSearch, setDebouncedSponsorSearch] = useState('');
  const [iconPlayerSearch, setIconPlayerSearch] = useState('');
  const [debouncedIconPlayerSearch, setDebouncedIconPlayerSearch] =
    useState('');

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(teamFormSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const nameValue = watch('name') ?? '';
  const searchQuery = nameValue.trim();
  const { data: searchResults = [], isFetching: isSearching } =
    useSearchTeamsQuery(searchQuery, {
      skip: searchQuery.length < 2 || !!selectedTeam,
    });

  const [createTeam, { isLoading: isSubmitting }] = useCreateTeamMutation();
  const [attachTeamsToTournament] = useAttachTeamsToTournamentMutation();

  const selectedCountryName = watch('country');
  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedSponsorSearch(sponsorSearch.trim()),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(t);
  }, [sponsorSearch]);
  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedIconPlayerSearch(iconPlayerSearch.trim()),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(t);
  }, [iconPlayerSearch]);

  const { data: sponsorsList = [], isFetching: isSearchingSponsors } =
    useSearchSponsorsQuery(debouncedSponsorSearch, {
      skip: debouncedSponsorSearch.length < MIN_SEARCH_LENGTH,
    });
  const { data: playersList = [], isFetching: isSearchingPlayers } =
    useSearchPlayersQuery(debouncedIconPlayerSearch, {
      skip: debouncedIconPlayerSearch.length < MIN_SEARCH_LENGTH,
    });
  const { data: countriesList = [] } = useGetCountriesQuery();
  const selectedCountry = countriesList.find(
    (c) => c.name === selectedCountryName,
  );
  const countryCode = selectedCountry?.country_code ?? null;
  const { data: citiesList = [] } = useGetCitiesQuery(countryCode, {
    skip: !countryCode,
  });

  const isReadonly = !!selectedTeam;
  const readonlyClass = isReadonly ? 'cursor-default opacity-90' : '';
  const showSearchResults = searchQuery.length >= 2 && !selectedTeam;

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    setValue('name', team.name ?? '');
    setValue('code', team.code ?? '');
    setValue('country', team.country ?? '');
    setValue('city', team.city ?? '');
    setValue(
      'sponsor_user_id',
      team.sponsor_id != null ? String(team.sponsor_id) : '',
    );
    setValue(
      'icon_player_ids',
      Array.isArray(team.icon_player_ids) ? team.icon_player_ids : [],
    );
    setSelectedSponsor(
      team.sponsor_id != null && team.sponsor
        ? { id: team.sponsor_id, name: team.sponsor.name ?? '' }
        : null,
    );
  };

  const handleChangeTeam = () => {
    setSelectedTeam(null);
    setSelectedSponsor(null);
    setSponsorSearch('');
    setIconPlayerSearch('');
    reset(DEFAULT_VALUES);
    setLogoName('No File Selected');
    setLogoFile(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setLogoName(file ? file.name : 'No File Selected');
    setLogoFile(file ?? null);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data) => {
    try {
      if (selectedTeam?.id) {
        await attachTeamsToTournament({
          tournamentId: tournamentIdNum,
          team_ids: [selectedTeam.id],
        }).unwrap();
        toast.success('Team added to tournament.');
        navigate(`/organizer/tournaments/${tournamentIdNum}/saved-teams`, {
          state: {
            newTeam: selectedTeam,
            tournament: tournament ?? { id: tournamentIdNum },
          },
        });
        return;
      }

      const payload = {
        name: data.name.trim(),
        code: data.code.trim(),
        country: data.country.trim(),
        city: data.city.trim(),
        sponsor_user_id: data.sponsor_user_id ?? null,
        icon_player_ids: Array.isArray(data.icon_player_ids)
          ? data.icon_player_ids
          : [],
        logo: logoFile ?? undefined,
      };
      const result = await createTeam(payload).unwrap();
      const team = result?.data ?? result;
      const teamId = team?.id;

      if (teamId && tournamentIdNum) {
        await attachTeamsToTournament({
          tournamentId: tournamentIdNum,
          team_ids: [teamId],
        }).unwrap();
      }

      toast.success(
        teamId && tournamentIdNum
          ? 'Team created and added to tournament.'
          : 'Team created.',
      );
      navigate(`/organizer/tournaments/${tournamentIdNum}/saved-teams`, {
        state: {
          newTeam: team,
          tournament: tournament ?? { id: tournamentIdNum },
        },
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err) ?? 'Failed to save team.');
    }
  };

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
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
          <h1 className="min-w-0 flex-1 pr-[27px] text-center text-[16px] font-bold tracking-wide text-white uppercase">
            Add Team
          </h1>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-10">
          <FormField
            label="Team Name"
            htmlFor="name"
            labelClassName={labelClass}
            required
          >
            <div className="relative">
              <Input
                id="name"
                placeholder="Type team name or code to search"
                autoComplete="off"
                maxLength={255}
                error={errors.name?.message}
                readOnly={isReadonly}
                className={isReadonly ? `${readonlyClass} pr-12` : ''}
                {...register('name')}
              />
              {selectedTeam && (
                <button
                  type="button"
                  onClick={handleChangeTeam}
                  className="absolute top-0 right-0 bottom-0 flex w-10 items-center justify-center text-[#A2A6AB] transition-colors hover:text-white active:opacity-80"
                  aria-label="Change team"
                >
                  <CloseIcon />
                </button>
              )}
              {showSearchResults && (
                <div className="absolute top-full right-0 left-0 z-10 mt-1 max-h-48 overflow-auto rounded-[6px] border border-[#141412] bg-[#141412] shadow-lg">
                  {isSearching ? (
                    <p className="px-4 py-3 text-[13px] text-[#A2A6AB] capitalize">
                      Searching…
                    </p>
                  ) : searchResults.length > 0 ? (
                    <ul className="py-1">
                      {searchResults.map((team) => (
                        <li key={team.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectTeam(team)}
                            className="flex w-full cursor-pointer flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-white/10"
                          >
                            <span className="font-semibold text-white">
                              {team.name}
                            </span>
                            <span className="text-[13px] text-[#A2A6AB]">
                              Code: {team.code}
                              {team.sponsor?.name
                                ? ` · ${team.sponsor.name}`
                                : ''}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-4 py-3 text-[13px] text-[#A2A6AB] capitalize">
                      No teams found. Fill the form below to add a new team.
                    </p>
                  )}
                </div>
              )}
            </div>
          </FormField>

          <FormField
            label="Team Code"
            htmlFor="code"
            labelClassName={labelClass}
            required
          >
            <Input
              id="code"
              placeholder="E.g. IND, MI"
              autoComplete="off"
              maxLength={20}
              error={errors.code?.message}
              readOnly={isReadonly}
              className={readonlyClass}
              {...register('code')}
            />
          </FormField>

          <FormField
            label="Owner / Sponsor"
            htmlFor="sponsor_user_id"
            labelClassName={labelClass}
          >
            <Controller
              name="sponsor_user_id"
              control={control}
              render={({ field }) => {
                const sponsorInputValue = selectedSponsor
                  ? selectedSponsor.name
                  : sponsorSearch;
                const sponsorQuery = sponsorSearch.trim();
                const showSponsorResults =
                  !isReadonly && !selectedSponsor && sponsorQuery.length > 0;

                return (
                  <div className="relative">
                    <Input
                      id="sponsor_user_id"
                      placeholder="Search by name, nickname or phone…"
                      autoComplete="off"
                      disabled={isReadonly}
                      value={sponsorInputValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (selectedSponsor) {
                          setSelectedSponsor(null);
                          field.onChange('');
                        }
                        setSponsorSearch(value);
                      }}
                      className={readonlyClass}
                    />
                    {selectedSponsor && !isReadonly && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSponsor(null);
                          field.onChange('');
                          setSponsorSearch('');
                        }}
                        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[#A2A6AB] transition-colors hover:text-white active:opacity-80"
                        aria-label="Clear sponsor"
                      >
                        <CloseIcon />
                      </button>
                    )}
                    {showSponsorResults && (
                      <div className="absolute top-full right-0 left-0 z-10 mt-1 max-h-60 overflow-auto rounded-[6px] border border-[#141412] bg-[#141412] shadow-lg">
                        {debouncedSponsorSearch.length < MIN_SEARCH_LENGTH ? (
                          <p className="px-3 py-4 text-center text-[13px] text-[#A2A6AB]">
                            Type at least {MIN_SEARCH_LENGTH} characters to
                            search
                          </p>
                        ) : isSearchingSponsors ? (
                          <p className="px-3 py-4 text-center text-[13px] text-[#A2A6AB]">
                            Searching…
                          </p>
                        ) : sponsorsList.length === 0 ? (
                          <p className="px-3 py-4 text-center text-[13px] text-[#A2A6AB]">
                            No sponsors found
                          </p>
                        ) : (
                          <ul className="space-y-0.5">
                            {sponsorsList.map((s) => (
                              <li key={s.id}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    field.onChange(String(s.id));
                                    setSelectedSponsor({
                                      id: s.id,
                                      name: s.name ?? '',
                                    });
                                    setSponsorSearch('');
                                  }}
                                  className="flex w-full cursor-pointer items-center rounded-sm px-3 py-2.5 text-left text-base text-white transition-colors outline-none hover:bg-white/10 focus:bg-white/10"
                                >
                                  {s.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </FormField>

          <FormField
            label="Country"
            htmlFor="country"
            labelClassName={labelClass}
            required
          >
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ''}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setValue('city', '');
                  }}
                  disabled={isReadonly}
                >
                  <SelectTrigger
                    id="country"
                    className={`${selectTriggerInputClass} ${readonlyClass}`}
                    aria-label="Country"
                  >
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent
                    className={selectContentInputClass}
                    viewportClassName={selectViewportInputClass}
                    position="popper"
                  >
                    {countriesList.map((c) => (
                      <SelectItem
                        key={c.country_code}
                        value={c.name}
                        className={selectItemInputClass}
                        textClassName="!text-white"
                        indicatorClassName="!text-white"
                      >
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          {errors.country?.message && (
            <p className="text-sm text-red-200" role="alert">
              {errors.country.message}
            </p>
          )}

          <FormField
            label="City"
            htmlFor="city"
            labelClassName={labelClass}
            required
          >
            {isReadonly && selectedTeam ? (
              <Input
                id="city"
                value={selectedTeam.city ?? ''}
                readOnly
                className={readonlyClass}
              />
            ) : (
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    disabled={!countryCode}
                  >
                    <SelectTrigger
                      id="city"
                      className={`${selectTriggerInputClass} ${readonlyClass}`}
                      aria-label="City"
                      disabled={!countryCode}
                    >
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent
                      className={selectContentInputClass}
                      viewportClassName={selectViewportInputClass}
                      position="popper"
                    >
                      {citiesList.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={c.name}
                          className={selectItemInputClass}
                          textClassName="!text-white"
                          indicatorClassName="!text-white"
                        >
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>
          {errors.city?.message && (
            <p className="text-sm text-red-200" role="alert">
              {errors.city.message}
            </p>
          )}

          <FormField
            label="Icon Players"
            htmlFor="icon_player_ids"
            labelClassName={labelClass}
          >
            <Controller
              name="icon_player_ids"
              control={control}
              render={({ field }) => {
                const iconQuery = iconPlayerSearch.trim();
                const showPlayerResults = !isReadonly && iconQuery.length > 0;

                return (
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        id="icon_player_ids"
                        placeholder="Search by name, nickname or phone…"
                        autoComplete="off"
                        disabled={isReadonly}
                        value={iconPlayerSearch}
                        onChange={(e) => setIconPlayerSearch(e.target.value)}
                        className={readonlyClass}
                      />
                      {field.value?.length > 0 && !isReadonly && (
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange([]);
                            setIconPlayerSearch('');
                          }}
                          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[#A2A6AB] transition-colors hover:text-white active:opacity-80"
                          aria-label="Clear selected icon players"
                        >
                          <CloseIcon />
                        </button>
                      )}
                      {showPlayerResults && (
                        <div className="absolute top-full right-0 left-0 z-10 mt-1 max-h-60 overflow-auto rounded-[6px] border border-[#141412] bg-[#141412] shadow-lg">
                          {debouncedIconPlayerSearch.length <
                          MIN_SEARCH_LENGTH ? (
                            <p className="px-3 py-4 text-center text-[13px] text-[#A2A6AB]">
                              Type at least {MIN_SEARCH_LENGTH} characters to
                              search
                            </p>
                          ) : isSearchingPlayers ? (
                            <p className="px-3 py-4 text-center text-[13px] text-[#A2A6AB]">
                              Searching…
                            </p>
                          ) : playersList.length === 0 ? (
                            <p className="px-3 py-4 text-center text-[13px] text-[#A2A6AB]">
                              No players found
                            </p>
                          ) : (
                            <div className="space-y-0.5">
                              {playersList.map((player) => (
                                <label
                                  key={player.id}
                                  className="flex cursor-pointer items-center gap-3 rounded-sm py-2.5 pr-4 pl-4 text-base text-white outline-none focus-within:bg-white/10 hover:bg-white/10"
                                >
                                  <Checkbox
                                    variant="input"
                                    checked={
                                      field.value?.includes(player.id) ?? false
                                    }
                                    onCheckedChange={(checked) => {
                                      const prev = field.value ?? [];
                                      const next = checked
                                        ? [...prev, player.id]
                                        : prev.filter((id) => id !== player.id);
                                      field.onChange(next);
                                    }}
                                    disabled={isReadonly}
                                  />
                                  <span className="truncate font-normal">
                                    {player.name ?? player.nickname ?? '—'}
                                  </span>
                                  {(player.playing_role ??
                                    player.playing_role_enum) && (
                                    <span className="ml-auto shrink-0 text-[12px] text-[#A2A6AB]">
                                      {player.playing_role ??
                                        player.playing_role_enum}
                                    </span>
                                  )}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {field.value?.length > 0 && (
                      <p className="text-[13px] text-[#A2A6AB]">
                        {field.value.length} Player
                        {field.value.length === 1 ? '' : 's'} selected
                      </p>
                    )}
                  </div>
                );
              }}
            />
          </FormField>

          {!isReadonly && (
            <FormField
              label="Upload Logo"
              htmlFor="team_logo_input"
              labelClassName={labelClass}
            >
              <div className="flex h-12 items-center justify-between rounded-[6px] bg-[#141412] px-4">
                <span
                  className="truncate text-[16px] capitalize"
                  style={{ color: '#A2A6AB78' }}
                >
                  {logoName}
                </span>
                <div className="shrink-0">
                  <input
                    ref={fileInputRef}
                    id="team_logo_input"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                    aria-label="Upload Team Logo"
                  />
                  <Button
                    type="button"
                    variant="file"
                    size="sm"
                    className="h-8 rounded-[6px] px-2 text-[12px] font-semibold tracking-wide capitalize"
                    onClick={handleAttachClick}
                  >
                    Attach File
                  </Button>
                </div>
              </div>
            </FormField>
          )}

          {isReadonly && selectedTeam?.logo && (
            <FormField
              label="Logo"
              htmlFor="team_logo_display"
              labelClassName={labelClass}
            >
              <div className="flex h-12 items-center rounded-[6px] bg-[#141412] px-4">
                <span className="text-[16px] text-[#A2A6AB78] capitalize">
                  Logo uploaded
                </span>
              </div>
            </FormField>
          )}

          <div className="pt-4">
            <Button
              type="submit"
              variant="auth"
              disabled={isSubmitting}
              className="h-12 w-full rounded-[8px] bg-[#E4E7F4] text-[15px] font-semibold tracking-wide text-[#1a1a1a] uppercase"
            >
              {isSubmitting
                ? 'Saving…'
                : isReadonly
                  ? 'Add This Team to Tournament'
                  : 'Create & Add to Tournament'}
            </Button>
          </div>
        </form>
      </Container>
    </div>
  );
}
