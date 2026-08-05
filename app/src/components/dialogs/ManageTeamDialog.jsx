import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { useDialog } from '@/context/DialogContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { DEFAULT_COUNTRY } from '@/lib/constants/geo';
import { DEBOUNCE_MS, MIN_SEARCH_LENGTH } from '@/lib/constants/search';
import { EMPTY_FILE_UPLOAD, fileUploadValueFromUrl } from '@/lib/utils/fileUploadUtils';
import { canAddTournamentTeams, getTournamentNumberOfGroups, mergeTournamentMeta } from '@/lib/utils/tournamentUtils';
import { teamFormSchema } from '@/lib/validations/team';
import { uploadMediaFile, useUploadMediaMutation } from '@/store/api/mediaApi';
import { useCreateTeamMutation, useSearchTeamsQuery, useUpdateTeamMutation } from '@/store/api/teamApi';
import { useAttachTeamsToTournamentMutation, useGetTournamentQuery, useGetTournamentTeamsQuery } from '@/store/api/tournamentApi';
import { useLookupUsersQuery } from '@/store/api/userApi';
import { Checkbox } from '@/ui/Checkbox';
import { CountryCityFields } from '@/ui/CountryCityFields';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FileUploadField } from '@/ui/FileUploadField';
import { FormStack } from '@/ui/form/FormStack';
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

const EMPTY_FORM = {
  name: '',
  code: '',
  sponsor_user_id: '',
  country: DEFAULT_COUNTRY,
  city: '',
  icon_player_ids: [],
};

/** @param {number|undefined} preferred @param {number} numberOfGroups */
function normalizeGroupIndex(preferred, numberOfGroups) {
  const n = Number(preferred);
  if (Number.isInteger(n) && n >= 1 && n <= numberOfGroups) return n;
  return 1;
}

/**
 * Body-only dialog — rendered by DialogManager inside BaseDialog.
 * Open via:
 *   openDialog('manageTeam', { mode: 'create', tournamentId, tournament, onSuccess })
 *   openDialog('manageTeam', { mode: 'edit', team, onSuccess })
 *
 * @param {object} props
 * @param {'create'|'edit'} props.mode
 * @param {object} [props.team] — required when mode is 'edit'
 * @param {number} [props.tournamentId] — when set on create, attaches team to tournament after save
 * @param {object} [props.tournament] — tournament meta (team limit, groups)
 * @param {number} [props.preferredGroupIndex]
 * @param {(team: object) => void} [props.onSuccess]
 */
