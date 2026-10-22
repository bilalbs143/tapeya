import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { useUploadMediaMutation } from '@/shared/api/mediaApi';
import { toast } from '@/shared/ui/toast';

import { useSubmitInterestMutation, useWithdrawInterestMutation } from '../api/interestApi';
import {
  type InterestFormFieldErrors,
  interestNeedsAvatar,
  interestNeedsDoc,
  validateInterestForm,
} from '../lib/interestForm';
import { interestActions } from '../model/actions';
import {
  fieldEnabled,
  type InterestFormValues,
  type InterestShowPayload,
  seedFormValues,
  toSubmitWire,
} from '../model/schemas';

/** Form state, media picks, submit + withdraw for InterestPage. */
export function useInterestForm(slug: string, payload: InterestShowPayload) {
  const navigate = useNavigate();
  const { campaign, mySubmission, profileDefaults } = payload;

  const activeSubmission = mySubmission && mySubmission.status !== 'withdrawn' ? mySubmission : null;
  const submissionStatus = activeSubmission?.status ?? null;

  const actions = useMemo(
    () =>
      interestActions({
        campaignStatus: campaign.status,
        submissionStatus,
      }),
    [campaign.status, submissionStatus]
  );

  const [values, setValues] = useState<InterestFormValues>(() => seedFormValues(activeSubmission, profileDefaults));
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    () => activeSubmission?.profilePictureUrl ?? profileDefaults?.avatarUrl ?? null
  );
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docName, setDocName] = useState<string | null>(null);
  const [docUrl, setDocUrl] = useState<string | null>(() => activeSubmission?.idDocumentUrl ?? null);
  const [errors, setErrors] = useState<InterestFormFieldErrors>({});

  const [submitInterest, { isLoading: submitting }] = useSubmitInterestMutation();
  const [withdrawInterest, { isLoading: withdrawing }] = useWithdrawInterestMutation();
  const [uploadMedia] = useUploadMediaMutation();

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const needsAvatar = interestNeedsAvatar(campaign, activeSubmission, profileDefaults?.avatarUrl);
  const needsDoc = interestNeedsDoc(campaign, activeSubmission);

  function onChange(patch: Partial<InterestFormValues>) {
    setValues((v) => ({ ...v, ...patch }));
  }

  function onAvatarFile(file: File | null) {
    setAvatarPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return file
        ? URL.createObjectURL(file)
        : (activeSubmission?.profilePictureUrl ?? profileDefaults?.avatarUrl ?? null);
    });
    setAvatarFile(file);
    setErrors((e) => {
      if (!e.avatar) return e;
      const rest = { ...e };
      delete rest.avatar;
      return rest;
    });
  }

  function onDocFile(file: File | null) {
    setDocFile(file);
    setDocName(file?.name ?? null);
    if (!file) setDocUrl(activeSubmission?.idDocumentUrl ?? null);
    setErrors((e) => {
      if (!e.doc) return e;
      const rest = { ...e };
      delete rest.doc;
      return rest;
    });
  }

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (actions.submitDisabled || submitting) return;

    const next = validateInterestForm({
      campaign,
      values,
      needsAvatar,
      needsDoc,
      avatarFile,
      avatarPreview,
      docFile,
      docUrl,
    });
    setErrors(next);
    if (Object.keys(next).length) return;

    const updating = submissionStatus === 'pending';
    try {
      const result = await submitInterest({
        slug,
        body: toSubmitWire(values, campaign.formFields),
      }).unwrap();
      const submissionId = result.data?.id;

      if (submissionId) {
        if (fieldEnabled(campaign.formFields, 'profile_picture') && avatarFile) {
          try {
            const { url } = await uploadMedia({
              type: 'interest-submission',
              id: submissionId,
              field: 'profile_picture',
              file: avatarFile,
            }).unwrap();
            setAvatarFile(null);
            setAvatarPreview(url);
          } catch {
            toast({ title: 'Profile picture upload failed. Please try again.', tone: 'error' });
          }
        }
        if (fieldEnabled(campaign.formFields, 'id_document') && docFile) {
          try {
            const { url } = await uploadMedia({
              type: 'interest-submission',
              id: submissionId,
              field: 'id_document',
              file: docFile,
            }).unwrap();
            setDocFile(null);
            setDocName(null);
            setDocUrl(url);
          } catch {
            toast({ title: 'ID document upload failed. Please try again.', tone: 'error' });
          }
        }
      }

      toast({
        title: updating ? 'Your interest details have been updated.' : 'Interest submitted.',
        ...(updating ? {} : { description: 'Our team will see your name shortly.' }),
        tone: 'success',
      });
    } catch (err) {
      toast({
        title: getApiErrorMessage(err, 'Could not submit your interest. Please try again.'),
        tone: 'error',
      });
    }
  }

  async function handleWithdraw() {
    if (withdrawing) return;
    try {
      await withdrawInterest(slug).unwrap();
      toast({ title: 'Interest Withdrawn', tone: 'neutral' });
    } catch (err) {
      toast({
        title: getApiErrorMessage(err, 'Could not withdraw your interest.'),
        tone: 'error',
      });
    }
  }

  function goBack() {
    navigate(-1);
  }

  return {
    campaign,
    actions,
    values,
    onChange,
    avatarPreview,
    onAvatarFile,
    docName,
    docUrl,
    onDocFile,
    errors,
    needsAvatar,
    needsDoc,
    submitting,
    withdrawing,
    handleSubmit,
    handleWithdraw,
    goBack,
  };
}
