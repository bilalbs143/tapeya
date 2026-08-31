/**
 * Shared All / Yes / No options for three-state boolean filters on list pages
 * (`filter[is_active]`, `filter[is_special_offer]`, etc.).
 *
 * Values match Spatie `AllowedFilter::exact` on boolean columns where the API
 * accepts "yes"/"no" (or leave empty for All). Prefer this over hand-rolling
 * mat-option triples so every boolean filter looks identical.
 *
 * @see backoffice/docs/list-pages-filter-search-strategy.md Part 1 §6
 */
export const ALL_YES_NO_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
] as const;

export type AllYesNoFilterValue = (typeof ALL_YES_NO_FILTER_OPTIONS)[number]['value'];
