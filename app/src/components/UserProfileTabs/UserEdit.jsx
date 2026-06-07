import { useEffect, useState } from 'react';

import { BaseDialog } from '@/components/dialogs/BaseDialog';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { DEFAULT_COUNTRY } from '@/lib/constants/geo';
import { enumNameToValue } from '@/lib/utils/enumUtils';
import { EMPTY_FILE_UPLOAD, fileUploadValueFromUrl } from '@/lib/utils/fileUploadUtils';
import { updateProfileSchema } from '@/lib/validations/auth';
import { useGetMeQuery, useUpdateProfileMutation } from '@/store/api/authApi';
import { usePlayerProfileEnums } from '@/store/api/enumApi';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { CountryCityFields } from '@/ui/CountryCityFields';
import { DatePicker } from '@/ui/DatePicker';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FileUploadField } from '@/ui/FileUploadField';
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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NICKNAME_MAX = 50;

/**
 * Sentinel for "Not set" in profile Selects (Radix needs a non-empty value).
 * Maps to '' in state and null in the API, same pattern as playing role.
 */
const PROFILE_FIELD_NONE = '__none__';

const DEFAULT_FIELDS = {
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UserEdit({ open, onOpenChange }) {
  const dispatch = useAppDispatch();
  const { data: meData } = useGetMeQuery(undefined, { skip: !open });
  const user = meData?.data ?? null;
  const { battingStyleOptions, bowlingStyleOptions, playingRoleOptions } = usePlayerProfileEnums();
  const toast = useToast();
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [nicknameError, setNicknameError] = useState('');
  const [avatarUpload, setAvatarUpload] = useState(EMPTY_FILE_UPLOAD);

  const setField = (key) => (value) => setFields((prev) => ({ ...prev, [key]: value }));

  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  // Pre-fill fields when the dialog opens.
  useEffect(() => {
    if (!open || !user) return;
    const batting = enumNameToValue(user.batting_style_enum) || user.batting_style;
    const bowling = enumNameToValue(user.bowling_style_enum) || user.bowling_style;
    const playing = enumNameToValue(user.playing_role_enum);
    const countryFromProfile = user.country && String(user.country).trim();
    setFields({
      name: user.name ?? '',
      country: countryFromProfile || DEFAULT_COUNTRY,
      city: user.city ?? '',
      nickname: user.nickname ?? '',
      dateOfBirth: user.date_of_birth ?? '',
      battingStyle: batting && battingStyleOptions.some((o) => o.value === batting) ? batting : '',
      bowlingStyle: bowling && bowlingStyleOptions.some((o) => o.value === bowling) ? bowling : '',
      playingRole: playing && playingRoleOptions.some((o) => o.value === playing) ? playing : '',
      email: user.email ?? '',
    });
    setNicknameError('');
    setAvatarUpload(fileUploadValueFromUrl(user.avatar_url));
  }, [open, user, battingStyleOptions, bowlingStyleOptions, playingRoleOptions]);

  // ── Save ────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setNicknameError('');

    const parsed = updateProfileSchema.safeParse({
      name: fields.name.trim() || undefined,
      nickname: fields.nickname.trim(),
      email: fields.email.trim() || undefined,
      date_of_birth: fields.dateOfBirth || undefined,
      bowling_style: fields.bowlingStyle || null,
      batting_style: fields.battingStyle || null,
      playing_role: fields.playingRole || null,
      country: fields.country.trim() || undefined,
      city: fields.city.trim() || undefined,
    });

    if (!parsed.success) {
      const nicknameIssue = parsed.error.issues.find((i) => i.path.includes('nickname'));
      if (nicknameIssue?.message) setNicknameError(nicknameIssue.message);
      return;
    }

    // Strip undefined and empty strings. Explicit nulls (role / styles) pass through.
    const toSend = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined && v !== ''));

    // Avatar: File → multipart POST; null → JSON PATCH with avatar: null; omit → unchanged.
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
      onOpenChange?.(false);
    } catch (err) {
      const errors = err?.data?.errors;
      const nicknameMsg = Array.isArray(errors?.nickname) ? errors.nickname[0] : null;
      if (nicknameMsg) {
        setNicknameError(nicknameMsg);
        return;
      }
      toast.error(getApiErrorMessage(err, 'Failed to save profile.'));
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange} height="!h-[min(90vh,600px)]">
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>EDIT PROFILE</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <div className="flex flex-col gap-4">
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
            <p className="max-w-[280px] text-center text-[12px] leading-snug text-[#A2A6AB]/80">
              JPG, PNG or WebP, max 5 MB.
            </p>
          </div>

          <FormField label="Name" htmlFor="name">
            <Input
              id="name"
              type="text"
              placeholder="Full Name"
              value={fields.name}
              onChange={(e) => setField('name')(e.target.value)}
              className="max-w-none"
            />
          </FormField>

          <FormField label="Nickname" htmlFor="nickname">
            <Input
              id="nickname"
              type="text"
              placeholder="Letters, Numbers, Underscores Only"
              value={fields.nickname}
              onChange={(e) => {
                setField('nickname')(e.target.value);
                setNicknameError('');
              }}
              className="max-w-none"
              maxLength={NICKNAME_MAX}
              error={nicknameError || undefined}
            />
          </FormField>

          <FormField label="Date Of Birth" htmlFor="dob">
            <DatePicker
              id="dob"
              placeholder="MM-DD-YYYY"
              value={fields.dateOfBirth}
              onChange={setField('dateOfBirth')}
              className="max-w-none"
            />
          </FormField>

          <FormField label="Playing Role" htmlFor="playing-role">
            <Select
              value={fields.playingRole || PROFILE_FIELD_NONE}
              onValueChange={(v) => setField('playingRole')(v === PROFILE_FIELD_NONE ? '' : v)}
            >
              <SelectTrigger id="playing-role" className={`max-w-none ${selectTriggerInputClass}`}>
                <SelectValue placeholder="Select Playing Role" />
              </SelectTrigger>
              <SelectContent className={`z-[100] ${selectContentInputClass}`} viewportClassName={selectViewportInputClass}>
                <SelectItem
                  value={PROFILE_FIELD_NONE}
                  className={selectItemInputClass}
                  textClassName={selectItemTextInputClass}
                  indicatorClassName={selectItemIndicatorInputClass}
                >
                  Not Set
                </SelectItem>
                {playingRoleOptions.map((opt) => (
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

          <FormField label="Batting Style" htmlFor="batting-style">
            <Select
              value={fields.battingStyle || PROFILE_FIELD_NONE}
              onValueChange={(v) => setField('battingStyle')(v === PROFILE_FIELD_NONE ? '' : v)}
            >
              <SelectTrigger id="batting-style" className={`max-w-none ${selectTriggerInputClass}`}>
                <SelectValue placeholder="Select Batting Style" />
              </SelectTrigger>
              <SelectContent className={`z-[100] ${selectContentInputClass}`} viewportClassName={selectViewportInputClass}>
                <SelectItem
                  value={PROFILE_FIELD_NONE}
                  className={selectItemInputClass}
                  textClassName={selectItemTextInputClass}
                  indicatorClassName={selectItemIndicatorInputClass}
                >
                  Not Set
                </SelectItem>
                {battingStyleOptions.map((opt) => (
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

          <FormField label="Bowling Style" htmlFor="bowling-style">
            <Select
              value={fields.bowlingStyle || PROFILE_FIELD_NONE}
              onValueChange={(v) => setField('bowlingStyle')(v === PROFILE_FIELD_NONE ? '' : v)}
            >
              <SelectTrigger id="bowling-style" className={`max-w-none ${selectTriggerInputClass}`}>
                <SelectValue placeholder="Select Bowling Style" />
              </SelectTrigger>
              <SelectContent className={`z-[100] ${selectContentInputClass}`} viewportClassName={selectViewportInputClass}>
                <SelectItem
                  value={PROFILE_FIELD_NONE}
                  className={selectItemInputClass}
                  textClassName={selectItemTextInputClass}
                  indicatorClassName={selectItemIndicatorInputClass}
                >
                  Not Set
                </SelectItem>
                {bowlingStyleOptions.map((opt) => (
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

          <FormField label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              placeholder="Enter Email"
              value={fields.email}
              onChange={(e) => setField('email')(e.target.value)}
              className="max-w-none"
            />
          </FormField>

          <CountryCityFields
            country={fields.country}
            city={fields.city}
            onCountryChange={setField('country')}
            onCityChange={setField('city')}
            enabled={open}
          />
        </div>
      </DialogScrollBody>

      <DialogSaveButton onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving…' : 'Save'}
      </DialogSaveButton>
    </BaseDialog>
  );
}
