import { FORM_ACTIONS_ALIGN, FORM_ACTIONS_BASE_CLASS } from '@/lib/constants/formLayout';

/**
 * Submit / secondary button row for forms.
 *
 * @param {'start' | 'end' | 'between' | 'stack'} [align='start']
 */
export function FormActions({ align = 'start', className = '', children }) {
  const alignClass =
    align === 'stack' ? 'flex flex-col gap-3 pt-2' : `${FORM_ACTIONS_BASE_CLASS} ${FORM_ACTIONS_ALIGN[align] ?? ''}`;

  return <div className={`${alignClass} ${className}`.trim()}>{children}</div>;
}
