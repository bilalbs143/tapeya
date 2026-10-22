import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useUpdateProfileMutation } from '@/features/auth';

import type { UserSummary } from '@/entities/user';
import { userHandle } from '@/entities/user';

import { usePlayerProfileEnums } from '@/shared/api/enumsApi';
import { getApiErrorMessage, parseApiError } from '@/shared/api/errors';
import { cdnUrl } from '@/shared/lib/cdn';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { Chip } from '@/shared/ui/Chip';
import { CountryCityFields } from '@/shared/ui/CountryCityFields';
import { DatePicker } from '@/shared/ui/DatePicker';
import { Field } from '@/shared/ui/Field';
import { Form, FormSection } from '@/shared/ui/Form';
import { ChevronRightIcon } from '@/shared/ui/icons';
import { Input } from '@/shared/ui/Input';
import { SelectField, SelectItem } from '@/shared/ui/Select';
import { ErrorState, Skeleton } from '@/shared/ui/states';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';
import { toast } from '@/shared/ui/toast';

import {
  editProfileFormSchema,
  type EditProfileFormValues,
  enumToSelectValue,
  PROFILE_FIELD_NONE,
  PROFILE_STRENGTH_TOTAL,
  profileGaps,
  toUpdateProfileWire,
} from '../model/schemas';

type EditProfileFormProps = {
  user: UserSummary;
  onSaved?: (() => void) | undefined;
  onUnsavedCount?: ((count: number) => void) | undefined;
  onDelete?: (() => void) | undefined;
  deleting?: boolean | undefined;
};

const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp';
/** Decorative cover — not editable in this form. */

const PROFILE_COVER_URL = cdnUrl('app/images/standard/profile-header.jpg');

