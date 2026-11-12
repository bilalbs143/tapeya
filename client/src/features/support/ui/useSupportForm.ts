import { type ChangeEvent, type FormEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { countryByCode, optionalNationalError, splitE164, toE164 } from '@/features/auth';

import type { UserSummary } from '@/entities/user';

import { getApiErrorMessage } from '@/shared/api/errors';
import { APP_PATHS } from '@/shared/config/paths';
import { toast } from '@/shared/ui/toast';

import { useSubmitSupportMessageMutation } from '../api/supportApi';
import { checkSupportAttachment, waMeHref } from '../lib/supportContact';
import {
  mapSupportApiFieldErrors,
  omitSupportErrorKey,
  supportApiErrorsFromUnknown,
  validateSupportForm,
} from '../lib/supportForm';

type UseSupportFormArgs = {
  me: UserSummary | null;
  supportPhone: string | null;
};

/** Support message form state, attachment pick, and submit. */
export function useSupportForm({ me, supportPhone }: UseSupportFormArgs) {
  const navigate = useNavigate();
  const [submitSupport, { isLoading }] = useSubmitSupportMessageMutation();
  const fileInput = useRef<HTMLInputElement>(null);

  const seeded = splitE164(me?.phone);
  const [name, setName] = useState(me?.name?.trim() || me?.nickname?.trim() || '');
  const [countryCode, setCountryCode] = useState(seeded.code);
  const [national, setNational] = useState(seeded.national);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const waHref = supportPhone ? waMeHref(supportPhone, 'Hi Tapeya support,') : '';

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0];
    e.target.value = '';
    if (!next) return;
    const bad = checkSupportAttachment(next);
    if (bad) {
      setErrors((prev) => ({ ...prev, file: bad }));
      toast({ title: 'Attachment Not Added', description: bad, tone: 'error' });
      return;
    }
    setErrors((prev) => omitSupportErrorKey(prev, 'file'));
    setFile(next);
  }

  function clearNameError(value: string) {
    setName(value);
    setErrors((prev) => omitSupportErrorKey(prev, 'name'));
  }

  function clearMessageError(value: string) {
    setMessage(value);
    setErrors((prev) => omitSupportErrorKey(prev, 'message'));
  }

  function clearPhoneError(next: string) {
    setNational(next);
    setErrors((prev) => omitSupportErrorKey(prev, 'phone'));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (isLoading) return;

    const dial = countryByCode(countryCode).dial;
    const next = validateSupportForm(name, message);
    const phoneError = optionalNationalError(national, countryCode);
    if (phoneError) next.phone = phoneError;
    setErrors(next);
    if (Object.keys(next).length) {
      toast({
        title: 'Check the Form',
        description: 'A couple of fields still need you.',
        tone: 'error',
      });
      return;
    }

    try {
      const result = await submitSupport({
        name: name.trim(),
        phone: national.trim() ? toE164(dial, national) : undefined,
        message: message.trim(),
        attachment: file ?? undefined,
      }).unwrap();
      setMessage('');
      setFile(null);
      setErrors({});
      toast({
        title: 'Message Sent',
        description: result.message,
        tone: 'success',
      });
    } catch (err) {
      const fieldErrors = mapSupportApiFieldErrors(supportApiErrorsFromUnknown(err));
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      toast({ title: getApiErrorMessage(err, 'Could not send message.'), tone: 'error' });
    }
  }

  function goHome() {
    navigate(APP_PATHS.home);
  }

  return {
    supportPhone,
    waHref,
    fileInput,
    name,
    countryCode,
    setCountryCode,
    national,
    message,
    file,
    setFile,
    errors,
    isLoading,
    clearNameError,
    clearMessageError,
    clearPhoneError,
    onPick,
    onSubmit,
    goHome,
  };
}
