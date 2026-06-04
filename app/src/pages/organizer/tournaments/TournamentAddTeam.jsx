import { useCallback, useEffect, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { DEFAULT_COUNTRY } from '@/lib/constants/geo';
import { DEBOUNCE_MS, MIN_SEARCH_LENGTH } from '@/lib/constants/search';
import { EMPTY_FILE_UPLOAD } from '@/lib/utils/fileUploadUtils';
import {
  areTournamentTeamsComplete,
  canAddTournamentTeams,
  getTournamentTitle,
  parseTournamentId,
} from '@/lib/utils/tournamentUtils';
import { teamFormSchema } from '@/lib/validations/team';
import { useGetCitiesQuery, useGetCountriesQuery } from '@/store/api/locationApi';
import { uploadMediaFile, useUploadMediaMutation } from '@/store/api/mediaApi';
import { useSearchSquadMembersQuery } from '@/store/api/playerApi';
import { useSearchSponsorsQuery } from '@/store/api/sponsorApi';
import { useCreateTeamMutation, useSearchTeamsQuery } from '@/store/api/teamApi';
import { useAttachTeamsToTournamentMutation, useGetTournamentQuery, useGetTournamentTeamsQuery } from '@/store/api/tournamentApi';
import { Button } from '@/ui/Button';
import { Checkbox } from '@/ui/Checkbox';
import { Container } from '@/ui/Container';
import { FileUploadField } from '@/ui/FileUploadField';
import { FormField } from '@/ui/FormField';
import { CloseIcon } from '@/ui/icons/CloseIcon';
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
  country: DEFAULT_COUNTRY,
  city: '',
  icon_player_ids: [],
};

