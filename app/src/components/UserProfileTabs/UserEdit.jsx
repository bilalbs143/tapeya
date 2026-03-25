import { useEffect, useRef, useState } from 'react';

import defaultAvatar from '@/assets/images/standard/default-avatar.png';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { enumNameToValue } from '@/lib/utils/enumUtils';
import { updateProfileSchema } from '@/lib/validations/auth';
import { useGetMeQuery, useUpdateProfileMutation } from '@/store/api/authApi';
import { usePlayerProfileEnums } from '@/store/api/enumApi';
import { useGetCitiesQuery, useGetCountriesQuery } from '@/store/api/locationApi';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { DatePicker } from '@/ui/DatePicker';
import {
  Dialog, DialogClose, DialogContentProfile, DialogSaveButton,
  DialogScrollBody, DialogTitle,
} from '@/ui/Dialog';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { PhoneInput } from '@/ui/PhoneInput';
import {
  Select, SelectContent, selectContentInputClass, SelectItem,
  selectItemIndicatorInputClass, selectItemInputClass, selectItemTextInputClass,
  SelectTrigger, selectTriggerInputClass, SelectValue, selectViewportInputClass,
} from '@/ui/Select';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NICKNAME_MAX = 50;
/** Must match the UI copy and backend limit. */
const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Sentinel for the "Not set" option in the playing role Select.
 * Radix requires a non-empty string value; we map '' <-> PLAYING_ROLE_NONE.
 */
const PLAYING_ROLE_NONE = '__none__';

