import { useEffect, useState } from 'react';

import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { DEFAULT_COUNTRY } from '@/lib/constants/geo';
import { interestFormFieldEnabled, resolveInterestFormFields } from '@/lib/constants/interestFormFields';
import { formatIsoDateForDisplay, toApiDate } from '@/lib/utils/dateUtils';
import { EMPTY_FILE_UPLOAD, fileUploadValueFromUrl } from '@/lib/utils/fileUploadUtils';
import { uploadMediaFile, useDeleteMediaMutation, useUploadMediaMutation } from '@/store/api/mediaApi';
import {
  useGetInterestCampaignQuery,
  useSubmitInterestMutation,
  useWithdrawInterestMutation,
} from '@/store/api/tournamentInterestApi';
import { Button } from '@/ui/Button';
import { CountryCityFields } from '@/ui/CountryCityFields';
import { DatePicker } from '@/ui/DatePicker';
import { FileUploadField } from '@/ui/FileUploadField';
import { FormActions } from '@/ui/form/FormActions';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { LoaderBlock } from '@/ui/Loader';

const PROFILE_PICTURE_REQUIRED_MSG = 'Please add a profile picture.';
const ID_DOCUMENT_REQUIRED_MSG = 'Please add your CNIC or B-Form.';

export const INTEREST_CAMPAIGN_FORM_ID = 'interest-campaign-form';

const EMPTY_FORM = {
  name: '',
  nickname: '',
  email: '',
  phone: '',
  country: DEFAULT_COUNTRY,
  city: '',
  date_of_birth: '',
};

/**
 * Shared interest form — used on the full page and inside the in-app dialog.
 *
 * @param {object} props
 * @param {string} props.slug
 * @param {'page' | 'dialog'} [props.variant='page']
 * @param {string} [props.idPrefix='interest']
 * @param {() => void} [props.onSubmitted]
 * @param {object} [props.payload] — preloaded campaign response; skips fetch when provided
 * @param {string} [props.formId] — when set (dialog), links an external DialogSaveButton to this form
 * @param {(state: { visible: boolean, disabled: boolean, loading: boolean, label: string }) => void} [props.onSubmitUiChange]
 */
