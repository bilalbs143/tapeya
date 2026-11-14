import {
  existingCustomFileUrl,
  fieldEnabled,
  type InterestCampaign,
  type InterestFormValues,
  interestRenderableCustomFields,
  type InterestSubmission,
} from '../model/schemas';

export type InterestFormFieldErrors = Partial<
  Record<'email' | 'avatar' | 'dateOfBirth' | 'city' | 'country', string>
> & {
  custom?: Record<string, string>;
};

export function interestNeedsAvatar(
  campaign: Pick<InterestCampaign, 'formFields'>,
  activeSubmission: Pick<InterestSubmission, 'profilePictureUrl'> | null,
  profileAvatarUrl: string | null | undefined
): boolean {
  return (
    fieldEnabled(campaign.formFields, 'profile_picture') && !activeSubmission?.profilePictureUrl && !profileAvatarUrl
  );
}

function hasCustomFile(
  file: File | null | undefined,
  url: string | null | undefined,
  existing: string | null | undefined
): boolean {
  return !!(file || url?.trim() || existing?.trim());
}

export function validateInterestForm(args: {
  campaign: Pick<InterestCampaign, 'formFields' | 'customFields'>;
  values: InterestFormValues;
  needsAvatar: boolean;
  avatarFile: File | null;
  avatarPreview: string | null;
  customFiles: Record<string, File | null>;
  customFileUrls: Record<string, string | null>;
  activeSubmission: Pick<InterestSubmission, 'customAnswers'> | null;
}): InterestFormFieldErrors {
  const { campaign, values, needsAvatar, avatarFile, avatarPreview, customFiles, customFileUrls, activeSubmission } =
    args;
  const next: InterestFormFieldErrors = {};
  const custom: Record<string, string> = {};

  if (needsAvatar && !avatarFile && !avatarPreview) {
    next.avatar = 'A picture is required for this campaign.';
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

  for (const field of interestRenderableCustomFields(campaign)) {
    if (!field.required) continue;

    if (field.type === 'file') {
      if (
        !hasCustomFile(
          customFiles[field.id],
          customFileUrls[field.id],
          existingCustomFileUrl(activeSubmission, field.id)
        )
      ) {
        custom[field.id] = `${field.label} is required.`;
      }
      continue;
    }

    if (!(values.customAnswers[field.id] ?? '').trim()) {
      custom[field.id] = `${field.label} is required.`;
    }
  }

  if (Object.keys(custom).length) next.custom = custom;
  return next;
}

export function clearCustomFieldError(errors: InterestFormFieldErrors, fieldId: string): InterestFormFieldErrors {
  if (!errors.custom?.[fieldId]) return errors;
  const custom = Object.fromEntries(Object.entries(errors.custom).filter(([id]) => id !== fieldId));
  const next: InterestFormFieldErrors = { ...errors, custom };
  if (!Object.keys(custom).length) {
    Reflect.deleteProperty(next, 'custom');
  }
  return next;
}
