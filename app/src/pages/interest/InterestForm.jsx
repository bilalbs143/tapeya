import { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { DEFAULT_COUNTRY } from '@/lib/constants/geo';
import { formatIsoDateForDisplay, toApiDate } from '@/lib/utils/dateUtils';
import { EMPTY_FILE_UPLOAD, fileUploadValueFromUrl } from '@/lib/utils/fileUploadUtils';
import { uploadMediaFile, useDeleteMediaMutation, useUploadMediaMutation } from '@/store/api/mediaApi';
import {
  useGetInterestCampaignQuery,
  useSubmitInterestMutation,
  useWithdrawInterestMutation,
} from '@/store/api/tournamentInterestApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { CountryCityFields } from '@/ui/CountryCityFields';
import { DatePicker } from '@/ui/DatePicker';
import { FileUploadField } from '@/ui/FileUploadField';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';

const PROFILE_PICTURE_REQUIRED_MSG = 'Please add a profile picture.';
const ID_DOCUMENT_REQUIRED_MSG = 'Please add your CNIC or B-Form.';

const EMPTY_FORM = {
  name: '',
  nickname: '',
  email: '',
  phone: '',
  country: DEFAULT_COUNTRY,
  city: '',
  date_of_birth: '',
};

export default function InterestForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: payload, isLoading, isError, error } = useGetInterestCampaignQuery({ slug }, { skip: !slug });

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
  const mySubmission = payload?.my_submission ?? null;
  const profileDefaults = payload?.profile_defaults ?? null;
  const needsProfilePictureUpload = !mySubmission?.profile_picture_url && !profileDefaults?.avatar_url;
  const needsIdDocumentUpload = !mySubmission?.id_document_url;
  const isOpen = campaign?.status === 'open';
  const isActive = mySubmission && mySubmission.status !== 'withdrawn';
  const isConfirmed = mySubmission?.status === 'confirmed';

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
    // Seed file fields from existing submission / profile
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

    // Step 1 — Submit text fields as JSON (no multipart needed for the main payload).
    const normalized = Object.fromEntries(
      Object.entries({ ...form, date_of_birth: toApiDate(form.date_of_birth) })
        .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
        .filter(([, v]) => v !== '' && v != null),
    );

    try {
      const result = await submitInterest({ slug, body: normalized }).unwrap();
      const submissionId = result?.data?.id ?? result?.id ?? null;

      // Step 2 — Upload new files via the deferred media endpoint.
      if (submissionId) {
        if (newPictureFile) {
          try {
            const url = await uploadMediaFile(uploadMedia, {
              type: 'interest-submission',
              id: submissionId,
              field: 'profile_picture',
              file: newPictureFile,
            });
            setProfilePictureUpload(fileUploadValueFromUrl(url));
          } catch {
            toast.error('Profile picture upload failed. Please try again.');
          }
        }
        if (newIdDocFile) {
          try {
            const url = await uploadMediaFile(uploadMedia, {
              type: 'interest-submission',
              id: submissionId,
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

  if (isLoading) {
    return (
      <div className="bg-black">
        <AppSubpageHeader
          sticky
          title={<h1 className="min-w-0 truncate px-1 text-center text-[15px] leading-snug font-bold text-white/70">Loading…</h1>}
        />
        <Container className="pb-8">
          <p className="py-8 text-center text-sm text-muted">Loading interest form…</p>
        </Container>
      </div>
    );
  }

  if (isError || !campaign) {
    const message =
      error?.status === 404
        ? "We couldn't find this interest form. The link may be wrong or it has been removed."
        : getApiErrorMessage(error, 'Failed to load this interest form.');
    return (
      <div className="bg-black">
        <AppSubpageHeader
          sticky
          title={<h1 className="min-w-0 truncate px-1 text-center text-[15px] leading-snug font-bold text-white/80">Interest</h1>}
        />
        <Container className="pb-8">
          <p className="py-8 text-center text-sm text-red-300">{message}</p>
          <Button
            type="button"
            variant="orangeDialogWhite"
            size="dialog"
            className="mx-auto mt-3 w-full uppercase sm:w-[220px]"
            onClick={() => navigate('/upcoming-tournaments')}
          >
            Browse Tournaments
          </Button>
        </Container>
      </div>
    );
  }

  const headerTitle =
    campaign.tournament_name != null && campaign.tournament_name !== '' ? (
      <h1 className="min-w-0 truncate px-1 text-center text-[15px] leading-snug font-bold text-white">
        {campaign.tournament_name}
      </h1>
    ) : (
      <h1 className="min-w-0 truncate px-1 text-center text-[15px] leading-snug font-bold text-white/80">Interest</h1>
    );

  return (
    <div className="relative bg-black">
      <AppSubpageHeader sticky title={headerTitle} />
      {campaign.logo_url && (
        <div className="pointer-events-none fixed inset-x-0 top-16 bottom-0 z-0 flex items-center justify-center" aria-hidden>
          <img src={campaign.logo_url} alt="" className="max-h-[55vh] max-w-[70vw] object-contain opacity-[0.2]" />
        </div>
      )}
      <Container className="relative z-10 pb-8">
        {(campaign.description || !isOpen) && (
          <div className="mx-auto mb-6 max-w-2xl text-center">
            {campaign.description && (
              <p className="mb-4 text-[13px] leading-snug whitespace-pre-line text-muted md:text-[14px]">
                {campaign.description}
              </p>
            )}
            {!isOpen && (
              <div className="rounded-[6px] border border-amber-500/45 bg-surface p-4 shadow-[0_0_0_1px_rgba(251,191,36,0.12)]">
                <p className="text-[12px] leading-snug text-amber-200/95">
                  This interest form is closed. New submissions are not accepted.
                </p>
              </div>
            )}
          </div>
        )}

        {isConfirmed ? (
          <div className="mb-6 rounded-[6px] border border-brand/45 bg-surface p-4 text-center text-[12px] leading-snug font-semibold text-brand shadow-[0_0_0_1px_rgba(218,152,17,0.12)]">
            Your spot is confirmed. Our team has accepted your interest — these are the details we have on file.
          </div>
        ) : isActive ? (
          <div className="mb-6 rounded-[6px] border border-emerald-700/45 bg-surface p-4 text-center text-[12px] leading-snug text-emerald-200/95 shadow-[0_0_0_1px_rgba(16,185,129,0.1)]">
            You&apos;re already on the interest list. Update your details below or withdraw your interest.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4 lg:grid lg:grid-cols-2 lg:space-y-0 lg:gap-x-6 lg:gap-y-4">
          <div className="flex flex-col items-center gap-2">
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
              <p className="max-w-[280px] text-center text-[12px] leading-snug text-muted/80">
                {needsProfilePictureUpload && !profilePictureUpload.files.length && !profilePictureUpload.existingUrls.length
                  ? 'Profile picture required — JPG, PNG or WebP, max 5 MB.'
                  : 'JPG, PNG or WebP, max 5 MB.'}
              </p>
            )}
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-[12px] font-bold tracking-wide text-muted uppercase">Personal Details</h2>
            <p className="mt-1 text-[12px] leading-snug text-muted/90">
              From your account. To change these, update your profile.
            </p>
          </div>

          <FormField label="Full Name" htmlFor="interest-name" required>
            <Input
              id="interest-name"
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

          <FormField label="Nickname" htmlFor="interest-nickname" required>
            <Input
              id="interest-nickname"
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

          <FormField label="Phone" htmlFor="interest-phone" required>
            <Input
              id="interest-phone"
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

          <div className="border-t border-[#FFFFFF14] pt-6 lg:col-span-2">
            <h2 className="text-[12px] font-bold tracking-wide text-muted uppercase">Other Details</h2>
          </div>

          <FormField label="Email" htmlFor="interest-email" required>
            <Input
              id="interest-email"
              type="email"
              value={form.email}
              onChange={onChange('email')}
              placeholder="you@example.com"
              maxLength={191}
              autoComplete="email"
              required
            />
          </FormField>

          <FormField label="Date Of Birth" htmlFor="interest-dob" required>
            <DatePicker
              id="interest-dob"
              value={form.date_of_birth}
              onChange={(value) => setForm((prev) => ({ ...prev, date_of_birth: value }))}
              placeholder="MM-DD-YYYY"
            />
          </FormField>

          <CountryCityFields
            country={form.country}
            city={form.city}
            onCountryChange={(v) => setForm((prev) => ({ ...prev, country: v }))}
            onCityChange={(v) => setForm((prev) => ({ ...prev, city: v }))}
            countryId="interest-country"
            cityId="interest-city"
            required
          />

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
            {/* Link to view an already-uploaded document */}
            {!idDocumentUpload.files.length && mySubmission?.id_document_url && (
              <a
                href={mySubmission.id_document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-block text-[12px] font-medium text-brand underline underline-offset-2 hover:no-underline"
              >
                View uploaded document
              </a>
            )}
          </div>

          {!isConfirmed && (
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Button
                  type="submit"
                  variant="orangeDialogWhite"
                  size="dialog"
                  disabled={!isOpen || isSubmitting}
                  className="w-full sm:w-[220px] sm:uppercase"
                >
                  {isSubmitting ? 'Submitting…' : isActive ? 'Update My Details' : "I'm Interested"}
                </Button>
                {isActive && (
                  <button
                    type="button"
                    onClick={handleWithdraw}
                    disabled={isWithdrawing}
                    className="w-full rounded-[6px] border border-red-500/40 bg-surface py-3 text-sm font-semibold text-red-300 transition hover:bg-red-950/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-[180px]"
                  >
                    {isWithdrawing ? 'Withdrawing…' : 'Withdraw'}
                  </button>
                )}
              </div>
            </div>
          )}
        </form>
      </Container>
    </div>
  );
}
