import { useEffect, useMemo, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useDialog } from '@/context/DialogContext';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { DEFAULT_COUNTRY } from '@/lib/constants/geo';
import { MIN_SEARCH_LENGTH } from '@/lib/constants/search';
import { EMPTY_FILE_UPLOAD, fileUploadValueFromUrl } from '@/lib/utils/fileUploadUtils';
import { canAddTournamentTeams, getTournamentNumberOfGroups, mergeTournamentMeta } from '@/lib/utils/tournamentUtils';
import { teamFormSchema } from '@/lib/validations/team';
import { uploadMediaFile, useUploadMediaMutation } from '@/store/api/mediaApi';
import { useCreateTeamMutation, useSearchTeamsQuery, useUpdateTeamMutation } from '@/store/api/teamApi';
import { useAttachTeamsToTournamentMutation, useGetTournamentQuery, useGetTournamentTeamsQuery } from '@/store/api/tournamentApi';
import { CountryCityFields } from '@/ui/CountryCityFields';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FileUploadField } from '@/ui/FileUploadField';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { CloseIcon } from '@/ui/icons/CloseIcon';
import { Input } from '@/ui/Input';
import { LoaderBlock } from '@/ui/Loader';
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
  sponsor: '',
  country: DEFAULT_COUNTRY,
  city: '',
  icon_players: '',
};

/** @param {number|undefined} preferred @param {number} numberOfGroups */
function normalizeGroupIndex(preferred, numberOfGroups) {
  const n = Number(preferred);
  if (Number.isInteger(n) && n >= 1 && n <= numberOfGroups) return n;
  return 1;
}

function asText(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  return '';
}

/**
 * Body-only dialog — rendered by DialogManager inside BaseDialog.
 */
export function ManageTeamDialog({ mode = 'create', team, tournamentId, tournament, preferredGroupIndex, onSuccess }) {
  const isEdit = mode === 'edit';
  const isTournamentCreate = !isEdit && tournamentId != null;
  const { closeDialog } = useDialog();
  const toast = useToast();

  const {
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

  const teamNameFieldRef = useRef(null);
  const [logoUpload, setLogoUpload] = useState(EMPTY_FILE_UPLOAD);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamNameDropdownOpen, setTeamNameDropdownOpen] = useState(isTournamentCreate);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(() => normalizeGroupIndex(preferredGroupIndex, numberOfGroups));

  const isReadonly = isTournamentCreate && !!selectedTeam;
  const readonlyClass = isReadonly ? 'cursor-default opacity-90' : '';

  const showTeamNameDropdown =
    isTournamentCreate && searchQuery.length >= MIN_SEARCH_LENGTH && !selectedTeam && teamNameDropdownOpen;

  useEffect(() => {
    if (isEdit) {
      if (!team) return;
      reset({
        name: team.name ?? '',
        code: team.code ?? '',
        sponsor: asText(team.sponsor),
        country: team.country ?? '',
        city: team.city ?? '',
        icon_players: asText(team.icon_players),
      });
    } else {
      reset(EMPTY_FORM);
      setSelectedTeam(null);
      setTeamNameDropdownOpen(isTournamentCreate);
    }

    setLogoUpload(isEdit && team?.logo ? fileUploadValueFromUrl(team.logo) : EMPTY_FILE_UPLOAD);
  }, [isEdit, team, reset, isTournamentCreate]);

  useEffect(() => {
    if (!isEdit && isTournamentCreate) {
      setSelectedGroupIndex(normalizeGroupIndex(preferredGroupIndex, numberOfGroups));
    }
  }, [isEdit, isTournamentCreate, preferredGroupIndex, numberOfGroups]);

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
    setValue('sponsor', asText(picked.sponsor));
    setValue('icon_players', asText(picked.icon_players));
  };

  const handleChangeTeam = () => {
    setSelectedTeam(null);
    setTeamNameDropdownOpen(true);
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
                      <LoaderBlock label="Searching" size="xs" className="px-4 py-3" />
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
                                {asText(result.sponsor) ? ` · ${asText(result.sponsor)}` : ''}
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

          <FormField label="Sponsor" htmlFor="manage-sponsor">
            <Input
              id="manage-sponsor"
              placeholder="e.g. Pepsi, Jazz, Imad Waseem"
              autoComplete="off"
              maxLength={500}
              error={errors.sponsor?.message}
              readOnly={isReadonly}
              className={readonlyClass}
              {...register('sponsor')}
            />
          </FormField>

          <FormField label="Icon Players" htmlFor="manage-icon-players">
            <Input
              id="manage-icon-players"
              placeholder="e.g. Babar Azam, Shaheen Afridi"
              autoComplete="off"
              maxLength={500}
              error={errors.icon_players?.message}
              readOnly={isReadonly}
              className={readonlyClass}
              {...register('icon_players')}
            />
          </FormField>

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

      <DialogSaveButton form="manage-team-form" type="submit" disabled={isSaving} loading={isSaving}>
        {saveLabel}
      </DialogSaveButton>
    </>
  );
}
