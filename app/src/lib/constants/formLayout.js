/**
 * Form layout spacing tokens — single source of truth.
 * See docs/FORM_LAYOUT_STANDARDS.md
 */

/** Label → control spacing lives on the field wrapper (`gap-2`), not the label. */
export const FORM_FIELD_LABEL_CLASS = 'block text-[14px] text-muted';

export const FORM_FIELD_WRAPPER_CLASS = 'flex flex-col gap-2';

export const FORM_FIELD_ERROR_CLASS = 'text-sm text-red-200';

export const FORM_FIELD_REQUIRED_CLASS = 'text-red-300';

export const FORM_HELPER_TEXT_CLASS = 'text-[12px] text-muted';

export const FORM_STACK_DENSITY = {
  default: 'gap-6',
  compact: 'gap-4',
};

export const FORM_STACK_LAYOUT = {
  stack: 'flex flex-col',
  'grid-2': 'flex flex-col lg:grid lg:grid-cols-2 lg:space-y-0 lg:gap-x-6 lg:gap-y-6',
  'grid-3': 'flex flex-col lg:grid lg:grid-cols-3 lg:space-y-0 lg:gap-6',
};

export const FORM_SECTION_DIVIDER_CLASS = 'border-t border-[#FFFFFF14] pt-6';

export const FORM_SECTION_TITLE_CLASS = 'text-base font-bold text-white';

export const FORM_SECTION_MUTED_TITLE_CLASS = 'text-muted text-[12px] font-bold tracking-wide uppercase';

export const FORM_SECTION_SUBTITLE_CLASS = 'text-muted/90 mt-1 text-[12px] leading-snug';

export const FORM_ACTIONS_BASE_CLASS = 'flex flex-col gap-3 pt-2 sm:flex-row sm:items-center';

export const FORM_ACTIONS_ALIGN = {
  start: 'sm:justify-start',
  end: 'sm:justify-end',
  between: 'sm:justify-between',
  stack: '',
};

export const DIALOG_FORM_SECTION_LABEL_CLASS = 'text-[13px] font-medium text-white';

export const DIALOG_FORM_CONTROL_OFFSET = {
  sm: 'mt-2',
  md: 'mt-3',
};

export const COUNTRY_CITY_DENSITY = {
  default: 'gap-4',
  relaxed: 'gap-6',
};
