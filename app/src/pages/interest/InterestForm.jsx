import { useEffect, useRef, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { CLOUDFRONT_APP_BASE, MAX_ID_DOCUMENT_BYTES, MAX_PROFILE_PICTURE_BYTES } from '@/lib/constants/assets';
import { DEFAULT_COUNTRY } from '@/lib/constants/geo';
import { formatIsoDateForDisplay, toApiDate } from '@/lib/utils/dateUtils';
import { useGetCitiesQuery, useGetCountriesQuery } from '@/store/api/locationApi';
import {
  useGetInterestCampaignQuery,
  useSubmitInterestMutation,
  useWithdrawInterestMutation,
} from '@/store/api/tournamentInterestApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { DatePicker } from '@/ui/DatePicker';
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

const DEFAULT_AVATAR = `${CLOUDFRONT_APP_BASE}/images/standard/default-avatar.png`;

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

  const [form, setForm] = useState(EMPTY_FORM);

  const { data: countriesList = [] } = useGetCountriesQuery();
  const countryCode = countriesList.find((c) => c.name === form.country)?.country_code ?? null;
  const { data: citiesList = [] } = useGetCitiesQuery(countryCode, {
    skip: !countryCode,
  });

  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const profilePictureInputRef = useRef(null);

  const [idDocumentFile, setIdDocumentFile] = useState(null);
  const idDocumentInputRef = useRef(null);
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
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
    setErrors({});
    setIdDocumentFile(null);
  }, [payload, mySubmission, profileDefaults]);

  useEffect(() => {
    return () => {
      if (profilePicturePreview) URL.revokeObjectURL(profilePicturePreview);
    };
  }, [profilePicturePreview]);

  const onChange = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleProfilePictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file (e.g. JPG, PNG).');
      return;
    }
    if (file.size > MAX_PROFILE_PICTURE_BYTES) {
      toast.error('Profile picture must be smaller than 5MB.');
      return;
    }
    if (profilePicturePreview) URL.revokeObjectURL(profilePicturePreview);
    setProfilePictureFile(file);
    setProfilePicturePreview(URL.createObjectURL(file));
    clearError('picture');
  };

  const clearProfilePictureSelection = () => {
    if (profilePicturePreview) URL.revokeObjectURL(profilePicturePreview);
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
    if (profilePictureInputRef.current) {
      profilePictureInputRef.current.value = '';
    }
    clearError('picture');
  };

  const handleIdDocumentChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowed = ['image/', 'application/pdf'];
    if (!allowed.some((p) => file.type.startsWith(p))) {
      toast.error('ID document must be an image or PDF.');
      return;
    }
    if (file.size > MAX_ID_DOCUMENT_BYTES) {
      toast.error('ID document must be smaller than 10MB.');
      return;
    }
    setIdDocumentFile(file);
    clearError('idDocument');
  };

  const clearIdDocumentSelection = () => {
    setIdDocumentFile(null);
    if (idDocumentInputRef.current) {
      idDocumentInputRef.current.value = '';
    }
    clearError('idDocument');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isOpen || isSubmitting) return;

    const missPicture = needsProfilePictureUpload && !profilePictureFile;
    const missIdDocument = needsIdDocumentUpload && !idDocumentFile;
    if (missPicture || missIdDocument) {
      setErrors({
        ...(missPicture && { picture: PROFILE_PICTURE_REQUIRED_MSG }),
        ...(missIdDocument && { idDocument: ID_DOCUMENT_REQUIRED_MSG }),
      });
      return;
    }
    setErrors({});

    const normalized = {
      ...form,
      date_of_birth: toApiDate(form.date_of_birth),
    };

    const usesMultipart = !!profilePictureFile || !!idDocumentFile;
    let body;
    if (usesMultipart) {
      const fd = new FormData();
      Object.entries(normalized).forEach(([k, v]) => {
        const trimmed = typeof v === 'string' ? v.trim() : v;
        if (trimmed !== '' && trimmed != null) fd.append(k, trimmed);
      });
      if (profilePictureFile) {
        fd.append('profile_picture', profilePictureFile);
      }
      if (idDocumentFile) {
        fd.append('id_document', idDocumentFile);
      }
      body = fd;
    } else {
      body = Object.fromEntries(
        Object.entries(normalized)
          .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
          .filter(([, v]) => v !== ''),
      );
    }

    try {
      await submitInterest({ slug, body }).unwrap();
      toast.success(
        isActive ? 'Your interest details have been updated.' : 'Interest submitted. Our team will see your name shortly.',
      );
      clearProfilePictureSelection();
      clearIdDocumentSelection();
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
          <p className="py-8 text-center text-sm text-[#A2A6AB]">Loading interest form…</p>
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

  const existingPictureUrl = mySubmission?.profile_picture_url ?? profileDefaults?.avatar_url ?? null;
  const profilePictureSrc = profilePicturePreview ?? existingPictureUrl ?? DEFAULT_AVATAR;

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
              <p className="mb-4 text-[13px] leading-snug whitespace-pre-line text-[#A2A6AB] md:text-[14px]">
                {campaign.description}
              </p>
            )}
            {!isOpen && (
              <div className="rounded-[6px] border border-amber-500/45 bg-[#141412] p-4 shadow-[0_0_0_1px_rgba(251,191,36,0.12)]">
                <p className="text-[12px] leading-snug text-amber-200/95">
                  This interest form is closed. New submissions are not accepted.
                </p>
              </div>
            )}
          </div>
        )}

        {isConfirmed ? (
          <div className="mb-6 rounded-[6px] border border-[#DA9811]/45 bg-[#141412] p-4 text-center text-[12px] leading-snug font-semibold text-[#DA9811] shadow-[0_0_0_1px_rgba(218,152,17,0.12)]">
            Your spot is confirmed. Our team has accepted your interest — these are the details we have on file.
          </div>
        ) : isActive ? (
          <div className="mb-6 rounded-[6px] border border-emerald-700/45 bg-[#141412] p-4 text-center text-[12px] leading-snug text-emerald-200/95 shadow-[0_0_0_1px_rgba(16,185,129,0.1)]">
            You&apos;re already on the interest list. Update your details below or withdraw your interest.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4 lg:grid lg:grid-cols-2 lg:space-y-0 lg:gap-x-6 lg:gap-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="relative inline-block">
              <img
                src={profilePictureSrc}
                alt="Profile preview"
                className="h-24 w-24 rounded-full border-2 border-[#DA9811] bg-zinc-900 object-cover"
              />
              <span
                className="pointer-events-none absolute right-0 bottom-0 z-20 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#080807] bg-[#DA9811] text-[#080807] shadow-md"
                aria-hidden
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </span>
              <input
                id="interest-profile-picture"
                ref={profilePictureInputRef}
                type="file"
                accept="image/*"
                className="absolute inset-0 z-10 cursor-pointer rounded-full opacity-0"
                onChange={handleProfilePictureChange}
                aria-label="Choose profile picture"
              />
            </div>
            <p
              className={`max-w-[350px] text-center text-[12px] leading-snug ${errors.picture ? 'text-red-200' : 'text-[#A2A6AB]/90'}`}
              role={errors.picture ? 'alert' : undefined}
            >
              {errors.picture ??
                (needsProfilePictureUpload && !profilePictureFile
                  ? 'Add a profile picture (required). JPG or PNG, max 5MB.'
                  : 'Click the photo to change. JPG or PNG, max 5MB.')}
            </p>
            {profilePictureFile && (
              <button
                type="button"
                onClick={clearProfilePictureSelection}
                className="text-xs font-medium text-[#DA9811] underline hover:no-underline"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-[12px] font-bold tracking-wide text-[#A2A6AB] uppercase">Personal Details</h2>
            <p className="mt-1 text-[12px] leading-snug text-[#A2A6AB]/90">
              From your account. To change these, update your profile.
            </p>
          </div>

          <FormField label="Full Name" htmlFor="interest-name" required>
            <Input
              id="interest-name"
              type="text"
              value={form.name}
              placeholder="Your name"
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
              placeholder="Your nickname"
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
              placeholder="Phone / WhatsApp number"
              maxLength={30}
              autoComplete="tel"
              required
              readOnly
              aria-readonly
              className="cursor-default opacity-90"
            />
          </FormField>

          <div className="border-t border-[#FFFFFF14] pt-6 lg:col-span-2">
            <h2 className="text-[12px] font-bold tracking-wide text-[#A2A6AB] uppercase">Other Details</h2>
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

          <FormField label="Date of Birth" htmlFor="interest-dob" required>
            <DatePicker
              id="interest-dob"
              value={form.date_of_birth}
              onChange={(value) => setForm((prev) => ({ ...prev, date_of_birth: value }))}
              placeholder="MM-DD-YYYY"
            />
          </FormField>

          <FormField label="Country" htmlFor="interest-country" required>
            <Select value={form.country} onValueChange={(v) => setForm((prev) => ({ ...prev, country: v, city: '' }))}>
              <SelectTrigger id="interest-country" className={`w-full ${selectTriggerInputClass}`}>
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent className={`z-[100] ${selectContentInputClass}`} viewportClassName={selectViewportInputClass}>
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

          <FormField label="City" htmlFor="interest-city" required>
            <Select value={form.city} onValueChange={(v) => setForm((prev) => ({ ...prev, city: v }))}>
              <SelectTrigger id="interest-city" className={`w-full ${selectTriggerInputClass}`}>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent className={`z-[100] ${selectContentInputClass}`} viewportClassName={selectViewportInputClass}>
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

          <FormField
            label="CNIC or B-Form"
            htmlFor="interest-id-document"
            className="lg:col-span-2"
            required={needsIdDocumentUpload}
          >
            <input
              id="interest-id-document"
              ref={idDocumentInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleIdDocumentChange}
              aria-label="CNIC or B-Form"
              className="block w-full text-[13px] text-[#A2A6AB] file:mr-3 file:rounded-[6px] file:border-0 file:bg-[#141412] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#1a1a18]"
            />
            <p
              className={`mt-1 text-[12px] leading-snug ${errors.idDocument ? 'text-red-200' : 'text-[#A2A6AB]/90'}`}
              role={errors.idDocument ? 'alert' : undefined}
            >
              {errors.idDocument ??
                (needsIdDocumentUpload && !idDocumentFile
                  ? 'Upload your CNIC or B-Form (required). Image or PDF, max 10MB.'
                  : 'Image or PDF, max 10MB.')}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] leading-snug text-[#A2A6AB]/80">
              {idDocumentFile ? (
                <>
                  <span className="truncate">Selected: {idDocumentFile.name}</span>
                  <button
                    type="button"
                    onClick={clearIdDocumentSelection}
                    className="text-xs font-medium text-[#DA9811] underline hover:no-underline"
                  >
                    Clear
                  </button>
                </>
              ) : mySubmission?.id_document_url ? (
                <>
                  <span>Uploaded</span>
                  <a
                    href={mySubmission.id_document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-[#DA9811] underline hover:no-underline"
                  >
                    View Current
                  </a>
                </>
              ) : null}
            </div>
          </FormField>

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
                    className="w-full rounded-[6px] border border-red-500/40 bg-[#141412] py-3 text-sm font-semibold text-red-300 transition hover:bg-red-950/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-[180px]"
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
