import { useEffect, useState } from 'react';

import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { enumNameToValue } from '@/lib/utils/enumUtils';
import { updateProfileSchema } from '@/lib/validations/auth';
import { useGetMeQuery, useUpdateProfileMutation } from '@/store/api/authApi';
import { usePlayerProfileEnums } from '@/store/api/enumApi';
import {
  useGetCitiesQuery,
  useGetCountriesQuery,
} from '@/store/api/locationApi';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { DatePicker } from '@/ui/DatePicker';
import {
  Dialog,
  DialogClose,
  DialogContentProfile,
  DialogSaveButton,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { PhoneInput } from '@/ui/PhoneInput';
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

const DEFAULT_FIELDS = {
  name: '',
  country: '',
  city: '',
  nickname: '',
  phone: '',
  dateOfBirth: '',
  battingStyle: '',
  bowlingStyle: '',
  email: '',
};

export function UserEdit({ open, onOpenChange }) {
  const dispatch = useAppDispatch();
  const { data: meData } = useGetMeQuery(undefined, { skip: !open });
  const user = meData?.data ?? null;
  const { battingStyleOptions, bowlingStyleOptions } = usePlayerProfileEnums();

  const { data: countriesList = [] } = useGetCountriesQuery(undefined, {
    skip: !open,
  });

  const toast = useToast();
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [nicknameError, setNicknameError] = useState('');

  const setField = (key) => (value) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const countryCode =
    countriesList.find((c) => c.name === fields.country)?.country_code ?? null;
  const { data: citiesList = [] } = useGetCitiesQuery(countryCode, {
    skip: !open || !countryCode,
  });

  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  useEffect(() => {
    if (!open || !user) return;
    const batting =
      enumNameToValue(user.batting_style_enum) || user.batting_style;
    const bowling =
      enumNameToValue(user.bowling_style_enum) || user.bowling_style;
    setFields({
      name: user.name ?? '',
      country: user.country ?? '',
      city: user.city ?? '',
      nickname: user.nickname ?? '',
      phone: user.phone ?? '',
      dateOfBirth: user.date_of_birth ?? '',
      battingStyle: battingStyleOptions.some((o) => o.value === batting)
        ? batting
        : (battingStyleOptions[0]?.value ?? ''),
      bowlingStyle: bowlingStyleOptions.some((o) => o.value === bowling)
        ? bowling
        : (bowlingStyleOptions[0]?.value ?? ''),
      email: user.email ?? '',
    });
    setNicknameError('');
  }, [open, user, battingStyleOptions, bowlingStyleOptions]);

  const handleSave = async () => {
    setNicknameError('');

    const rawNick = fields.nickname.trim();
    const parsed = updateProfileSchema.safeParse({
      name: fields.name.trim() || undefined,
      nickname: rawNick || undefined,
      email: fields.email.trim() || undefined,
      phone: fields.phone.trim() || undefined,
      date_of_birth: fields.dateOfBirth || undefined,
      bowling_style: fields.bowlingStyle || undefined,
      batting_style: fields.battingStyle || undefined,
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

    const toSend = Object.fromEntries(
      Object.entries(parsed.data).filter(
        ([, v]) => v !== undefined && v !== '',
      ),
    );

    try {
      const result = await updateProfile(toSend).unwrap();
      const updatedUser = result?.data ?? result;
      if (updatedUser && typeof updatedUser === 'object') {
        dispatch(updateUser(updatedUser));
      }
      onOpenChange?.(false);
    } catch (err) {
      const errors = err?.data?.errors;
      const nicknameMsg = Array.isArray(errors?.nickname)
        ? errors.nickname[0]
        : null;
      if (nicknameMsg) {
        setNicknameError(nicknameMsg);
        return;
      }
      toast.error(getApiErrorMessage(err, 'Failed to save profile.'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentProfile>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center justify-between px-5 py-4">
            <DialogTitle className="text-[16px] font-bold tracking-wide text-[#DA9811] uppercase">
              EDIT PROFILE
            </DialogTitle>
            <DialogClose
              className="rounded p-1 text-white/60 transition-colors hover:text-white focus:ring-2 focus:ring-[#FFB703] focus:outline-none"
              aria-label="Close"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 15 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" />
              </svg>
            </DialogClose>
          </div>

          <DialogScrollBody>
            <div className="flex flex-col gap-4">
              <FormField label="Name" htmlFor="name" variant="edit">
                <Input
                  id="name"
                  type="text"
                  placeholder="Full name"
                  value={fields.name}
                  onChange={(e) => setField('name')(e.target.value)}
                  className="max-w-none"
                />
              </FormField>

              <FormField
                label="Nickname (optional)"
                htmlFor="nickname"
                variant="edit"
              >
                <Input
                  id="nickname"
                  type="text"
                  placeholder="Letters, numbers, underscores only"
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

              <FormField label="Phone" htmlFor="phone" variant="edit">
                <PhoneInput
                  id="phone"
                  placeholder="Enter Phone Number"
                  value={fields.phone}
                  onChange={setField('phone')}
                />
              </FormField>

              <FormField label="Date of birth" htmlFor="dob" variant="edit">
                <DatePicker
                  id="dob"
                  placeholder="MM-DD-YYYY"
                  value={fields.dateOfBirth}
                  onChange={setField('dateOfBirth')}
                  className="max-w-none"
                />
              </FormField>

              <FormField
                label="Batting style"
                htmlFor="batting-style"
                variant="edit"
              >
                <Select
                  value={fields.battingStyle}
                  onValueChange={setField('battingStyle')}
                >
                  <SelectTrigger
                    id="batting-style"
                    className={`max-w-none ${selectTriggerInputClass}`}
                  >
                    <SelectValue placeholder="Select batting style" />
                  </SelectTrigger>
                  <SelectContent
                    className={`z-[100] ${selectContentInputClass}`}
                    viewportClassName={selectViewportInputClass}
                  >
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

              <FormField
                label="Bowling style"
                htmlFor="bowling-style"
                variant="edit"
              >
                <Select
                  value={fields.bowlingStyle}
                  onValueChange={setField('bowlingStyle')}
                >
                  <SelectTrigger
                    id="bowling-style"
                    className={`max-w-none ${selectTriggerInputClass}`}
                  >
                    <SelectValue placeholder="Select bowling style" />
                  </SelectTrigger>
                  <SelectContent
                    className={`z-[100] ${selectContentInputClass}`}
                    viewportClassName={selectViewportInputClass}
                  >
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

              <FormField
                label="Email (Optional)"
                htmlFor="email"
                variant="edit"
              >
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={fields.email}
                  onChange={(e) => setField('email')(e.target.value)}
                  className="max-w-none"
                />
              </FormField>

              <FormField label="Country" htmlFor="country" variant="edit">
                <Select
                  value={fields.country}
                  onValueChange={(v) => {
                    setField('country')(v);
                    setField('city')('');
                  }}
                >
                  <SelectTrigger
                    id="country"
                    className={`max-w-none ${selectTriggerInputClass}`}
                  >
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent
                    className={`z-[100] ${selectContentInputClass}`}
                    viewportClassName={selectViewportInputClass}
                  >
                    {countriesList.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.name}
                        className={selectItemInputClass}
                        textClassName={selectItemTextInputClass}
                        indicatorClassName={selectItemIndicatorInputClass}
                      >
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="City" htmlFor="city" variant="edit">
                <Select value={fields.city} onValueChange={setField('city')}>
                  <SelectTrigger
                    id="city"
                    className={`max-w-none ${selectTriggerInputClass}`}
                  >
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent
                    className={`z-[100] ${selectContentInputClass}`}
                    viewportClassName={selectViewportInputClass}
                  >
                    {citiesList.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.name}
                        className={selectItemInputClass}
                        textClassName={selectItemTextInputClass}
                        indicatorClassName={selectItemIndicatorInputClass}
                      >
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </DialogScrollBody>

          <DialogSaveButton
            onClick={handleSave}
            className="shrink-0"
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : 'Save'}
          </DialogSaveButton>
        </div>
      </DialogContentProfile>
    </Dialog>
  );
}
