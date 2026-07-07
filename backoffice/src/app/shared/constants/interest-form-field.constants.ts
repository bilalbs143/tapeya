/** Matches API `TournamentInterestFormFieldEnum` — keep values in sync. */
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
