import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage, isNetworkError } from '@/shared/api/errors';
import { useUploadMediaMutation } from '@/shared/api/mediaApi';
import { toast } from '@/shared/ui/toast';

import { useSubmitInterestMutation } from '../api/interestApi';
import {
  clearCustomFieldError,
  type InterestFormFieldErrors,
  interestNeedsAvatar,
  validateInterestForm,
} from '../lib/interestForm';
import { interestFormActions } from '../model/actions';
import {
  existingCustomFileUrl,
  fieldEnabled,
  type InterestFormValues,
  interestRenderableCustomFields,
  type InterestShowPayload,
  seedFormValues,
  toSubmitWire,
} from '../model/schemas';

/** One automatic retry for flaky mobile connections — no backoff, no queues. */
async function onceWithNetworkRetry<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    if (!isNetworkError(err)) throw err;
    return await run();
  }
}

function seedCustomFileMeta(
  campaign: InterestShowPayload['campaign'],
  submission: InterestShowPayload['mySubmission']
): Record<string, { name: string | null; url: string | null }> {
  const meta: Record<string, { name: string | null; url: string | null }> = {};
  for (const field of interestRenderableCustomFields(campaign)) {
    if (field.type !== 'file') continue;
    meta[field.id] = { name: null, url: existingCustomFileUrl(submission, field.id) };
  }
  return meta;
}

type UseInterestFormOptions = {
  /** Called after a successful submit (e.g. close the interest dialog). */
  onSubmitted?: (() => void) | undefined;
};

/** Form state, media picks, and one-shot submit for InterestPage / dialog. */
export function useInterestForm(slug: string, payload: InterestShowPayload, options: UseInterestFormOptions = {}) {
  const navigate = useNavigate();
  const { onSubmitted } = options;
  const { campaign, mySubmission, profileDefaults } = payload;
  const hasSubmission = mySubmission != null;

  const actions = useMemo(
    () => interestFormActions({ campaignStatus: campaign.status, hasSubmission }),
    [campaign.status, hasSubmission]
  );

  const [values, setValues] = useState<InterestFormValues>(() =>
    seedFormValues(null, profileDefaults, campaign.customFields)
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(() => profileDefaults?.avatarUrl ?? null);
  const [customFiles, setCustomFiles] = useState<Record<string, File | null>>({});
  const [customFileMeta, setCustomFileMeta] = useState(() => seedCustomFileMeta(campaign, null));
  const renderableCustomFields = useMemo(() => interestRenderableCustomFields(campaign), [campaign]);
  const [errors, setErrors] = useState<InterestFormFieldErrors>({});

  const [submitInterest, { isLoading: submitting }] = useSubmitInterestMutation();
  const [uploadMedia] = useUploadMediaMutation();
  const submitLock = useRef(false);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const needsAvatar = interestNeedsAvatar(campaign, null, profileDefaults?.avatarUrl);

  function onChange(patch: Partial<InterestFormValues>) {
    setValues((v) => ({ ...v, ...patch }));
  }

  function onCustomAnswerChange(fieldId: string, value: string) {
    setValues((v) => ({
      ...v,
      customAnswers: { ...v.customAnswers, [fieldId]: value },
    }));
    setErrors((e) => clearCustomFieldError(e, fieldId));
  }

  function onAvatarFile(file: File | null) {
    setAvatarPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : (profileDefaults?.avatarUrl ?? null);
    });
    setAvatarFile(file);
    setErrors((e) => {
      if (!e.avatar) return e;
      const next = { ...e };
      Reflect.deleteProperty(next, 'avatar');
      return next;
    });
  }

  function onCustomFile(fieldId: string, file: File | null) {
    setCustomFiles((prev) => ({ ...prev, [fieldId]: file }));
    setCustomFileMeta((prev) => ({
      ...prev,
      [fieldId]: {
        name: file?.name ?? null,
        url: null,
      },
    }));
    setErrors((e) => clearCustomFieldError(e, fieldId));
  }

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (actions.submitDisabled || submitting || submitLock.current) return;

    const customFileUrls = Object.fromEntries(Object.entries(customFileMeta).map(([id, meta]) => [id, meta.url]));

    const next = validateInterestForm({
      campaign,
      values,
      needsAvatar,
      avatarFile,
      avatarPreview,
      customFiles,
      customFileUrls,
      activeSubmission: null,
    });
    setErrors(next);
    if (Object.keys(next).length) return;

    submitLock.current = true;
    try {
      const result = await onceWithNetworkRetry(() =>
        submitInterest({
          slug,
          body: toSubmitWire(values, campaign.formFields, campaign.customFields),
        }).unwrap()
      );
      const submissionId = result.data?.id;

      if (submissionId) {
        if (fieldEnabled(campaign.formFields, 'profile_picture') && avatarFile) {
          try {
            await onceWithNetworkRetry(() =>
              uploadMedia({
                type: 'interest-submission',
                id: submissionId,
                field: 'profile_picture',
                file: avatarFile,
              }).unwrap()
            );
            setAvatarFile(null);
          } catch {
            toast({ title: 'Profile picture upload failed. Please try again.', tone: 'error' });
          }
        }

        for (const field of renderableCustomFields) {
          const file = field.type === 'file' ? customFiles[field.id] : null;
          if (!file) continue;
          try {
            const { url } = await onceWithNetworkRetry(() =>
              uploadMedia({
                type: 'interest-submission',
                id: submissionId,
                field: field.id,
                file,
              }).unwrap()
            );
            setCustomFiles((prev) => ({ ...prev, [field.id]: null }));
            setCustomFileMeta((prev) => ({ ...prev, [field.id]: { name: null, url } }));
          } catch {
            toast({ title: `${field.label} upload failed. Please try again.`, tone: 'error' });
          }
        }
      }

      toast({
        title: 'Request submitted.',
        description: 'Our team will see your name shortly.',
        tone: 'success',
      });
      onSubmitted?.();
    } catch (err) {
      toast({
        title: getApiErrorMessage(err, 'Could not submit your interest. Please try again.'),
        tone: 'error',
      });
    } finally {
      submitLock.current = false;
    }
  }

  return {
    campaign,
    actions,
    values,
    onChange,
    onCustomAnswerChange,
    avatarPreview,
    onAvatarFile,
    customFileMeta,
    onCustomFile,
    errors,
    needsAvatar,
    submitting,
    handleSubmit,
    goBack: () => navigate(-1),
  };
}
