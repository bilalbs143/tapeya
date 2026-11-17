import { z } from 'zod';

import { unwrapData } from '@/shared/api/unwrap';
import { DEFAULT_COUNTRY } from '@/shared/model/location';

/** Matches API `TournamentInterestFormFieldEnum` — user/account fields. */

export const INTEREST_FORM_FIELDS = [
  'profile_picture',
  'name',
  'nickname',
  'phone',
  'email',
  'date_of_birth',
  'country',
  'city',
  'id_document',
] as const;

export type InterestFormField = (typeof INTEREST_FORM_FIELDS)[number];

export const CUSTOM_FIELD_TYPES = ['text', 'select', 'file'] as const;
export type InterestCustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number];

export type InterestCustomField = {
  id: string;
  type: InterestCustomFieldType;
  label: string;
  required: boolean;
  options: string[];
};

export const READ_ONLY_FIELDS: InterestFormField[] = ['name', 'nickname', 'phone'];

export type CampaignStatus = 'open' | 'closed';
export type SubmissionStatus = 'pending' | 'confirmed';

const customFieldWireSchema = z.object({
  id: z.string(),
  type: z.enum(CUSTOM_FIELD_TYPES),
  label: z.string(),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
});

const campaignWireSchema = z.object({
  id: z.number(),
  tournament_id: z.number().nullable().optional(),
  is_linked: z.boolean().optional(),
  tournament_name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  form_fields: z.array(z.string()).optional(),
  custom_fields: z.array(customFieldWireSchema).optional(),
  logo_url: z.string().nullable().optional(),
  show_in_sidebar: z.boolean().optional(),
  show_dialog: z.boolean().optional(),
  status: z.enum(['open', 'closed']),
  status_label: z.string().nullable().optional(),
});

export const submissionWireSchema = z.object({
  id: z.number(),
  campaign_id: z.number().optional(),
  name: z.string().nullable().optional(),
  nickname: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  custom_answers: z.record(z.string(), z.string().nullable()).optional(),
  date_of_birth: z.string().nullable().optional(),
  profile_picture_url: z.string().nullable().optional(),
  id_document_url: z.string().nullable().optional(),
  status: z.enum(['pending', 'confirmed']),
  status_label: z.string().nullable().optional(),
});

const profileDefaultsWireSchema = z.object({
  name: z.string().nullable().optional(),
  nickname: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
});

const showPayloadWireSchema = z.object({
  campaign: campaignWireSchema,
  my_submission: submissionWireSchema.nullable().optional(),
  profile_defaults: profileDefaultsWireSchema.nullable().optional(),
});

export type InterestCampaign = {
  id: number;
  slug: string;
  tournamentName: string;
  description: string | null;
  formFields: InterestFormField[];
  customFields: InterestCustomField[];
  logoUrl: string | null;
  status: CampaignStatus;
};

export type InterestSubmission = {
  id: number;
  name: string | null;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  customAnswers: Record<string, string | null>;
  dateOfBirth: string | null;
  profilePictureUrl: string | null;
  idDocumentUrl: string | null;
  status: SubmissionStatus;
};

export type InterestProfileDefaults = {
  name: string | null;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
};

export type InterestShowPayload = {
  campaign: InterestCampaign;
  mySubmission: InterestSubmission | null;
  profileDefaults: InterestProfileDefaults | null;
};

const dialogCampaignWireSchema = z.object({
  slug: z.string(),
  tournament_name: z.string(),
  logo_url: z.string().nullable().optional(),
  my_submission_status: z.enum(['pending', 'confirmed']).optional(),
});

const dialogPayloadWireSchema = z.object({
  campaign: dialogCampaignWireSchema.nullable(),
});

export type InterestDialogCampaign = {
  slug: string;
  tournamentName: string;
  logoUrl: string | null;
  mySubmissionStatus: SubmissionStatus | null;
};

export type InterestDialogPayload = {
  campaign: InterestDialogCampaign | null;
};

function resolveFormFields(raw: string[] | undefined): InterestFormField[] {
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.filter((f): f is InterestFormField => (INTEREST_FORM_FIELDS as readonly string[]).includes(f));
  }
  return [...INTEREST_FORM_FIELDS];
}

/** Fixed CNIC form field rendered with the same file UI as custom file fields. */
export const ID_DOCUMENT_CUSTOM_FIELD: InterestCustomField = {
  id: 'id_document',
  type: 'file',
  label: 'CNIC / B-Form',
  required: true,
  options: [],
};

function resolveCustomFields(raw: z.infer<typeof customFieldWireSchema>[] | undefined): InterestCustomField[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(
      (f) => f.id && f.id !== 'id_document' && f.label && (CUSTOM_FIELD_TYPES as readonly string[]).includes(f.type)
    )
    .map((f) => ({
      id: f.id,
      type: f.type,
      label: f.label,
      required: f.required !== false,
      options: (f.options ?? []).map((o) => o.trim()).filter(Boolean),
    }));
}

/** Custom fields plus CNIC when enabled on form_fields. */
export function interestRenderableCustomFields(
  campaign: Pick<InterestCampaign, 'formFields' | 'customFields'>
): InterestCustomField[] {
  const fields = campaign.customFields.filter((f) => f.id !== 'id_document');
  if (fieldEnabled(campaign.formFields, 'id_document')) {
    return [ID_DOCUMENT_CUSTOM_FIELD, ...fields];
  }
  return fields;
}

function campaignToDomain(wire: z.infer<typeof campaignWireSchema>): InterestCampaign {
  return {
    id: wire.id,
    slug: wire.slug,
    tournamentName: wire.tournament_name,
    description: wire.description ?? null,
    formFields: resolveFormFields(wire.form_fields),
    customFields: resolveCustomFields(wire.custom_fields),
    logoUrl: wire.logo_url ?? null,
    status: wire.status,
  };
}