const DEFAULT_FIELDS = {
  name: '', country: '', city: '', nickname: '', phone: '',
  dateOfBirth: '', battingStyle: '', bowlingStyle: '', playingRole: '', email: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UserEdit({ open, onOpenChange }) {
  const dispatch = useAppDispatch();
  const { data: meData } = useGetMeQuery(undefined, { skip: !open });
  const user = meData?.data ?? null;
  const { battingStyleOptions, bowlingStyleOptions, playingRoleOptions } =
    usePlayerProfileEnums();
  const { data: countriesList = [] } = useGetCountriesQuery(undefined, { skip: !open });

  const toast = useToast();
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [nicknameError, setNicknameError] = useState('');

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarRemove, setAvatarRemove] = useState(false);
  const fileInputRef = useRef(null);

  const setField = (key) => (value) => setFields((prev) => ({ ...prev, [key]: value }));

  const countryCode =
    countriesList.find((c) => c.name === fields.country)?.country_code ?? null;
  const { data: citiesList = [] } = useGetCitiesQuery(countryCode, {
    skip: !open || !countryCode,
  });

  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  // Pre-fill fields when the dialog opens.
  useEffect(() => {
    if (!open || !user) return;
    const batting = enumNameToValue(user.batting_style_enum) || user.batting_style;
    const bowling = enumNameToValue(user.bowling_style_enum) || user.bowling_style;
    const playing = enumNameToValue(user.playing_role_enum);
    setFields({
      name: user.name ?? '',
      country: user.country ?? '',
      city: user.city ?? '',
      nickname: user.nickname ?? '',
      phone: user.phone ?? '',
      dateOfBirth: user.date_of_birth ?? '',
      battingStyle: battingStyleOptions.some((o) => o.value === batting)
        ? batting : (battingStyleOptions[0]?.value ?? ''),
      bowlingStyle: bowlingStyleOptions.some((o) => o.value === bowling)
        ? bowling : (bowlingStyleOptions[0]?.value ?? ''),
      playingRole: playing && playingRoleOptions.some((o) => o.value === playing)
        ? playing : '',
      email: user.email ?? '',
    });
    setNicknameError('');
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarRemove(false);
  }, [open, user, battingStyleOptions, bowlingStyleOptions, playingRoleOptions]);

  // Revoke blob URL on change / unmount to prevent memory leaks.
  useEffect(() => {
    return () => { if (avatarPreview) URL.revokeObjectURL(avatarPreview); };
  }, [avatarPreview]);

  // ── Avatar handlers ──────────────────────────────────────────────────────

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file (e.g. JPG, PNG).');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error('Image must be smaller than 5MB.');
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarRemove(false);
  };

  const clearAvatarSelection = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarRemove(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAvatar = () => {
    clearAvatarSelection();
    setAvatarRemove(true);
  };

  // ── Save ────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setNicknameError('');

    const parsed = updateProfileSchema.safeParse({
      name: fields.name.trim() || undefined,
      nickname: fields.nickname.trim(),
      email: fields.email.trim() || undefined,
      phone: fields.phone.trim() || undefined,
      date_of_birth: fields.dateOfBirth || undefined,
      bowling_style: fields.bowlingStyle || undefined,
      batting_style: fields.battingStyle || undefined,
      playing_role: fields.playingRole || null,
      country: fields.country.trim() || undefined,
      city: fields.city.trim() || undefined,
    });

    if (!parsed.success) {
      const nicknameIssue = parsed.error.issues.find((i) =>
        i.path.includes('nickname'),
      );
      if (nicknameIssue?.message) setNicknameError(nicknameIssue.message);
      return;
    }

    // Strip undefined and empty strings. Explicit nulls (e.g. playing_role) pass through.
    const toSend = Object.fromEntries(
      Object.entries(parsed.data).filter(([, v]) => v !== undefined && v !== ''),
    );

    // Avatar — authApi.buildProfilePayload reads this key to choose encoding:
    //   File → FormData (multipart), null → JSON { avatar: null }, absent → no change
    if (avatarFile instanceof File) {
      toSend.avatar = avatarFile;
    } else if (avatarRemove) {
      toSend.avatar = null;
    }

    try {
      const result = await updateProfile(toSend).unwrap();
      const updatedUser = result?.data ?? result;
      if (updatedUser && typeof updatedUser === 'object') {
        dispatch(updateUser(updatedUser));
      }
      clearAvatarSelection();
      onOpenChange?.(false);
    } catch (err) {
      const errors = err?.data?.errors;
      const nicknameMsg = Array.isArray(errors?.nickname) ? errors.nickname[0] : null;
      if (nicknameMsg) { setNicknameError(nicknameMsg); return; }
      toast.error(getApiErrorMessage(err, 'Failed to save profile.'));
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  const avatarSrc =
    avatarPreview ??
    (avatarRemove ? defaultAvatar : (user?.avatar_url ?? defaultAvatar));

  const avatarDisplayName =
    fields.name?.trim() || user?.name?.trim() || user?.nickname?.trim() || 'Profile';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentProfile className="!h-[min(90vh,600px)]">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center justify-between px-5 py-4">
            <DialogTitle className="text-[16px] font-bold tracking-wide text-[#DA9811] uppercase">
              EDIT PROFILE
            </DialogTitle>
            <DialogClose
              className="rounded p-1 text-white/60 transition-colors hover:text-white focus:ring-2 focus:ring-[#FFB703] focus:outline-none"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" />
              </svg>
            </DialogClose>
          </div>

          <DialogScrollBody>
            <div className="flex flex-col gap-4">

              {/* Avatar picker */}
              <FormField variant="edit">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative inline-block">
                    <ProfileAvatar src={avatarSrc} name={avatarDisplayName} overlap={false} />
                    <input
                      ref={fileInputRef}
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 z-10 cursor-pointer rounded-full opacity-0"
                      onChange={handleAvatarChange}
                      aria-label="Choose profile photo"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <span className="text-[13px] text-white/70">
                      Click the photo to change. JPG or PNG, max 5MB.
                    </span>
                    {avatarFile ? (
                      <button type="button" onClick={clearAvatarSelection}
                        className="text-xs font-medium text-[#DA9811] underline hover:no-underline">
                        Clear selection
                      </button>
                    ) : user?.avatar_url && !avatarRemove ? (
                      <button type="button" onClick={handleRemoveAvatar}
                        className="text-xs font-medium text-red-400 underline hover:no-underline">
                        Remove photo
                      </button>
                    ) : avatarRemove ? (
                      <button type="button" onClick={() => setAvatarRemove(false)}
                        className="text-xs font-medium text-[#A2A6AB] underline hover:no-underline">
                        Keep existing photo
                      </button>
                    ) : null}
                  </div>
                </div>
              </FormField>

              <FormField label="Name" htmlFor="name" variant="edit">
                <Input id="name" type="text" placeholder="Full Name" value={fields.name}
                  onChange={(e) => setField('name')(e.target.value)} className="max-w-none" />
              </FormField>

              <FormField label="Nickname" htmlFor="nickname" variant="edit">
                <Input id="nickname" type="text" placeholder="Letters, Numbers, Underscores Only"
                  value={fields.nickname}
                  onChange={(e) => { setField('nickname')(e.target.value); setNicknameError(''); }}
                  className="max-w-none" maxLength={NICKNAME_MAX} error={nicknameError || undefined} />
              </FormField>

              <FormField label="Phone" htmlFor="phone" variant="edit">
                <PhoneInput id="phone" placeholder="Enter Phone Number"
                  value={fields.phone} onChange={setField('phone')} />
              </FormField>

              <FormField label="Date Of Birth" htmlFor="dob" variant="edit">
                <DatePicker id="dob" placeholder="MM-DD-YYYY"
                  value={fields.dateOfBirth} onChange={setField('dateOfBirth')} className="max-w-none" />
              </FormField>

              <FormField label="Playing Role" htmlFor="playing-role" variant="edit">
                <Select
                  value={fields.playingRole || PLAYING_ROLE_NONE}
                  onValueChange={(v) => setField('playingRole')(v === PLAYING_ROLE_NONE ? '' : v)}
                >
                  <SelectTrigger id="playing-role" className={`max-w-none ${selectTriggerInputClass}`}>
                    <SelectValue placeholder="Select Playing Role" />
                  </SelectTrigger>
                  <SelectContent className={`z-[100] ${selectContentInputClass}`} viewportClassName={selectViewportInputClass}>
                    <SelectItem value={PLAYING_ROLE_NONE} className={selectItemInputClass}
                      textClassName={selectItemTextInputClass} indicatorClassName={selectItemIndicatorInputClass}>
                      Not Set
                    </SelectItem>
                    {playingRoleOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className={selectItemInputClass}
                        textClassName={selectItemTextInputClass} indicatorClassName={selectItemIndicatorInputClass}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Batting Style" htmlFor="batting-style" variant="edit">
                <Select value={fields.battingStyle} onValueChange={setField('battingStyle')}>
                  <SelectTrigger id="batting-style" className={`max-w-none ${selectTriggerInputClass}`}>
                    <SelectValue placeholder="Select Batting Style" />
                  </SelectTrigger>
                  <SelectContent className={`z-[100] ${selectContentInputClass}`} viewportClassName={selectViewportInputClass}>
                    {battingStyleOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className={selectItemInputClass}
                        textClassName={selectItemTextInputClass} indicatorClassName={selectItemIndicatorInputClass}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Bowling Style" htmlFor="bowling-style" variant="edit">
                <Select value={fields.bowlingStyle} onValueChange={setField('bowlingStyle')}>
                  <SelectTrigger id="bowling-style" className={`max-w-none ${selectTriggerInputClass}`}>
                    <SelectValue placeholder="Select Bowling Style" />
                  </SelectTrigger>
                  <SelectContent className={`z-[100] ${selectContentInputClass}`} viewportClassName={selectViewportInputClass}>
                    {bowlingStyleOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className={selectItemInputClass}
                        textClassName={selectItemTextInputClass} indicatorClassName={selectItemIndicatorInputClass}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Email" htmlFor="email" variant="edit">
                <Input id="email" type="email" placeholder="Enter Email" value={fields.email}
                  onChange={(e) => setField('email')(e.target.value)} className="max-w-none" />
              </FormField>

              <FormField label="Country" htmlFor="country" variant="edit">
                <Select value={fields.country} onValueChange={(v) => { setField('country')(v); setField('city')(''); }}>
                  <SelectTrigger id="country" className={`max-w-none ${selectTriggerInputClass}`}>
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent className={`z-[100] ${selectContentInputClass}`} viewportClassName={selectViewportInputClass}>
                    {countriesList.map((c) => (
                      <SelectItem key={c.id} value={c.name} className={selectItemInputClass}
                        textClassName={selectItemTextInputClass} indicatorClassName={selectItemIndicatorInputClass}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="City" htmlFor="city" variant="edit">
                <Select value={fields.city} onValueChange={setField('city')}>
                  <SelectTrigger id="city" className={`max-w-none ${selectTriggerInputClass}`}>
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent className={`z-[100] ${selectContentInputClass}`} viewportClassName={selectViewportInputClass}>
                    {citiesList.map((c) => (
                      <SelectItem key={c.id} value={c.name} className={selectItemInputClass}
                        textClassName={selectItemTextInputClass} indicatorClassName={selectItemIndicatorInputClass}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

            </div>
          </DialogScrollBody>

          <DialogSaveButton onClick={handleSave} className="shrink-0" disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save'}
          </DialogSaveButton>
        </div>
      </DialogContentProfile>
    </Dialog>
  );
}