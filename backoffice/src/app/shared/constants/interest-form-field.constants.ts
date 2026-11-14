/** Matches API `TournamentInterestFormFieldEnum` — user/account fields only. */
export type InterestFormFieldKey =
  | 'profile_picture'
  | 'name'
  | 'nickname'
  | 'phone'
  | 'email'
  | 'date_of_birth'
  | 'country'
  | 'city'
  | 'id_document';

/** Matches API `TournamentInterestCustomFieldTypeEnum`. */
export type InterestCustomFieldType = 'text' | 'select' | 'file';

/** Id is server-assigned from the label; optional in admin payloads. */
export type InterestCustomField = {
  id?: string;
  type: InterestCustomFieldType;
  label: string;
  required: boolean;
  options?: string[];
};

/** Always stored on submissions — cannot be disabled in the admin UI. */
export const LOCKED_INTEREST_FORM_FIELDS: InterestFormFieldKey[] = ['name'];

export const DEFAULT_INTEREST_FORM_FIELDS: InterestFormFieldKey[] = [
  'profile_picture',
  'name',
  'nickname',
  'phone',
  'email',
  'date_of_birth',
  'country',
  'city',
  'id_document',
];

/** Campaign-specific extras only — CNIC is a form_fields checkbox. */
export const DEFAULT_INTEREST_CUSTOM_FIELDS: InterestCustomField[] = [];