export default function TournamentAddTeam() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { tournamentId } = useParams();
  const toast = useToast();

  const tournamentFromState = state?.tournament ?? null;

  const tournamentIdNum = parseTournamentId(tournamentId, tournamentFromState?.id);
  const isValidId = tournamentIdNum != null;

  const { data: tournamentFromApi } = useGetTournamentQuery(
    { id: tournamentIdNum },
    { skip: !isValidId || !!tournamentFromState },
  );
  const tournament = tournamentFromState ?? tournamentFromApi ?? null;

  const { data: existingTeams = [], isSuccess: teamsLoaded } = useGetTournamentTeamsQuery(tournamentIdNum, {
    skip: !isValidId,
  });
  const teamsComplete = areTournamentTeamsComplete(tournament, existingTeams.length);

  useEffect(() => {
    if (!isValidId) {
      navigate('/organizer/tournaments', { replace: true });
    }
  }, [isValidId, navigate]);

  useEffect(() => {
    if (!isValidId || !teamsLoaded || !teamsComplete) return;
    toast.error('This tournament already has the maximum number of teams.');
    navigate(`/organizer/tournaments/${tournamentIdNum}/saved-teams`, {
      replace: true,
      state: { tournament: tournament ?? { id: tournamentIdNum } },
    });
  }, [isValidId, teamsLoaded, teamsComplete, tournamentIdNum, tournament, navigate, toast]);

  // ------------------------------------------------------------------
  // Local state
  // ------------------------------------------------------------------

  const iconPlayersFieldRef = useRef(null);
  const teamNameFieldRef = useRef(null);
  const sponsorFieldRef = useRef(null);

  const numberOfGroups = tournament?.number_of_groups ?? 1;
  const hasGroups = numberOfGroups > 1;

  const preferredGroupFromState = state?.preferredGroupIndex;
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamNameDropdownOpen, setTeamNameDropdownOpen] = useState(true);
  const [sponsorDropdownOpen, setSponsorDropdownOpen] = useState(true);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(
    /** @type {number | 'random'} */ (
      () => {
        const n = Number(preferredGroupFromState);
        if (Number.isInteger(n) && n >= 1 && n <= 16) return n;
        return 'random';
      }
    ),
  );
  useEffect(() => {
    const n = Number(preferredGroupFromState);
    if (hasGroups && Number.isInteger(n) && n >= 1 && n <= numberOfGroups) {
      setSelectedGroupIndex(n);
    }
  }, [hasGroups, numberOfGroups, preferredGroupFromState]);

  const resolveGroupIndex = () =>
    selectedGroupIndex === 'random' ? Math.floor(Math.random() * numberOfGroups) + 1 : selectedGroupIndex;

  const [logoUpload, setLogoUpload] = useState(EMPTY_FILE_UPLOAD);
  const [selectedSponsor, setSelectedSponsor] = useState(/** @type {{ id: number; name: string } | null} */ (null));
  const [sponsorSearch, setSponsorSearch] = useState('');
  const [iconPlayerSearch, setIconPlayerSearch] = useState('');
  const [iconPlayerIdToName, setIconPlayerIdToName] = useState({});
  /** Combobox: open while user filters & picks; closed shows comma‑separated summary. */
  const [iconPlayerPanelOpen, setIconPlayerPanelOpen] = useState(false);
  const closeIconPlayerPanel = useCallback(() => {
    setIconPlayerPanelOpen(false);
    setIconPlayerSearch('');
  }, []);

  // Close the icon-player panel when the user clicks outside the widget.
  useEffect(() => {
    if (!iconPlayerPanelOpen) return undefined;
    const handleOutsideClick = (e) => {
      if (iconPlayersFieldRef.current && !iconPlayersFieldRef.current.contains(e.target)) {
        closeIconPlayerPanel();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [iconPlayerPanelOpen, closeIconPlayerPanel]);
  const debouncedSponsorSearch = useDebounce(sponsorSearch.trim(), DEBOUNCE_MS);
  const debouncedIconPlayerSearch = useDebounce(iconPlayerSearch.trim(), DEBOUNCE_MS);

  // ------------------------------------------------------------------
  // Form
  // ------------------------------------------------------------------

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

  const { data: searchResults = [], isFetching: isSearching } = useSearchTeamsQuery(searchQuery, {
    skip: searchQuery.length < MIN_SEARCH_LENGTH || !!selectedTeam,
  });

  const [createTeam, { isLoading: isSubmitting }] = useCreateTeamMutation();
  const [uploadMedia] = useUploadMediaMutation();
  const [attachTeamsToTournament] = useAttachTeamsToTournamentMutation();

  const selectedCountryName = watch('country');

  const { data: sponsorsList = [], isFetching: isSearchingSponsors } = useSearchSponsorsQuery(debouncedSponsorSearch, {
    skip: debouncedSponsorSearch.length < MIN_SEARCH_LENGTH,
  });

  const { data: playersList = [], isFetching: isSearchingPlayers } = useSearchSquadMembersQuery(debouncedIconPlayerSearch, {
    skip: debouncedIconPlayerSearch.length < MIN_SEARCH_LENGTH,
  });

  const { data: countriesList = [] } = useGetCountriesQuery();

  const selectedCountry = countriesList.find((c) => c.name === selectedCountryName);
  const countryCode = selectedCountry?.country_code ?? null;

  const { data: citiesList = [] } = useGetCitiesQuery(countryCode, {
    skip: !countryCode,
  });

  // ------------------------------------------------------------------
  // Derived state
  // ------------------------------------------------------------------

  // `isReadonly` is true when an existing team has been selected from search.
  const isReadonly = !!selectedTeam;
  const readonlyClass = isReadonly ? 'cursor-default opacity-90' : '';
  const showTeamNameDropdown = searchQuery.length >= MIN_SEARCH_LENGTH && !selectedTeam && teamNameDropdownOpen;

  useEffect(() => {
    if (!showTeamNameDropdown) return undefined;
    const handleOutsideClick = (e) => {
      if (teamNameFieldRef.current && !teamNameFieldRef.current.contains(e.target)) {
        setTeamNameDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showTeamNameDropdown]);

  const sponsorQueryTrim = sponsorSearch.trim();
  const showSponsorDropdown = !isReadonly && !selectedSponsor && sponsorQueryTrim.length > 0 && sponsorDropdownOpen;

  useEffect(() => {
    if (!showSponsorDropdown) return undefined;
    const handleOutsideClick = (e) => {
      if (sponsorFieldRef.current && !sponsorFieldRef.current.contains(e.target)) {
        setSponsorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showSponsorDropdown]);

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  /** Populates all form fields from the selected search result. */
  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    setTeamNameDropdownOpen(false);
    setValue('name', team.name ?? '');
    setValue('code', team.code ?? '');
    setValue('country', team.country ?? '');
    setValue('city', team.city ?? '');
    setValue('sponsor_user_id', team.sponsor_id != null ? String(team.sponsor_id) : '');
    setValue('icon_player_ids', Array.isArray(team.icon_player_ids) ? team.icon_player_ids : []);
    const fromTeam = {};
    if (Array.isArray(team.icon_players)) {
      for (const p of team.icon_players) {
        if (p && p.id != null) {
          fromTeam[Number(p.id)] = p.name ?? p.nickname ?? '—';
        }
      }
    }
    setIconPlayerIdToName(fromTeam);
    setIconPlayerPanelOpen(false);
    setIconPlayerSearch('');
    setSelectedSponsor(team.sponsor_id != null && team.sponsor ? { id: team.sponsor_id, name: team.sponsor.name ?? '' } : null);
  };

  /** Resets the form back to create-mode (clears selected team). */
  const handleChangeTeam = () => {
    setSelectedTeam(null);
    setTeamNameDropdownOpen(true);
    setSelectedSponsor(null);
    setSponsorSearch('');
    setSponsorDropdownOpen(true);
    setIconPlayerSearch('');
    setIconPlayerIdToName({});
    setIconPlayerPanelOpen(false);
    reset(DEFAULT_VALUES);
    setLogoUpload(EMPTY_FILE_UPLOAD);
  };

  // ------------------------------------------------------------------
  // Submit
  // ------------------------------------------------------------------

  const onSubmit = async (data) => {
    if (!canAddTournamentTeams(tournament, existingTeams.length)) {
      toast.error('This tournament already has the maximum number of teams.');
      return;
    }

    try {
      // Attach-only path: an existing team was selected from search.
      if (selectedTeam?.id) {
        await attachTeamsToTournament({
          tournamentId: tournamentIdNum,
          team_ids: [selectedTeam.id],
          ...(hasGroups ? { group_index: resolveGroupIndex() } : {}),
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

      // Create-and-attach path: build a new team (no logo yet), then upload logo.
      const payload = {
        name: data.name.trim(),
        code: data.code.trim(),
        country: data.country.trim(),
        city: data.city.trim(),
        sponsor_user_id: data.sponsor_user_id ?? null,
        icon_player_ids: Array.isArray(data.icon_player_ids) ? data.icon_player_ids : [],
      };

      const result = await createTeam(payload).unwrap();
      const team = result?.data ?? result;
      const teamId = team?.id;

      // Upload logo via deferred media endpoint (after we have the team ID).
      const logoFile = logoUpload.files[0] ?? null;
      if (teamId && logoFile) {
        try {
          await uploadMediaFile(uploadMedia, { type: 'team', id: teamId, field: 'logo', file: logoFile });
        } catch {
          // Logo upload failed — team was created; warn but don't block navigation.
          toast.error('Team created but logo upload failed. You can retry from the team settings.');
        }
      }

      if (teamId && tournamentIdNum) {
        await attachTeamsToTournament({
          tournamentId: tournamentIdNum,
          team_ids: [teamId],
          ...(hasGroups ? { group_index: resolveGroupIndex() } : {}),
        }).unwrap();
      }

      toast.success(teamId && tournamentIdNum ? 'Team created and added to tournament.' : 'Team created.');
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
      <AppSubpageHeader title={tournament ? `${getTournamentTitle(tournament)} - Add Team` : 'Tournaments - Add Team'} />
      <Container>
        <form onSubmit={handleSubmit(onSubmit)} className="pb-10">
          <div className="space-y-5 lg:grid lg:grid-cols-3 lg:space-y-0 lg:gap-x-4 lg:gap-y-5">
            {hasGroups && (
              <FormField label="Group" htmlFor="group_index" required>
                <Select
                  value={String(selectedGroupIndex)}
                  onValueChange={(v) => setSelectedGroupIndex(v === 'random' ? 'random' : Number(v))}
                >
                  <SelectTrigger id="group_index" className={selectTriggerInputClass} aria-label="Select Group">
                    <SelectValue placeholder="Select Group" />
                  </SelectTrigger>
                  <SelectContent
                    className={selectContentInputClass}
                    viewportClassName={selectViewportInputClass}
                    position="popper"
                  >
                    <SelectItem
                      value="random"
                      className={selectItemInputClass}
                      textClassName="!text-white"
                      indicatorClassName="!text-white"
                    >
                      Random Group
                    </SelectItem>
                    {Array.from({ length: numberOfGroups }, (_, i) => i + 1).map((idx) => (
                      <SelectItem
                        key={idx}
                        value={String(idx)}
                        className={selectItemInputClass}
                        textClassName="!text-white"
                        indicatorClassName="!text-white"
                      >
                        Group {idx}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            )}
            {/* Team Name — search + select or free type */}
            <FormField label="Team Name" htmlFor="name" required>
              <div ref={teamNameFieldRef} className="relative">
                <Input
                  id="name"
                  placeholder="Type Team Name or Code to Search"
                  autoComplete="off"
                  maxLength={255}
                  error={errors.name?.message}
                  readOnly={isReadonly}
                  className={isReadonly ? `${readonlyClass} pr-12` : ''}
                  {...register('name', {
                    onFocus: () => {
                      if (!isReadonly) {
                        setTeamNameDropdownOpen(true);
                      }
                    },
                    onChange: () => {
                      if (!isReadonly) {
                        setTeamNameDropdownOpen(true);
                      }
                    },
                  })}
                />
                {selectedTeam && (
                  <button
                    type="button"
                    onClick={handleChangeTeam}
                    className="absolute top-0 right-0 bottom-0 flex w-10 items-center justify-center text-[#A2A6AB] transition-colors hover:text-white active:opacity-80"
                    aria-label="Change Team"
                  >
                    <CloseIcon />
                  </button>
                )}
                {/* CURSOR: extract this dropdown shell into <SearchDropdown> (see top) */}
                {showTeamNameDropdown && (
                  <div className="absolute top-full right-0 left-0 z-10 mt-1 max-h-48 overflow-auto rounded-[6px] border border-[#141412] bg-[#141412] shadow-lg">
                    {isSearching ? (
                      <p className="px-4 py-3 text-[13px] text-[#A2A6AB] capitalize">Searching…</p>
                    ) : searchResults.length > 0 ? (
                      <ul className="py-1">
                        {searchResults.map((team) => (
                          <li key={team.id}>
                            <button
                              type="button"
                              onClick={() => handleSelectTeam(team)}
                              className="flex w-full cursor-pointer flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-white/10"
                            >
                              <span className="font-semibold text-white">{team.name}</span>
                              <span className="text-[13px] text-[#A2A6AB]">
                                Code: {team.code}
                                {team.sponsor?.name ? ` · ${team.sponsor.name}` : ''}
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

            <FormField label="Team Code" htmlFor="code" required>
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

            <FormField label="Owner / Sponsor" htmlFor="sponsor_user_id">
              <Controller
                name="sponsor_user_id"
                control={control}
                render={({ field }) => {
                  const sponsorInputValue = selectedSponsor ? selectedSponsor.name : sponsorSearch;
                  return (
                    <div ref={sponsorFieldRef} className="relative">
                      <Input
                        id="sponsor_user_id"
                        placeholder="Search by Name, Nickname, or Phone…"
                        autoComplete="off"
                        disabled={isReadonly}
                        value={sponsorInputValue}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (selectedSponsor) {
                            setSelectedSponsor(null);
                            field.onChange('');
                          }
                          if (!isReadonly) {
                            setSponsorDropdownOpen(true);
                          }
                          setSponsorSearch(value);
                        }}
                        onFocus={() => {
                          if (!isReadonly) {
                            setSponsorDropdownOpen(true);
                          }
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
                            setSponsorDropdownOpen(true);
                          }}
                          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[#A2A6AB] transition-colors hover:text-white active:opacity-80"
                          aria-label="Clear Sponsor"
                        >
                          <CloseIcon />
                        </button>
                      )}
                      {/* CURSOR: extract this dropdown shell into <SearchDropdown> (see top) */}
                      {showSponsorDropdown && (
                        <div className="absolute top-full right-0 left-0 z-10 mt-1 max-h-60 overflow-auto rounded-[6px] border border-[#141412] bg-[#141412] shadow-lg">
                          {debouncedSponsorSearch.length < MIN_SEARCH_LENGTH ? (
                            <p className="px-3 py-4 text-center text-[13px] text-[#A2A6AB]">
                              Type at least {MIN_SEARCH_LENGTH} characters to search
                            </p>
                          ) : isSearchingSponsors ? (
                            <p className="px-3 py-4 text-center text-[13px] text-[#A2A6AB]">Searching…</p>
                          ) : sponsorsList.length === 0 ? (
                            <p className="px-3 py-4 text-center text-[13px] text-[#A2A6AB]">No users found</p>
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
                                      setSponsorDropdownOpen(false);
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
              {errors.sponsor_user_id?.message && (
                <p className="text-sm text-red-200" role="alert">
                  {errors.sponsor_user_id.message}
                </p>
              )}
            </FormField>

            {/* Country */}
            <FormField label="Country" htmlFor="country" required>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={(val) => {
                      field.onChange(val);
                      // Reset city when country changes so stale city values are cleared.
                      setValue('city', '');
                    }}
                    disabled={isReadonly}
                  >
                    <SelectTrigger id="country" className={`${selectTriggerInputClass} ${readonlyClass}`} aria-label="Country">
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

            {/* City — read-only Input when team is selected, Select otherwise */}
            <FormField label="City" htmlFor="city" required>
              {isReadonly ? (
                <Input id="city" value={selectedTeam?.city ?? ''} readOnly className={readonlyClass} />
              ) : (
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || ''} onValueChange={field.onChange} disabled={!countryCode}>
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

            {/* Icon Players — multi-select typeahead with checkboxes */}
            {/* CURSOR: extract into <IconPlayersField> (see top) */}
            <div>
              <FormField label="Icon Players" htmlFor="icon_player_ids">
                <Controller
                  name="icon_player_ids"
                  control={control}
                  render={({ field }) => {
                    const iconQuery = iconPlayerSearch.trim();
                    const iconPanelOpen = !isReadonly && iconPlayerPanelOpen;
                    const showPlayerResults = iconPanelOpen;
                    const displayIconPlayerNames = (field.value ?? [])
                      .map((id) => iconPlayerIdToName[id])
                      .filter(Boolean)
                      .join(', ');
                    // While the panel is open the input is a live search box.
                    // While closed it shows the comma-separated summary.
                    const iconInputDisplayValue = iconPanelOpen ? iconPlayerSearch : displayIconPlayerNames;
                    const playerLineLabel = (player) => player.name ?? player.nickname ?? '—';
                    return (
                      <div className="space-y-2">
                        <div ref={iconPlayersFieldRef} className="relative">
                          <Input
                            id="icon_player_ids"
                            role="combobox"
                            placeholder={
                              !iconPanelOpen && displayIconPlayerNames
                                ? displayIconPlayerNames
                                : 'Search by name, nickname or phone…'
                            }
                            autoComplete="off"
                            disabled={isReadonly}
                            aria-autocomplete="list"
                            aria-expanded={iconPanelOpen}
                            aria-controls="icon-players-listbox"
                            aria-haspopup="listbox"
                            value={iconInputDisplayValue}
                            onChange={(e) => {
                              if (!isReadonly) {
                                setIconPlayerSearch(e.target.value);
                              }
                            }}
                            onFocus={() => {
                              if (!isReadonly) {
                                setIconPlayerSearch('');
                                setIconPlayerPanelOpen(true);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape' && iconPanelOpen) {
                                e.stopPropagation();
                                closeIconPlayerPanel();
                              }
                            }}
                            className={field.value?.length > 0 && !isReadonly ? `${readonlyClass} pr-12`.trim() : readonlyClass}
                          />
                          {field.value?.length > 0 && !isReadonly && (
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange([]);
                                setIconPlayerSearch('');
                                setIconPlayerIdToName({});
                                setIconPlayerPanelOpen(false);
                              }}
                              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[#A2A6AB] transition-colors hover:text-white active:opacity-80"
                              aria-label="Clear Selected Icon Players"
                            >
                              <CloseIcon />
                            </button>
                          )}
                          {/* CURSOR: extract this dropdown shell into <SearchDropdown> (see top) */}
                          {showPlayerResults && (
                            <div
                              id="icon-players-listbox"
                              className="absolute top-full right-0 left-0 z-10 mt-1 max-h-60 overflow-auto rounded-[6px] border border-[#141412] bg-[#141412] shadow-lg"
                              role="listbox"
                              tabIndex={-1}
                              aria-label="Search Players"
                              aria-multiselectable="true"
                            >
                              {iconQuery.length === 0 ? (
                                <p className="px-3 py-4 text-center text-[13px] text-[#A2A6AB]">Type to search players…</p>
                              ) : debouncedIconPlayerSearch.length < MIN_SEARCH_LENGTH ? (
                                <p className="px-3 py-4 text-center text-[13px] text-[#A2A6AB]">
                                  Type at least {MIN_SEARCH_LENGTH} characters to search
                                </p>
                              ) : isSearchingPlayers ? (
                                <p className="px-3 py-4 text-center text-[13px] text-[#A2A6AB]">Searching…</p>
                              ) : playersList.length === 0 ? (
                                <p className="px-3 py-4 text-center text-[13px] text-[#A2A6AB]">No players found</p>
                              ) : (
                                <div className="space-y-0.5">
                                  {playersList.map((player) => {
                                    const isSelected = field.value?.includes(player.id);
                                    return (
                                      <div
                                        key={player.id}
                                        role="option"
                                        aria-selected={Boolean(isSelected)}
                                        className="rounded-sm outline-none focus-within:bg-white/10 hover:bg-white/10"
                                      >
                                        <label className="flex cursor-pointer items-center gap-3 py-2.5 pr-4 pl-4 text-base text-white">
                                          <Checkbox
                                            variant="input"
                                            checked={Boolean(isSelected)}
                                            onCheckedChange={(checked) => {
                                              const pLabel = playerLineLabel(player);
                                              const prev = field.value ?? [];
                                              if (checked) {
                                                setIconPlayerIdToName((m) => ({
                                                  ...m,
                                                  [player.id]: pLabel,
                                                }));
                                                const next = prev.includes(player.id) ? prev : [...prev, player.id];
                                                field.onChange(next);
                                                closeIconPlayerPanel();
                                                return;
                                              }
                                              setIconPlayerIdToName((m) => {
                                                const nextM = { ...m };
                                                delete nextM[player.id];
                                                return nextM;
                                              });
                                              field.onChange(prev.filter((id) => id !== player.id));
                                              closeIconPlayerPanel();
                                            }}
                                            disabled={isReadonly}
                                          />
                                          <span className="truncate font-normal">{playerLineLabel(player)}</span>
                                          {(player.playing_role ?? player.playing_role_enum) && (
                                            <span className="ml-auto shrink-0 text-[12px] text-[#A2A6AB]">
                                              {player.playing_role ?? player.playing_role_enum}
                                            </span>
                                          )}
                                        </label>
                                      </div>
                                    );
                                  })}
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
            </div>

            {/* Logo upload — hidden when team is selected (logo already set) */}
            {!isReadonly && (
              <FileUploadField
                label="Upload Logo"
                variant="compact"
                value={logoUpload}
                onChange={setLogoUpload}
                accept="image/jpeg,image/png,image/webp,image/gif"
                acceptLabel="JPG, PNG, WebP"
                maxSizeMb={5}
              />
            )}

            {/* Logo indicator for selected team — only when logo URL is non-empty */}
            {isReadonly && selectedTeam?.logo && String(selectedTeam.logo).trim() !== '' && (
              <FormField label="Logo" htmlFor="team_logo_display">
                <div className="flex h-12 items-center rounded-[6px] bg-[#141412] px-4">
                  <span className="text-[16px] text-[#A2A6AB] capitalize">Logo uploaded</span>
                </div>
              </FormField>
            )}

            <div className="flex justify-start pt-4 lg:col-span-3">
              <Button
                type="submit"
                variant="auth"
                disabled={isSubmitting}
                className="h-12 w-full rounded-[8px] bg-[#E4E7F4] text-[15px] font-semibold tracking-wide text-[#1a1a1a] uppercase lg:w-auto"
              >
                {isSubmitting ? 'Saving…' : isReadonly ? 'Add This Team to Tournament' : 'Create & Add to Tournament'}
              </Button>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}