export function InterestFormContent({
  slug,
  variant = 'page',
  idPrefix = 'interest',
  onSubmitted,
  payload: payloadProp,
  formId,
  onSubmitUiChange,
}) {
  const toast = useToast();
  const isDialog = variant === 'dialog';
  const hasPreloadedPayload = payloadProp !== undefined;

  const {
    data: fetchedPayload,
    isLoading,
    isError,
    error,
  } = useGetInterestCampaignQuery({ slug }, { skip: !slug || hasPreloadedPayload });

  const payload = hasPreloadedPayload ? payloadProp : fetchedPayload;

  const [submitInterest, { isLoading: isSubmitting }] = useSubmitInterestMutation();
  const [withdrawInterest, { isLoading: isWithdrawing }] = useWithdrawInterestMutation();
  const [uploadMedia] = useUploadMediaMutation();
  const [deleteMedia] = useDeleteMediaMutation();

  const [form, setForm] = useState(EMPTY_FORM);
  const [profilePictureUpload, setProfilePictureUpload] = useState(EMPTY_FILE_UPLOAD);
  const [idDocumentUpload, setIdDocumentUpload] = useState(EMPTY_FILE_UPLOAD);
  const [submissionId, setSubmissionId] = useState(null);
  const [errors, setErrors] = useState({});

  const clearError = (key) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const { [key]: _, ...rest } = prev;
      return rest;
    });

  const campaign = payload?.campaign;
  const formFields = resolveInterestFormFields(campaign);
  const showField = (key) => interestFormFieldEnabled(formFields, key);
  const mySubmission = payload?.my_submission ?? null;
  const profileDefaults = payload?.profile_defaults ?? null;
  const needsProfilePictureUpload =
    showField('profile_picture') && !mySubmission?.profile_picture_url && !profileDefaults?.avatar_url;
  const needsIdDocumentUpload = showField('id_document') && !mySubmission?.id_document_url;
  const isOpen = campaign?.status === 'open';
  const isActive = mySubmission && mySubmission.status !== 'withdrawn';
  const isConfirmed = mySubmission?.status === 'confirmed';

  useEffect(() => {
    if (!isDialog || !onSubmitUiChange) return;
    onSubmitUiChange({
      visible: !isConfirmed,
      disabled: !isOpen || isSubmitting,
      loading: isSubmitting,
      label: isSubmitting ? 'Submitting…' : isActive ? 'Update My Details' : "I'm Interested",
    });
  }, [isDialog, onSubmitUiChange, isConfirmed, isOpen, isSubmitting, isActive]);

  useEffect(() => {
    if (!payload) return;
    const countryFromSubmission = mySubmission?.country && String(mySubmission.country).trim();
    const countryFromProfile = profileDefaults?.country && String(profileDefaults.country).trim();

    const source = mySubmission
      ? {
          name: mySubmission.name ?? '',
          nickname: mySubmission.nickname ?? '',
          email: mySubmission.email ?? '',
          phone: mySubmission.phone ?? '',
          country: countryFromSubmission || DEFAULT_COUNTRY,
          city: mySubmission.city ?? '',
          date_of_birth: formatIsoDateForDisplay(mySubmission.date_of_birth),
        }
      : {
          name: profileDefaults?.name ?? '',
          nickname: profileDefaults?.nickname ?? '',
          email: profileDefaults?.email ?? '',
          phone: profileDefaults?.phone ?? '',
          country: countryFromProfile || DEFAULT_COUNTRY,
          city: profileDefaults?.city ?? '',
          date_of_birth: formatIsoDateForDisplay(profileDefaults?.date_of_birth),
        };
    setForm(source);
    const existingPic = mySubmission?.profile_picture_url ?? profileDefaults?.avatar_url ?? null;
    setProfilePictureUpload(fileUploadValueFromUrl(existingPic));
    setIdDocumentUpload(fileUploadValueFromUrl(mySubmission?.id_document_url ?? null));
    setSubmissionId(mySubmission?.id ?? null);
    setErrors({});
  }, [payload, mySubmission, profileDefaults]);

  const onChange = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isOpen || isSubmitting) return;

    const newPictureFile = profilePictureUpload.files[0] ?? null;
    const newIdDocFile = idDocumentUpload.files[0] ?? null;

    const missPicture = needsProfilePictureUpload && !newPictureFile && !profilePictureUpload.existingUrls.length;
    const missIdDocument = needsIdDocumentUpload && !newIdDocFile && !idDocumentUpload.existingUrls.length;
    if (missPicture || missIdDocument) {
      setErrors({
        ...(missPicture && { picture: PROFILE_PICTURE_REQUIRED_MSG }),
        ...(missIdDocument && { idDocument: ID_DOCUMENT_REQUIRED_MSG }),
      });
      return;
    }
    setErrors({});

    const scalarKeys = ['name', 'nickname', 'email', 'phone', 'country', 'city', 'date_of_birth'];
    const body = {};
    for (const key of scalarKeys) {
      if (!showField(key)) continue;
      let value = form[key];
      if (key === 'date_of_birth') value = toApiDate(value);
      if (typeof value === 'string') value = value.trim();
      if (value !== '' && value != null) body[key] = value;
    }

    try {
      const result = await submitInterest({ slug, body }).unwrap();
      const nextSubmissionId = result?.data?.id ?? result?.id ?? null;

      if (nextSubmissionId) {
        if (showField('profile_picture') && newPictureFile) {
          try {
            const url = await uploadMediaFile(uploadMedia, {
              type: 'interest-submission',
              id: nextSubmissionId,
              field: 'profile_picture',
              file: newPictureFile,
            });
            setProfilePictureUpload(fileUploadValueFromUrl(url));
          } catch {
            toast.error('Profile picture upload failed. Please try again.');
          }
        }
        if (showField('id_document') && newIdDocFile) {
          try {
            const url = await uploadMediaFile(uploadMedia, {
              type: 'interest-submission',
              id: nextSubmissionId,
              field: 'id_document',
              file: newIdDocFile,
            });
            setIdDocumentUpload(fileUploadValueFromUrl(url));
          } catch {
            toast.error('ID document upload failed. Please try again.');
          }
        }
      }

      toast.success(
        isActive ? 'Your interest details have been updated.' : 'Interest submitted. Our team will see your name shortly.',
      );
      onSubmitted?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not submit your interest. Please try again.'));
    }
  };

  const handleWithdraw = async () => {
    if (!isActive || isWithdrawing) return;
    try {
      await withdrawInterest({ slug }).unwrap();
      toast.success('Interest withdrawn.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not withdraw your interest.'));
    }
  };

  if (!hasPreloadedPayload && isLoading) {
    return <LoaderBlock label="Loading form" className="py-6" />;
  }

  if (!hasPreloadedPayload && (isError || !campaign)) {
    const message =
      error?.status === 404
        ? "We couldn't find this interest form. The link may be wrong or it has been removed."
        : getApiErrorMessage(error, 'Failed to load this interest form.');
    return <p className="py-6 text-center text-sm text-red-300">{message}</p>;
  }

  return (
    <div className={isDialog ? 'space-y-4' : undefined}>
      {(campaign.description || !isOpen) && (
        <div className={isDialog ? 'text-center' : 'mx-auto mb-6 max-w-2xl text-center'}>
          {campaign.description && (
            <p className="text-muted mb-4 text-[13px] leading-snug whitespace-pre-line md:text-[14px]">{campaign.description}</p>
          )}
          {!isOpen && (
            <div className="bg-surface rounded-[6px] border border-amber-500/45 p-4 shadow-[0_0_0_1px_rgba(251,191,36,0.12)]">
              <p className="text-[12px] leading-snug text-amber-200/95">
                This interest form is closed. New submissions are not accepted.
              </p>
            </div>
          )}
        </div>
      )}

      {isConfirmed ? (
        <div className="border-brand/45 bg-surface text-brand mb-6 rounded-[6px] border p-4 text-center text-[12px] leading-snug font-semibold shadow-[0_0_0_1px_rgba(218,152,17,0.12)]">
          Your spot is confirmed. Our team has accepted your interest — these are the details we have on file.
        </div>
      ) : isActive ? (
        <div className="bg-surface mb-6 rounded-[6px] border border-emerald-700/45 p-4 text-center text-[12px] leading-snug text-emerald-200/95 shadow-[0_0_0_1px_rgba(16,185,129,0.1)]">
          You&apos;re already on the interest list. Update your details below or withdraw your interest.
        </div>
      ) : null}

      <FormStack as="form" layout="grid-2" id={formId} onSubmit={handleSubmit}>
        {showField('profile_picture') && (
          <div className="flex flex-col items-center gap-2 lg:col-span-2">
            <FileUploadField
              variant="avatar"
              value={profilePictureUpload}
              onChange={(v) => {
                setProfilePictureUpload(v);
                clearError('picture');
              }}
              accept="image/jpeg,image/png,image/webp"
              acceptLabel="JPG, PNG, WebP"
              maxSizeMb={5}
              avatarSize={96}
              error={errors.picture}
              required={needsProfilePictureUpload}
              onExistingUrlRemoved={
                submissionId
                  ? () => deleteMedia({ type: 'interest-submission', id: submissionId, field: 'profile_picture' })
                  : undefined
              }
            />
            {!errors.picture && (
              <p className="text-muted/80 max-w-[280px] text-center text-[12px] leading-snug">
                {needsProfilePictureUpload && !profilePictureUpload.files.length && !profilePictureUpload.existingUrls.length
                  ? 'Profile picture required — JPG, PNG or WebP, max 5 MB.'
                  : 'JPG, PNG or WebP, max 5 MB.'}
              </p>
            )}
          </div>
        )}

        {showField('name') && (
          <FormField label="Full Name" htmlFor={`${idPrefix}-name`} required>
            <Input
              id={`${idPrefix}-name`}
              type="text"
              value={form.name}
              placeholder="Your Name"
              maxLength={191}
              autoComplete="name"
              required
              readOnly
              aria-readonly
              className="cursor-default opacity-90"
            />
          </FormField>
        )}

        {showField('nickname') && (
          <FormField label="Nickname" htmlFor={`${idPrefix}-nickname`} required>
            <Input
              id={`${idPrefix}-nickname`}
              type="text"
              value={form.nickname}
              placeholder="Your Nickname"
              maxLength={191}
              required
              readOnly
              aria-readonly
              className="cursor-default opacity-90"
            />
          </FormField>
        )}

        {showField('phone') && (
          <FormField label="Phone" htmlFor={`${idPrefix}-phone`} required>
            <Input
              id={`${idPrefix}-phone`}
              type="tel"
              value={form.phone}
              placeholder="Phone / WhatsApp Number"
              maxLength={30}
              autoComplete="tel"
              required
              readOnly
              aria-readonly
              className="cursor-default opacity-90"
            />
          </FormField>
        )}

        {showField('email') && (
          <FormField label="Email" htmlFor={`${idPrefix}-email`} required>
            <Input
              id={`${idPrefix}-email`}
              type="email"
              value={form.email}
              onChange={onChange('email')}
              placeholder="you@example.com"
              maxLength={191}
              autoComplete="email"
              required
            />
          </FormField>
        )}

        {showField('date_of_birth') && (
          <FormField label="Date Of Birth" htmlFor={`${idPrefix}-dob`} required>
            <DatePicker
              id={`${idPrefix}-dob`}
              value={form.date_of_birth}
              onChange={(value) => setForm((prev) => ({ ...prev, date_of_birth: value }))}
              placeholder="MM-DD-YYYY"
            />
          </FormField>
        )}

        {(showField('country') || showField('city')) && (
          <CountryCityFields
            country={form.country}
            city={form.city}
            onCountryChange={(v) => setForm((prev) => ({ ...prev, country: v }))}
            onCityChange={(v) => setForm((prev) => ({ ...prev, city: v }))}
            countryId={`${idPrefix}-country`}
            cityId={`${idPrefix}-city`}
            required
            showCountry={showField('country')}
            showCity={showField('city')}
          />
        )}

        {showField('id_document') && (
          <div className="lg:col-span-2">
            <FileUploadField
              label="CNIC or B-Form"
              value={idDocumentUpload}
              onChange={(v) => {
                setIdDocumentUpload(v);
                clearError('idDocument');
              }}
              accept="image/jpeg,image/png,image/webp,application/pdf"
              acceptLabel="Image or PDF"
              maxSizeMb={10}
              error={errors.idDocument}
              required={needsIdDocumentUpload}
              onExistingUrlRemoved={
                submissionId
                  ? () => deleteMedia({ type: 'interest-submission', id: submissionId, field: 'id_document' })
                  : undefined
              }
            />
            {!idDocumentUpload.files.length && mySubmission?.id_document_url && (
              <a
                href={mySubmission.id_document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand mt-1.5 inline-block text-[12px] font-medium underline underline-offset-2 hover:no-underline"
              >
                View uploaded document
              </a>
            )}
          </div>
        )}

        {!isConfirmed && (!isDialog || isActive) && (
          <FormActions align="between" className="lg:col-span-2">
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              {!isDialog && (
                <Button
                  type="submit"
                  variant="orange"
                  size="dialog"
                  disabled={!isOpen || isSubmitting}
                  loading={isSubmitting}
                  className="w-full sm:w-[220px]"
                >
                  {isActive ? 'Update My Details' : "I'm Interested"}
                </Button>
              )}
              {isActive && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  loading={isWithdrawing}
                  className="w-full py-3 text-sm sm:w-[180px]"
                >
                  Withdraw
                </Button>
              )}
            </div>
          </FormActions>
        )}
      </FormStack>
    </div>
  );
}

export default InterestFormContent;
