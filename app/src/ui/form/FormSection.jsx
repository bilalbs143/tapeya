import { FORM_SECTION_DIVIDER_CLASS, FORM_SECTION_SUBTITLE_CLASS, FORM_SECTION_TITLE_CLASS } from '@/lib/constants/formLayout';

/**
 * Titled form section with optional top divider.
 * Nest fields inside; place multiple sections inside a FormStack.
 */
export function FormSection({ title, subtitle, divider = false, titleClassName = '', className = '', children }) {
  const resolvedTitleClass = titleClassName || FORM_SECTION_TITLE_CLASS;

  return (
    <section className={`flex flex-col gap-6 ${divider ? FORM_SECTION_DIVIDER_CLASS : ''} ${className}`.trim()}>
      {title ? (
        <div>
          <h2 className={resolvedTitleClass}>{title}</h2>
          {subtitle ? <p className={FORM_SECTION_SUBTITLE_CLASS}>{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
