/** Matches API `TournamentInterestFormFieldEnum`. */
export const DEFAULT_INTEREST_FORM_FIELDS = [
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

export function resolveInterestFormFields(campaign) {
  const fields = campaign?.form_fields;
  if (Array.isArray(fields) && fields.length > 0) return fields;
  return DEFAULT_INTEREST_FORM_FIELDS;
}

export function interestFormFieldEnabled(formFields, key) {
  return formFields.includes(key);
}
