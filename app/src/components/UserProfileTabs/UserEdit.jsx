import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { DEFAULT_COUNTRY } from '@/lib/constants/geo';
import { formatIsoDateForDisplay, toApiDate } from '@/lib/utils/dateUtils';
import { enumNameToValue } from '@/lib/utils/enumUtils';
import { EMPTY_FILE_UPLOAD, fileUploadValueFromUrl } from '@/lib/utils/fileUploadUtils';
import { updateProfileSchema, userEditFormSchema } from '@/lib/validations/auth';
import { useGetMeQuery, useUpdateProfileMutation } from '@/store/api/authApi';
import { usePlayerProfileEnums } from '@/store/api/enumApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { updateUser } from '@/store/slices/authSlice';
import { Button } from '@/ui/Button';
import { CountryCityFields } from '@/ui/CountryCityFields';
import { DatePicker } from '@/ui/DatePicker';
import { FileUploadField } from '@/ui/FileUploadField';
import { FormActions } from '@/ui/form/FormActions';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import {
  Select,
  SelectContent,
  selectContentInputClass,
  SelectItem,
  selectItemIndicatorInputClass,
  selectItemInputClass,
  selectItemTextInputClass,
  SelectTrigger,
  selectTriggerInputClass,
  SelectValue,
  selectViewportInputClass,
} from '@/ui/Select';

const NICKNAME_MAX = 50;

/** Sentinel for "Not set" in profile Selects (Radix needs a non-empty value). */
const PROFILE_FIELD_NONE = '__none__';

const DEFAULT_VALUES = {
  name: '',
  country: DEFAULT_COUNTRY,
  city: '',
  nickname: '',
  dateOfBirth: '',
  battingStyle: '',
  bowlingStyle: '',
  playingRole: '',
  email: '',
};

