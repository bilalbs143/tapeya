import { DIALOG_FORM_CONTROL_OFFSET, DIALOG_FORM_SECTION_LABEL_CLASS } from '@/lib/constants/formLayout';

/**
 * Scoring / picker dialog section with white label and consistent control offset.
 * Use instead of bespoke `text-[13px]` + `mt-2` / `mt-3` markup.
 *
 * @param {'sm' | 'md'} [controlOffset='md'] — sm=8px, md=12px below label
 */
export function DialogFormSection({ label, labelId, controlOffset = 'md', className = '', children }) {
  const offsetClass = DIALOG_FORM_CONTROL_OFFSET[controlOffset] ?? DIALOG_FORM_CONTROL_OFFSET.md;

  return (
    <section className={className}>
      {label ? (
        <p id={labelId} className={DIALOG_FORM_SECTION_LABEL_CLASS}>
          {label}
        </p>
      ) : null}
      <div className={label ? offsetClass : undefined}>{children}</div>
    </section>
  );
}