export function ManageTeamDialog({ mode = 'create', team, tournamentId, tournament, preferredGroupIndex, onSuccess }) {
  const isEdit = mode === 'edit';
  const isTournamentCreate = !isEdit && tournamentId != null;
  const { closeDialog } = useDialog();
  const toast = useToast();

  // ── Form ────────────────────────────────────────────────────────────────────

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
    defaultValues: EMPTY_FORM,
    mode: 'onChange',
  });

  const country = watch('country');
  const city = watch('city');
  const nameValue = watch('name') ?? '';
  const searchQuery = nameValue.trim();

  const { data: tournamentFromApi } = useGetTournamentQuery({ id: tournamentId }, { skip: !isTournamentCreate || !tournamentId });
  const resolvedTournament = useMemo(() => mergeTournamentMeta(tournament, tournamentFromApi), [tournament, tournamentFromApi]);
  const numberOfGroups = getTournamentNumberOfGroups(resolvedTournament);
  const hasGroups = numberOfGroups > 1;

  // ── Local state ─────────────────────────────────────────────────────────────

  const teamNameFieldRef = useRef(null);
  const sponsorFieldRef = useRef(null);
  const iconPlayersFieldRef = useRef(null);

  const [logoUpload, setLogoUpload] = useState(EMPTY_FILE_UPLOAD);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamNameDropdownOpen, setTeamNameDropdownOpen] = useState(isTournamentCreate);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(() => normalizeGroupIndex(preferredGroupIndex, numberOfGroups));
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [sponsorSearch, setSponsorSearch] = useState('');
  const [sponsorDropdownOpen, setSponsorDropdownOpen] = useState(false);
  const [iconPlayerSearch, setIconPlayerSearch] = useState('');
  const [iconPlayerIdToName, setIconPlayerIdToName] = useState({});
  const [iconPlayerPanelOpen, setIconPlayerPanelOpen] = useState(false);

  const debouncedSponsorSearch = useDebounce(sponsorSearch.trim(), DEBOUNCE_MS);
  const debouncedIconPlayerSearch = useDebounce(iconPlayerSearch.trim(), DEBOUNCE_MS);

  const closeIconPlayerPanel = useCallback(() => {
    setIconPlayerPanelOpen(false);
    setIconPlayerSearch('');
  }, []);

  const isReadonly = isTournamentCreate && !!selectedTeam;
  const readonlyClass = isReadonly ? 'cursor-default opacity-90' : '';

  const showSponsorDropdown = !isReadonly && !selectedSponsor && sponsorSearch.trim().length > 0 && sponsorDropdownOpen;
  const showTeamNameDropdown =
    isTournamentCreate && searchQuery.length >= MIN_SEARCH_LENGTH && !selectedTeam && teamNameDropdownOpen;

  // ── Prefill form (edit) or reset (create) ───────────────────────────────────

  useEffect(() => {
    if (isEdit) {
      if (!team) return;

      const iconIdToName = {};
      const iconIds = [];
      if (Array.isArray(team.icon_players)) {
        for (const p of team.icon_players) {
          if (p?.id != null) {
            iconIdToName[Number(p.id)] = p.name ?? p.nickname ?? '—';
            iconIds.push(Number(p.id));
          }
        }
      }

      reset({
        name: team.name ?? '',
        code: team.code ?? '',
        sponsor_user_id: team.sponsor_id != null ? String(team.sponsor_id) : '',
        country: team.country ?? '',
        city: team.city ?? '',
        icon_player_ids: iconIds,
      });

      setIconPlayerIdToName(iconIdToName);
      setSelectedSponsor(team.sponsor_id != null && team.sponsor ? { id: team.sponsor_id, name: team.sponsor.name ?? '' } : null);
    } else {
      reset(EMPTY_FORM);
      setIconPlayerIdToName({});
      setSelectedSponsor(null);
      setSelectedTeam(null);
      setTeamNameDropdownOpen(isTournamentCreate);
    }

    setLogoUpload(isEdit && team?.logo ? fileUploadValueFromUrl(team.logo) : EMPTY_FILE_UPLOAD);
    setSponsorSearch('');
    setSponsorDropdownOpen(false);
    setIconPlayerSearch('');
    setIconPlayerPanelOpen(false);
  }, [isEdit, team, reset, isTournamentCreate]);

  useEffect(() => {
    if (!isEdit && isTournamentCreate) {
      setSelectedGroupIndex(normalizeGroupIndex(preferredGroupIndex, numberOfGroups));
    }
  }, [isEdit, isTournamentCreate, preferredGroupIndex, numberOfGroups]);

  // ── Close sponsor dropdown on outside click ─────────────────────────────────

  useEffect(() => {
    if (!showSponsorDropdown) return undefined;
    const handle = (e) => {
      if (sponsorFieldRef.current && !sponsorFieldRef.current.contains(e.target)) {
        setSponsorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showSponsorDropdown]);

  useEffect(() => {
    if (!showTeamNameDropdown) return undefined;
    const handle = (e) => {
      if (teamNameFieldRef.current && !teamNameFieldRef.current.contains(e.target)) {
        setTeamNameDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showTeamNameDropdown]);

  // ── Close icon player panel on outside click ────────────────────────────────

  useEffect(() => {
    if (!iconPlayerPanelOpen) return undefined;
    const handle = (e) => {
      if (iconPlayersFieldRef.current && !iconPlayersFieldRef.current.contains(e.target)) {
        closeIconPlayerPanel();
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [iconPlayerPanelOpen, closeIconPlayerPanel]);

  // ── API ──────────────────────────────────────────────────────────────────────

  const { data: sponsorsList = [], isFetching: isSearchingSponsors } = useLookupUsersQuery(debouncedSponsorSearch, {
    skip: debouncedSponsorSearch.length < MIN_SEARCH_LENGTH,
  });

  const { data: playersList = [], isFetching: isSearchingPlayers } = useLookupUsersQuery(debouncedIconPlayerSearch, {
    skip: debouncedIconPlayerSearch.length < MIN_SEARCH_LENGTH,
  });

  const { data: searchResults = [], isFetching: isSearchingTeams } = useSearchTeamsQuery(searchQuery, {
    skip: !isTournamentCreate || searchQuery.length < MIN_SEARCH_LENGTH || !!selectedTeam,
  });

  const { data: existingTeams = [] } = useGetTournamentTeamsQuery(tournamentId, {
    skip: !isTournamentCreate || !tournamentId,
  });

  const [createTeam, { isLoading: isCreating }] = useCreateTeamMutation();
  const [updateTeam, { isLoading: isUpdating }] = useUpdateTeamMutation();
  const [attachTeamsToTournament, { isLoading: isAttaching }] = useAttachTeamsToTournamentMutation();
  const [uploadMedia] = useUploadMediaMutation();

  const isSaving = isCreating || isUpdating || isAttaching;

  const handleSelectTeam = (picked) => {
    setSelectedTeam(picked);
    setTeamNameDropdownOpen(false);
    setValue('name', picked.name ?? '');
    setValue('code', picked.code ?? '');
    setValue('country', picked.country ?? '');
    setValue('city', picked.city ?? '');
    setValue('sponsor_user_id', picked.sponsor_id != null ? String(picked.sponsor_id) : '');
    setValue('icon_player_ids', Array.isArray(picked.icon_player_ids) ? picked.icon_player_ids : []);
    const fromTeam = {};
    if (Array.isArray(picked.icon_players)) {
      for (const p of picked.icon_players) {
        if (p?.id != null) {
          fromTeam[Number(p.id)] = p.name ?? p.nickname ?? '—';
        }
      }
    }
    setIconPlayerIdToName(fromTeam);
    setIconPlayerPanelOpen(false);
    setIconPlayerSearch('');
    setSelectedSponsor(
      picked.sponsor_id != null && picked.sponsor ? { id: picked.sponsor_id, name: picked.sponsor.name ?? '' } : null,
    );
  };

  const handleChangeTeam = () => {
    setSelectedTeam(null);
    setTeamNameDropdownOpen(true);
    setSelectedSponsor(null);
    setSponsorSearch('');
    setSponsorDropdownOpen(true);
    setIconPlayerSearch('');
    setIconPlayerIdToName({});
    setIconPlayerPanelOpen(false);
    reset(EMPTY_FORM);
    setLogoUpload(EMPTY_FILE_UPLOAD);
  };

  const attachToTournament = async (teamId, attachedTeam) => {
    await attachTeamsToTournament({
      tournamentId,
      team_ids: [teamId],
      ...(hasGroups ? { group_index: selectedGroupIndex } : {}),
    }).unwrap();
    return attachedTeam;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const onSubmit = async (data) => {
    const logoFile = logoUpload.files[0] ?? null;

    if (isTournamentCreate && hasGroups) {
      if (!Number.isInteger(selectedGroupIndex) || selectedGroupIndex < 1 || selectedGroupIndex > numberOfGroups) {
        toast.error('Please select a group for this team.');
        return;
      }
    }

    if (isTournamentCreate && !canAddTournamentTeams(resolvedTournament, existingTeams.length)) {
      toast.error('This tournament already has the maximum number of teams.');
      return;
    }

    try {
      if (isEdit) {
        if (!team?.id) return;

        const updated = await updateTeam({ teamId: team.id, ...data }).unwrap();

        if (logoFile) {
          try {
            await uploadMediaFile(uploadMedia, { type: 'team', id: team.id, field: 'logo', file: logoFile });
          } catch {
            toast.error('Team updated but logo upload failed. You can retry from team settings.');
          }
        }

        toast.success('Team updated.');
        onSuccess?.(updated?.data ?? updated);
        closeDialog();
        return;
      }

      if (isTournamentCreate && selectedTeam?.id) {
        await attachToTournament(selectedTeam.id, selectedTeam);
        toast.success('Team added to tournament.');
        onSuccess?.(selectedTeam);
        closeDialog();
        return;
      }

      const result = await createTeam(data).unwrap();
      const saved = result?.data ?? result;
      const teamId = saved?.id;

      if (teamId && logoFile) {
        try {
          await uploadMediaFile(uploadMedia, { type: 'team', id: teamId, field: 'logo', file: logoFile });
        } catch {
          toast.error('Team created but logo upload failed. You can retry from team settings.');
        }
      }

      if (isTournamentCreate && teamId) {
        await attachToTournament(teamId, saved);
        toast.success('Team created and added to tournament.');
      } else {
        toast.success('Team created.');
      }

      onSuccess?.(saved);
      closeDialog();
    } catch (err) {
      toast.error(getApiErrorMessage(err) ?? (isEdit ? 'Failed to update team.' : 'Failed to save team.'));
    }
  };

  const saveLabel = (() => {
    if (isSaving) {
      if (isEdit) return 'Saving…';
      if (isTournamentCreate && isReadonly) return 'Adding…';
      return isTournamentCreate ? 'Saving…' : 'Creating…';
    }
    if (isEdit) return 'Save Changes';
    if (isTournamentCreate && isReadonly) return 'Add This Team to Tournament';
    if (isTournamentCreate) return 'Create & Add to Tournament';
    return 'Create Team';
  })();

  // ── Render ───────────────────────────────────────────────────────────────────

  const playerLineLabel = (player) => player.name ?? player.nickname ?? '—';

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>
          {isEdit ? 'Edit Team' : isTournamentCreate ? 'Add Team to Tournament' : 'Create Team'}
        </DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack as="form" id="manage-team-form" density="default" className="pb-2" onSubmit={handleSubmit(onSubmit)}>
          {isTournamentCreate && hasGroups ? (
            <FormField label="Group" htmlFor="manage-group" required>
              <Select value={String(selectedGroupIndex)} onValueChange={(v) => setSelectedGroupIndex(Number(v))}>
                <SelectTrigger id="manage-group" className={selectTriggerInputClass} aria-label="Select Group">
                  <SelectValue placeholder="Select Group" />
                </SelectTrigger>
                <SelectContent className={selectContentInputClass} viewportClassName={selectViewportInputClass} position="popper">
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
          ) : null}

          {/* Team Name */}
          <FormField label="Team Name" htmlFor="manage-name" required>
            {isTournamentCreate ? (
              <div ref={teamNameFieldRef} className="relative">
                <Input
                  id="manage-name"
                  placeholder="Type Team Name or Code to Search"
                  autoComplete="off"
                  maxLength={255}
                  error={errors.name?.message}
                  readOnly={isReadonly}
                  className={isReadonly ? `${readonlyClass} pr-12` : ''}
                  {...register('name', {
                    onFocus: () => {
                      if (!isReadonly) setTeamNameDropdownOpen(true);
                    },
                    onChange: () => {
                      if (!isReadonly) setTeamNameDropdownOpen(true);
                    },
                  })}
                />
                {selectedTeam ? (
                  <button
                    type="button"
                    onClick={handleChangeTeam}
                    className="text-muted absolute top-0 right-0 bottom-0 flex w-10 items-center justify-center transition-colors hover:text-white active:opacity-80"
                    aria-label="Change Team"
                  >
                    <CloseIcon />
                  </button>
                ) : null}
                {showTeamNameDropdown ? (
                  <div className="bg-surface absolute top-full right-0 left-0 z-10 mt-1 max-h-48 overflow-auto rounded-[6px] border border-[#141412] shadow-lg">
                    {isSearchingTeams ? (
                      <p className="text-muted px-4 py-3 text-[13px] capitalize">Searching…</p>
                    ) : searchResults.length > 0 ? (
                      <ul className="py-1">
                        {searchResults.map((result) => (
                          <li key={result.id}>
                            <button
                              type="button"
                              onClick={() => handleSelectTeam(result)}
                              className="flex w-full cursor-pointer flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-white/10"
                            >
                              <span className="font-semibold text-white">{result.name}</span>
                              <span className="text-muted text-[13px]">
                                Code: {result.code}
                                {result.sponsor?.name ? ` · ${result.sponsor.name}` : ''}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted px-4 py-3 text-[13px] capitalize">No team found. Add new team below.</p>
                    )}
                  </div>
                ) : null}
              </div>
            ) : (
              <Input
                id="manage-name"
                placeholder="Team name"
                autoComplete="off"
                maxLength={255}
                error={errors.name?.message}
                {...register('name')}
              />
            )}
          </FormField>

          {/* Team Code */}
          <FormField label="Team Code" htmlFor="manage-code" required>
            <Input
              id="manage-code"
              placeholder="E.g. IND, MI"
              autoComplete="off"
              maxLength={20}
              error={errors.code?.message}
              readOnly={isReadonly}
              className={readonlyClass}
              {...register('code')}
            />
          </FormField>

          {/* Owner / Sponsor */}
          <FormField label="Owner / Sponsor" htmlFor="manage-sponsor">
            <Controller
              name="sponsor_user_id"
              control={control}
              render={({ field }) => (
                <div ref={sponsorFieldRef} className="relative">
                  <Input
                    id="manage-sponsor"
                    placeholder="Search by name, nickname or phone…"
                    autoComplete="off"
                    disabled={isReadonly}
                    value={selectedSponsor ? selectedSponsor.name : sponsorSearch}
                    onChange={(e) => {
                      if (selectedSponsor) {
                        setSelectedSponsor(null);
                        field.onChange('');
                      }
                      setSponsorSearch(e.target.value);
                      if (!isReadonly) setSponsorDropdownOpen(true);
                    }}
                    onFocus={() => {
                      if (!isReadonly) setSponsorDropdownOpen(true);
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
                      className="text-muted absolute inset-y-0 right-0 flex w-10 items-center justify-center transition-colors hover:text-white"
                      aria-label="Clear Sponsor"
                    >
                      <CloseIcon />
                    </button>
                  )}
                  {showSponsorDropdown && (
                    <div className="bg-surface absolute top-full right-0 left-0 z-10 mt-1 max-h-60 overflow-auto rounded-[6px] border border-[#141412] shadow-lg">
                      {debouncedSponsorSearch.length < MIN_SEARCH_LENGTH ? (
                        <p className="text-muted px-3 py-4 text-center text-[13px]">
                          Type at least {MIN_SEARCH_LENGTH} characters to search
                        </p>
                      ) : isSearchingSponsors ? (
                        <p className="text-muted px-3 py-4 text-center text-[13px]">Searching…</p>
                      ) : sponsorsList.length === 0 ? (
                        <p className="text-muted px-3 py-4 text-center text-[13px]">No users found</p>
                      ) : (
                        <ul>
                          {sponsorsList.map((s) => (
                            <li key={s.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(String(s.id));
                                  setSelectedSponsor({ id: s.id, name: s.name ?? '' });
                                  setSponsorSearch('');
                                  setSponsorDropdownOpen(false);
                                }}
                                className="flex w-full cursor-pointer items-center rounded-sm px-3 py-2.5 text-left text-base text-white transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none"
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
              )}
            />
          </FormField>

          {/* Country & City */}
          <CountryCityFields
            country={country ?? ''}
            city={city ?? ''}
            onCountryChange={(v) => setValue('country', v, { shouldValidate: true })}
            onCityChange={(v) => setValue('city', v, { shouldValidate: true })}
            countryError={errors.country?.message}
            cityError={errors.city?.message}
            required
            readOnly={isReadonly}
          />

          {/* Icon Players */}
          <FormField label="Icon Players" htmlFor="manage-icon-players">
            <Controller
              name="icon_player_ids"
              control={control}
              render={({ field }) => {
                const displayNames = (field.value ?? [])
                  .map((id) => iconPlayerIdToName[id])
                  .filter(Boolean)
                  .join(', ');
                const inputDisplay = iconPlayerPanelOpen ? iconPlayerSearch : displayNames;

                return (
                  <div className="space-y-2">
                    <div ref={iconPlayersFieldRef} className="relative">
                      <Input
                        id="manage-icon-players"
                        role="combobox"
                        placeholder="Search by name, nickname or phone…"
                        autoComplete="off"
                        aria-autocomplete="list"
                        aria-expanded={iconPlayerPanelOpen}
                        readOnly={isReadonly}
                        value={inputDisplay}
                        onChange={(e) => {
                          if (!isReadonly) setIconPlayerSearch(e.target.value);
                        }}
                        onFocus={() => {
                          if (!isReadonly) {
                            setIconPlayerSearch('');
                            setIconPlayerPanelOpen(true);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape' && iconPlayerPanelOpen) {
                            e.stopPropagation();
                            closeIconPlayerPanel();
                          }
                        }}
                        className={field.value?.length > 0 && !isReadonly ? 'pr-12' : isReadonly ? readonlyClass : ''}
                      />
                      {field.value?.length > 0 && !isReadonly && (
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange([]);
                            setIconPlayerIdToName({});
                            closeIconPlayerPanel();
                          }}
                          className="text-muted absolute inset-y-0 right-0 flex w-10 items-center justify-center transition-colors hover:text-white"
                          aria-label="Clear Icon Players"
                        >
                          <CloseIcon />
                        </button>
                      )}
                      {iconPlayerPanelOpen && !isReadonly && (
                        <div className="bg-surface absolute top-full right-0 left-0 z-10 mt-1 max-h-60 overflow-auto rounded-[6px] border border-[#141412] shadow-lg">
                          {iconPlayerSearch.trim().length === 0 ? (
                            <p className="text-muted px-3 py-4 text-center text-[13px]">Type to search players…</p>
                          ) : debouncedIconPlayerSearch.length < MIN_SEARCH_LENGTH ? (
                            <p className="text-muted px-3 py-4 text-center text-[13px]">
                              Type at least {MIN_SEARCH_LENGTH} characters
                            </p>
                          ) : isSearchingPlayers ? (
                            <p className="text-muted px-3 py-4 text-center text-[13px]">Searching…</p>
                          ) : playersList.length === 0 ? (
                            <p className="text-muted px-3 py-4 text-center text-[13px]">No players found</p>
                          ) : (
                            <div>
                              {playersList.map((player) => {
                                const isSelected = field.value?.includes(player.id);
                                return (
                                  <div
                                    key={player.id}
                                    role="option"
                                    aria-selected={Boolean(isSelected)}
                                    className="rounded-sm hover:bg-white/10"
                                  >
                                    <label className="flex cursor-pointer items-center gap-3 py-2.5 pr-4 pl-4 text-base text-white">
                                      <Checkbox
                                        checked={Boolean(isSelected)}
                                        onCheckedChange={(checked) => {
                                          const prev = field.value ?? [];
                                          if (checked) {
                                            setIconPlayerIdToName((m) => ({ ...m, [player.id]: playerLineLabel(player) }));
                                            field.onChange(prev.includes(player.id) ? prev : [...prev, player.id]);
                                          } else {
                                            setIconPlayerIdToName((m) => {
                                              const next = { ...m };
                                              delete next[player.id];
                                              return next;
                                            });
                                            field.onChange(prev.filter((id) => id !== player.id));
                                          }
                                          closeIconPlayerPanel();
                                        }}
                                      />
                                      <span className="truncate">{playerLineLabel(player)}</span>
                                      {(player.playing_role ?? player.playing_role_enum) && (
                                        <span className="text-muted ml-auto shrink-0 text-[12px]">
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
                    {(field.value?.length ?? 0) > 0 && (
                      <p className="text-muted text-[13px]">
                        {field.value.length} player{field.value.length === 1 ? '' : 's'} selected
                      </p>
                    )}
                  </div>
                );
              }}
            />
          </FormField>

          {/* Logo */}
          {!isReadonly ? (
            <FileUploadField
              label={isEdit ? 'Update Logo' : 'Upload Logo'}
              value={logoUpload}
              onChange={setLogoUpload}
              accept="image/jpeg,image/png,image/webp,image/gif"
              acceptLabel="JPG, PNG, WebP"
              maxSizeMb={5}
            />
          ) : selectedTeam?.logo && String(selectedTeam.logo).trim() !== '' ? (
            <FormField label="Logo" htmlFor="team_logo_display">
              <div className="bg-surface flex h-12 items-center rounded-[6px] px-4">
                <span className="text-muted text-[16px] capitalize">Logo uploaded</span>
              </div>
            </FormField>
          ) : null}
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton form="manage-team-form" type="submit" disabled={isSaving}>
        {saveLabel}
      </DialogSaveButton>
    </>
  );
}
