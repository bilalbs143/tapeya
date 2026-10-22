import {
  fieldEnabled,
  type InterestCampaign,
  type InterestFormValues,
  type InterestSubmission,
} from '../model/schemas';

export type InterestFormFieldErrors = Partial<
  Record<'email' | 'avatar' | 'doc' | 'dateOfBirth' | 'city' | 'country', string>
>;

export function interestNeedsAvatar(
  campaign: Pick<InterestCampaign, 'formFields'>,
  activeSubmission: Pick<InterestSubmission, 'profilePictureUrl'> | null,
  profileAvatarUrl: string | null | undefined
): boolean {
  return (
    fieldEnabled(campaign.formFields, 'profile_picture') && !activeSubmission?.profilePictureUrl && !profileAvatarUrl
  );
}

export function interestNeedsDoc(
  campaign: Pick<InterestCampaign, 'formFields'>,
  activeSubmission: Pick<InterestSubmission, 'idDocumentUrl'> | null
): boolean {
  return fieldEnabled(campaign.formFields, 'id_document') && !activeSubmission?.idDocumentUrl;
}

export function validateInterestForm(args: {
  campaign: Pick<InterestCampaign, 'formFields'>;
  values: InterestFormValues;
  needsAvatar: boolean;
  needsDoc: boolean;
  avatarFile: File | null;
  avatarPreview: string | null;
  docFile: File | null;
  docUrl: string | null;
}): InterestFormFieldErrors {
  const { campaign, values, needsAvatar, needsDoc, avatarFile, avatarPreview, docFile, docUrl } = args;
  const next: InterestFormFieldErrors = {};

  if (needsAvatar && !avatarFile && !avatarPreview) {
    next.avatar = 'A picture is required for this campaign.';
  }
  if (needsDoc && !docFile && !docUrl) {
    next.doc = 'This campaign needs your CNIC or B-Form.';
  }
  if (fieldEnabled(campaign.formFields, 'email') && values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    next.email = "That email doesn't look right.";
  }
  if (fieldEnabled(campaign.formFields, 'date_of_birth') && !values.dateOfBirth.trim()) {
    next.dateOfBirth = 'Date of birth is required.';
  }
  if (fieldEnabled(campaign.formFields, 'country') && !values.country.trim()) {
    next.country = 'Country is required.';
  }
  if (fieldEnabled(campaign.formFields, 'city') && !values.city.trim()) {
    next.city = 'City is required.';
  }

  return next;
}