export function EditProfileForm({ user, onSaved, onUnsavedCount, onDelete, deleting }: EditProfileFormProps) {
  const photoInput = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl);
  const [clearedAvatar, setClearedAvatar] = useState(false);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const {
    playingRoleOptions,
    battingStyleOptions,
    bowlingStyleOptions,
    isLoading: enumsLoading,
    isError: enumsError,
    refetch: refetchEnums,
  } = usePlayerProfileEnums();

  const defaults = useMemo<EditProfileFormValues>(
    () => ({
      name: user.name ?? '',
      nickname: user.nickname ?? '',
      email: user.email ?? '',
      dateOfBirth: user.dateOfBirth ?? '',
      playingRole: enumToSelectValue(user.playingRoleEnum, user.playingRole, playingRoleOptions),
      battingStyle: enumToSelectValue(user.battingStyleEnum, user.battingStyle, battingStyleOptions),
      bowlingStyle: enumToSelectValue(user.bowlingStyleEnum, user.bowlingStyle, bowlingStyleOptions),
      country: user.country ?? '',
      city: user.city ?? '',
    }),
    [user, playingRoleOptions, battingStyleOptions, bowlingStyleOptions]
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileFormSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const watched = useWatch({ control }) as EditProfileFormValues | undefined;
  const formValues = watched ?? defaults;
  const hasAvatar = Boolean(avatarPreview) && !clearedAvatar;
  const gaps = profileGaps(formValues, hasAvatar);
  const done = PROFILE_STRENGTH_TOTAL - gaps.length;
  const strength = Math.round((done / PROFILE_STRENGTH_TOTAL) * 100);
  const handleHint = userHandle({
    nickname: formValues.nickname,
    name: formValues.name,
  });
  const avatarDirty = Boolean(avatarFile) || clearedAvatar;
  const unsaved = Object.keys(dirtyFields).length + (avatarDirty ? 1 : 0);

  useEffect(() => {
    onUnsavedCount?.(unsaved);
  }, [onUnsavedCount, unsaved]);

  function pickFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!AVATAR_ACCEPT.split(',').includes(file.type)) {
      toast({ title: 'Image Not Added', description: 'Use JPG, PNG or WebP.', tone: 'error' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image Not Added', description: 'Max size is 5 MB.', tone: 'error' });
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return url;
    });
    setAvatarFile(file);
    setClearedAvatar(false);
  }

  function clearPhoto() {
    setAvatarPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
    setAvatarFile(null);
    setClearedAvatar(Boolean(user.avatarUrl));
  }

  function discard() {
    reset(defaults);
    setAvatarFile(null);
    setClearedAvatar(false);
    setAvatarPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return user.avatarUrl;
    });
  }

  function jumpTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function onSubmit(values: EditProfileFormValues) {
    const body = toUpdateProfileWire(values);
    if (avatarFile) body.avatar = avatarFile;
    else if (clearedAvatar) body.avatar = null;

    try {
      await updateProfile(body).unwrap();
      toast({ title: 'Profile Saved', tone: 'success' });
      onSaved?.();
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.type === 'validation') {
        const nick = parsed.fields.nickname?.[0];
        const dob = parsed.fields.date_of_birth?.[0];
        if (nick) {
          setError('nickname', { message: nick });
          return;
        }
        if (dob) {
          setError('dateOfBirth', { message: dob });
          return;
        }
      }
      toast({ title: getApiErrorMessage(err, 'Failed to save profile.'), tone: 'error' });
    }
  }

  const left = gaps.length;

  return (
    <>
      <Form
        id="edit-profile-form"
        density="default"
        onSubmit={handleSubmit(onSubmit)}
        className="pb-4"
        noValidate
        aria-label="Edit Profile"
      >
        <div className="relative">
          <div className="relative h-28 overflow-hidden" role="img" aria-label="Cover Photo">
            <img
              src={PROFILE_COVER_URL}
              alt=""
              className="absolute inset-0 size-full object-cover"
              style={{ objectPosition: 'center 32%' }}
            />
            <div
              className="from-surface absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
              aria-hidden
            />
          </div>
          {/* z-10: iOS paints the cover stacking context over -mt overlap otherwise */}
          <div id="profile-photo" className="relative z-10 -mt-11 flex items-end gap-3 px-4">
            <button
              type="button"
              onClick={() => photoInput.current?.click()}
              className="ring-surface relative shrink-0 rounded-full ring-4"
              aria-label="Change Photo"
            >
              <Avatar src={avatarPreview ?? undefined} name={formValues.name || handleHint} size="xl" />
            </button>
            <div className="min-w-0 flex-1 pb-1">
              <p className="truncate text-sm font-extrabold text-ink">{formValues.name.trim() || 'Your name'}</p>
              <p className="font-mono text-muted mt-0.5 text-2xs">@{handleHint} · JPG, PNG or WebP · max 5 MB</p>
              {hasAvatar ? (
                <button type="button" onClick={clearPhoto} className="text-muted mt-1 text-2xs font-semibold">
                  Remove Photo
                </button>
              ) : null}
            </div>
            <input ref={photoInput} type="file" accept={AVATAR_ACCEPT} onChange={pickFile} className="hidden" />
          </div>
        </div>

        <div className="flex flex-col gap-6 px-4">
          <section className="border-border-subtle bg-surface rounded-card border p-3.5" aria-label="Profile Strength">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <span className="font-mono text-muted text-4xs font-bold tracking-eyebrow uppercase">
                Profile Strength
              </span>
              <span className="text-brand-text font-mono text-sm font-extrabold tabular-nums">{strength}%</span>
            </div>
            <div
              className="bg-surface-raised h-1.5 overflow-hidden rounded-full"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={strength}
              aria-label="Profile Strength"
            >
              <div className="bg-brand h-full rounded-full" style={{ width: `${strength}%` }} />
            </div>
            <p className="text-muted mt-2.5 text-2xs leading-relaxed">
              <span className="text-positive font-semibold">
                {done} of {PROFILE_STRENGTH_TOTAL} done.
              </span>{' '}
              {left === 0
                ? 'Your profile is complete.'
                : `${left} ${left === 1 ? 'step' : 'steps'} left — complete profiles get picked for teams 4× more often.`}
            </p>
            {gaps.length > 0 ? (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {gaps.map((gap) => (
                  <Chip key={gap.id} size="sm" onClick={() => jumpTo(gap.id)}>
                    {gap.label}
                  </Chip>
                ))}
              </div>
            ) : null}
          </section>

          <FormSection title="Identity">
            <div id="profile-name">
              <Input label="Full Name" required error={errors.name?.message} {...register('name')} />
            </div>
            <div id="profile-nickname">
              <Input
                label="Nickname"
                required
                error={errors.nickname?.message}
                hint={errors.nickname ? undefined : 'Shown on scorecards and commentary.'}
                maxLength={50}
                {...register('nickname')}
              />
            </div>
            <div id="profile-email">
              <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            </div>
            <div id="profile-dob">
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Date of Birth"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.dateOfBirth?.message}
                    hint={errors.dateOfBirth ? undefined : 'Used for age-group eligibility only.'}
                    placeholder="Select Date"
                  />
                )}
              />
            </div>
            {user.phone ? (
              <p className="text-muted text-2xs">
                Phone <span className="font-mono text-ink">{user.phone}</span> · locked
              </p>
            ) : null}
          </FormSection>

          <FormSection title="Cricket Profile">
            {enumsError ? (
              <ErrorState
                title="Couldn’t Load Cricket Options"
                description="Playing Role and style lists come from the server."
                onRetry={() => void refetchEnums()}
              />
            ) : null}
            {enumsLoading && playingRoleOptions.length === 0 ? (
              <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading Cricket Options">
                <Skeleton className="h-10 w-full rounded-panel" />
                <Skeleton className="h-10 w-full rounded-panel" />
                <Skeleton className="h-12 w-full rounded-panel" />
              </div>
            ) : (
              <>
                <Controller
                  name="playingRole"
                  control={control}
                  render={({ field }) => (
                    <ChipField
                      id="profile-playing-role"
                      label="Playing Role"
                      hint="Drives which stats appear on your profile."
                      value={field.value}
                      options={playingRoleOptions}
                      disabled={enumsLoading}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  name="battingStyle"
                  control={control}
                  render={({ field }) => (
                    <ChipField
                      id="profile-batting"
                      label="Batting Style"
                      value={field.value}
                      options={battingStyleOptions}
                      disabled={enumsLoading}
                      onChange={field.onChange}
                    />
                  )}
                />
                <div id="profile-bowling">
                  <Controller
                    name="bowlingStyle"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        label="Bowling Style"
                        value={field.value || PROFILE_FIELD_NONE}
                        onValueChange={field.onChange}
                        error={errors.bowlingStyle?.message}
                        disabled={enumsLoading || bowlingStyleOptions.length === 0}
                      >
                        <SelectItem value={PROFILE_FIELD_NONE}>Not Set</SelectItem>
                        {bowlingStyleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectField>
                    )}
                  />
                </div>
              </>
            )}
          </FormSection>

          <FormSection title="Location" description="City unlocks nearby matches and local rankings.">
            <div id="profile-country">
              <CountryCityFields
                country={formValues.country}
                city={formValues.city}
                onCountryChange={(country) => setValue('country', country, { shouldDirty: true })}
                onCityChange={(city) => setValue('city', city, { shouldDirty: true })}
                countryError={errors.country?.message}
                cityError={errors.city?.message}
                layout="row"
              />
            </div>
          </FormSection>

          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="flex min-h-11 w-full items-center gap-3 text-left disabled:opacity-40"
            >
              <span className="text-danger min-w-0 flex-1 text-sm font-semibold">Delete Account</span>
              <span className="text-muted text-2xs">{deleting ? 'Deleting…' : 'Permanent'}</span>
              <ChevronRightIcon size="sm" className="text-muted shrink-0" aria-hidden />
            </button>
          ) : null}
        </div>
      </Form>

      <StickyActionBar>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="min-h-12 shrink-0 px-4 font-bold"
            disabled={unsaved === 0 || isLoading}
            onClick={discard}
          >
            Discard
          </Button>
          <Button type="submit" form="edit-profile-form" className="min-h-12 flex-1 font-bold" loading={isLoading}>
            Save Changes
          </Button>
        </div>
      </StickyActionBar>
    </>
  );
}

function ChipField({
  id,
  label,
  hint,
  value,
  options,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string | undefined;
  value: string;
  options: readonly { value: string; label: string }[];
  disabled?: boolean | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <Field id={id} label={label} hint={hint}>
      {() => (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label} aria-disabled={disabled}>
          {options.map((option) => {
            const selected = value === option.value;
            return (
              <Chip
                key={option.value}
                role="radio"
                aria-checked={selected}
                selected={selected}
                disabled={disabled}
                onClick={() => {
                  if (disabled) return;
                  onChange(selected ? PROFILE_FIELD_NONE : option.value);
                }}
              >
                {option.label}
              </Chip>
            );
          })}
        </div>
      )}
    </Field>
  );
}