export function submissionToDomain(wire: z.infer<typeof submissionWireSchema>): InterestSubmission {
  const customAnswers: Record<string, string | null> = { ...(wire.custom_answers ?? {}) };
  // Mirror dedicated column onto answers so file UI can treat CNIC like other file fields.
  const idDocumentUrl = wire.id_document_url ?? customAnswers.id_document ?? null;
  if (idDocumentUrl) {
    customAnswers.id_document = idDocumentUrl;
  }

  return {
    id: wire.id,
    name: wire.name ?? null,
    nickname: wire.nickname ?? null,
    email: wire.email ?? null,
    phone: wire.phone ?? null,
    country: wire.country ?? null,
    city: wire.city ?? null,
    customAnswers,
    dateOfBirth: wire.date_of_birth ?? null,
    profilePictureUrl: wire.profile_picture_url ?? null,
    idDocumentUrl,
    status: wire.status,
  };
}

/** Existing uploaded file URL for a renderable custom/file field (incl. form-field CNIC). */
export function existingCustomFileUrl(
  submission: Pick<InterestSubmission, 'customAnswers'> | null | undefined,
  fieldId: string
): string | null {
  const raw = submission?.customAnswers?.[fieldId];
  return typeof raw === 'string' && raw.trim() ? raw : null;
}

function defaultsToDomain(
  wire: z.infer<typeof profileDefaultsWireSchema> | null | undefined
): InterestProfileDefaults | null {
  if (!wire) return null;
  return {
    name: wire.name ?? null,
    nickname: wire.nickname ?? null,
    email: wire.email ?? null,
    phone: wire.phone ?? null,
    country: wire.country ?? null,
    city: wire.city ?? null,
    dateOfBirth: wire.date_of_birth ?? null,
    avatarUrl: wire.avatar_url ?? null,
  };
}

export function parseInterestShow(raw: unknown): InterestShowPayload {
  const wire = unwrapData(showPayloadWireSchema)(raw);
  return {
    campaign: campaignToDomain(wire.campaign),
    mySubmission: wire.my_submission ? submissionToDomain(wire.my_submission) : null,
    profileDefaults: defaultsToDomain(wire.profile_defaults),
  };
}

export function parseInterestDialog(raw: unknown): InterestDialogPayload {
  const wire = unwrapData(dialogPayloadWireSchema)(raw);
  if (!wire.campaign) return { campaign: null };
  return {
    campaign: {
      slug: wire.campaign.slug,
      tournamentName: wire.campaign.tournament_name,
      logoUrl: wire.campaign.logo_url ?? null,
      mySubmissionStatus: wire.campaign.my_submission_status ?? null,
    },
  };
}

export function parseInterestSubmission(raw: unknown): InterestSubmission {
  return submissionToDomain(unwrapData(submissionWireSchema)(raw));
}

export function fieldEnabled(fields: InterestFormField[], key: InterestFormField): boolean {
  return fields.includes(key);
}

/** UI form values — camelCase; DOB is ISO `YYYY-MM-DD` for DatePicker. */

export type InterestFormValues = {
  name: string;
  nickname: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  country: string;
  city: string;
  customAnswers: Record<string, string>;
};

export function seedFormValues(
  submission: InterestSubmission | null,
  defaults: InterestProfileDefaults | null,
  customFields: InterestCustomField[] = []
): InterestFormValues {
  const source = submission ?? null;
  const d = defaults;
  const customAnswers: Record<string, string> = {};
  for (const field of customFields) {
    if (field.type === 'file') continue;
    const raw = source?.customAnswers?.[field.id];
    customAnswers[field.id] = typeof raw === 'string' ? raw : '';
  }

  return {
    name: source?.name ?? d?.name ?? '',
    nickname: source?.nickname ?? d?.nickname ?? '',
    phone: source?.phone ?? d?.phone ?? '',
    email: source?.email ?? d?.email ?? '',
    dateOfBirth: source?.dateOfBirth ?? d?.dateOfBirth ?? '',
    country: (source?.country ?? d?.country ?? DEFAULT_COUNTRY).trim() || DEFAULT_COUNTRY,
    city: source?.city ?? d?.city ?? '',
    customAnswers,
  };
}

export type InterestSubmitBody = {
  name?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  date_of_birth?: string;
  custom_answers?: Record<string, string>;
};

export function toSubmitWire(
  values: InterestFormValues,
  fields: InterestFormField[],
  customFields: InterestCustomField[] = []
): InterestSubmitBody {
  const body: InterestSubmitBody = {};
  const put = (enabled: InterestFormField, key: keyof InterestSubmitBody, value: string) => {
    if (!fieldEnabled(fields, enabled)) return;
    const trimmed = value.trim();
    if (trimmed) (body as Record<string, unknown>)[key] = trimmed;
  };
  put('name', 'name', values.name);
  put('nickname', 'nickname', values.nickname);
  put('phone', 'phone', values.phone);
  put('email', 'email', values.email);
  put('country', 'country', values.country);
  put('city', 'city', values.city);
  put('date_of_birth', 'date_of_birth', values.dateOfBirth);

  const answers: Record<string, string> = {};
  for (const field of customFields) {
    if (field.type === 'file') continue;
    const trimmed = (values.customAnswers[field.id] ?? '').trim();
    if (trimmed) answers[field.id] = trimmed;
  }
  if (Object.keys(answers).length) {
    body.custom_answers = answers;
  }

  return body;
}