function ProfileEnumSelect({ label, htmlFor, value, onChange, options }) {
  return (
    <FormField label={label} htmlFor={htmlFor}>
      <Select value={value || PROFILE_FIELD_NONE} onValueChange={(v) => onChange(v === PROFILE_FIELD_NONE ? '' : v)}>
        <SelectTrigger id={htmlFor} className={selectTriggerInputClass}>
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent className={selectContentInputClass} viewportClassName={selectViewportInputClass}>
          <SelectItem
            value={PROFILE_FIELD_NONE}
            className={selectItemInputClass}
            textClassName={selectItemTextInputClass}
            indicatorClassName={selectItemIndicatorInputClass}
          >
            Not Set
          </SelectItem>
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className={selectItemInputClass}
              textClassName={selectItemTextInputClass}
              indicatorClassName={selectItemIndicatorInputClass}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

/**
 * Inline edit-profile form for `/profile` (no dialog).
 */
export function UserEdit() {
  const dispatch = useAppDispatch();
  const userFromStore = useAppSelector(selectUser);
  const { data: meData } = useGetMeQuery(undefined, { skip: !userFromStore?.id });
  const user = meData?.data ?? userFromStore ?? null;
  const { battingStyleOptions, bowlingStyleOptions, playingRoleOptions } = usePlayerProfileEnums();
  const toast = useToast();
  const [avatarUpload, setAvatarUpload] = useState(EMPTY_FILE_UPLOAD);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const country = watch('country');
  const city = watch('city');

  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  useEffect(() => {
    if (!user?.id) return;

    const countryFromProfile = user.country && String(user.country).trim();

    reset({
      name: user.name ?? '',
      country: countryFromProfile || DEFAULT_COUNTRY,
      city: user.city ?? '',
      nickname: user.nickname ?? '',
      dateOfBirth: formatIsoDateForDisplay(user.date_of_birth),
      battingStyle: '',
      bowlingStyle: '',
      playingRole: '',
      email: user.email ?? '',
    });
    setAvatarUpload(fileUploadValueFromUrl(user.avatar_url));
    // Hydrate once per user id so later /me or store updates do not wipe in-progress edits.
  }, [user?.id, reset]);

  useEffect(() => {
    if (!user?.id) return;

    const batting = enumNameToValue(user.batting_style_enum) || user.batting_style;
    const bowling = enumNameToValue(user.bowling_style_enum) || user.bowling_style;
    const playing = enumNameToValue(user.playing_role_enum);

    setValue('battingStyle', batting && battingStyleOptions.some((o) => o.value === batting) ? batting : '', {
      shouldValidate: false,
    });
    setValue('bowlingStyle', bowling && bowlingStyleOptions.some((o) => o.value === bowling) ? bowling : '', {
      shouldValidate: false,
    });
    setValue('playingRole', playing && playingRoleOptions.some((o) => o.value === playing) ? playing : '', {
      shouldValidate: false,
    });
  }, [user?.id, battingStyleOptions, bowlingStyleOptions, playingRoleOptions, setValue]);

  const onSubmit = async (data) => {
    const parsed = updateProfileSchema.safeParse({
      name: data.name.trim() || undefined,
      nickname: data.nickname.trim(),
      email: data.email.trim() || undefined,
      date_of_birth: toApiDate(data.dateOfBirth) || undefined,
      bowling_style: data.bowlingStyle || null,
      batting_style: data.battingStyle || null,
      playing_role: data.playingRole || null,
      country: data.country.trim() || undefined,
      city: data.city.trim() || undefined,
    });

    if (!parsed.success) return;

    const toSend = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined && v !== ''));

    const avatarFile = avatarUpload.files[0];
    if (avatarFile instanceof File) {
      toSend.avatar = avatarFile;
    } else if (user?.avatar_url && avatarUpload.existingUrls.length === 0) {
      toSend.avatar = null;
    }

    try {
      const result = await updateProfile(toSend).unwrap();
      const updatedUser = result?.data ?? result;
      if (updatedUser && typeof updatedUser === 'object') {
        dispatch(updateUser(updatedUser));
      }
      setAvatarUpload(fileUploadValueFromUrl(updatedUser?.avatar_url));
      toast.success('Profile saved');
    } catch (err) {
      const apiErrors = err?.data?.errors;
      const nicknameMsg = Array.isArray(apiErrors?.nickname) ? apiErrors.nickname[0] : null;
      const dobMsg = Array.isArray(apiErrors?.date_of_birth) ? apiErrors.date_of_birth[0] : null;
      if (nicknameMsg) {
        setError('nickname', { message: nicknameMsg });
        return;
      }
      if (dobMsg) {
        setError('dateOfBirth', { message: dobMsg });
        return;
      }
      toast.error(getApiErrorMessage(err, 'Failed to save profile.'));
    }
  };

  return (
    <FormStack as="form" density="default" onSubmit={handleSubmit(onSubmit)} aria-label="Edit profile">
      <div className="flex flex-col items-center gap-2">
        <FileUploadField
          variant="avatar"
          value={avatarUpload}
          onChange={setAvatarUpload}
          accept="image/jpeg,image/png,image/webp"
          acceptLabel="JPG, PNG, WebP"
          maxSizeMb={5}
          avatarSize={96}
        />
        <p className="text-muted/80 max-w-[280px] text-center text-[12px] leading-snug">JPG, PNG or WebP, max 5 MB.</p>
      </div>

      <FormField label="Name" htmlFor="name">
        <Input id="name" type="text" placeholder="Full Name" error={errors.name?.message} {...register('name')} />
      </FormField>

      <FormField label="Nickname" htmlFor="nickname">
        <Input
          id="nickname"
          type="text"
          placeholder="Letters, Numbers, Underscores Only"
          maxLength={NICKNAME_MAX}
          error={errors.nickname?.message}
          {...register('nickname')}
        />
      </FormField>

      <FormField label="Email" htmlFor="email">
        <Input id="email" type="email" placeholder="Enter Email" error={errors.email?.message} {...register('email')} />
      </FormField>

      <FormField label="Date of Birth" htmlFor="dob">
        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field }) => (
            <DatePicker
              id="dob"
              placeholder="MM-DD-YYYY"
              value={field.value}
              onChange={field.onChange}
              error={errors.dateOfBirth?.message}
            />
          )}
        />
      </FormField>

      <Controller
        name="playingRole"
        control={control}
        render={({ field }) => (
          <ProfileEnumSelect
            htmlFor="playing-role"
            label="Playing Role"
            value={field.value}
            onChange={field.onChange}
            options={playingRoleOptions}
          />
        )}
      />

      <Controller
        name="battingStyle"
        control={control}
        render={({ field }) => (
          <ProfileEnumSelect
            htmlFor="batting-style"
            label="Batting Style"
            value={field.value}
            onChange={field.onChange}
            options={battingStyleOptions}
          />
        )}
      />

      <Controller
        name="bowlingStyle"
        control={control}
        render={({ field }) => (
          <ProfileEnumSelect
            htmlFor="bowling-style"
            label="Bowling Style"
            value={field.value}
            onChange={field.onChange}
            options={bowlingStyleOptions}
          />
        )}
      />

      <CountryCityFields
        country={country ?? ''}
        city={city ?? ''}
        onCountryChange={(v) => setValue('country', v, { shouldValidate: true })}
        onCityChange={(v) => setValue('city', v, { shouldValidate: true })}
        enabled
        layout="row"
      />

      <FormActions align="end">
        <Button type="submit" variant="orange" size="dialog" className="sm:w-[180px]" disabled={isSaving} loading={isSaving}>
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </FormActions>
    </FormStack>
  );
}
