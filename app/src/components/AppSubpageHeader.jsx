import { useNavigate } from 'react-router-dom';

/**
 * Standard circular back button used throughout the app.
 * Exported for pages that render it in an overlay or custom layout
 * (e.g. tournament hero image, live-scoring screen).
 */
export const appSubpageBackButtonClassName =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#1a1a18] transition-opacity active:opacity-80';

function BackChevron() {
  return (
    <svg
      className="h-[14px] w-[14px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 19l-7-7 7-7" />
    </svg>
  );
}

/**
 * White circular back button — use directly only when the full header
 * cannot be used (overlay layouts, custom match headers, etc.).
 */
export function AppSubpageBackButton({
  onClick,
  className = '',
  'aria-label': ariaLabel = 'Back',
  ...rest
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${appSubpageBackButtonClassName} ${className}`.trim()}
      aria-label={ariaLabel}
      {...rest}
    >
      <BackChevron />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AppSubpageHeader
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The single, standardised page-level header for every subpage.
 *
 * Layout (always 3-column flex):
 *   [back 36×36] | [title — optically centred] | [right 36×36 or invisible spacer]
 *
 * Always render this component at the TOP of the page root, OUTSIDE of any
 * Container wrapper. The Container below provides the consistent 24px top gap
 * between the header and the first piece of content.
 *
 * ─── Props ───────────────────────────────────────────────────────────────────
 *
 * title          {string|ReactNode}  Page title.
 *                  • string/number → rendered as <h1> in uppercase bold white.
 *                  • ReactNode     → wrapped in a centred flex column.
 *
 * subtitle       {string}           Optional inline suffix: "Title - Subtitle".
 *                                   Same size/weight as title, gold (#DA9811),
 *                                   normal-case. Only applies when title is a
 *                                   string/number.
 *
 * onBack         {function}         Defaults to navigate(-1).
 *
 * right          {ReactNode}        Optional right-side slot (search icon,
 *                                   filter button, etc.). Must be 36×36 for
 *                                   proper optical balance. When omitted an
 *                                   invisible same-size spacer keeps the title
 *                                   centred.
 *
 * sticky         {boolean}          Makes the header sticky (top-0 z-20) for
 *                                   long-form pages (Support, StaticPage, etc.)
 *
 * divider        {boolean}          Adds a subtle bottom border separator.
 *
 * className      {string}           Extra classes merged onto <header>.
 * titleClassName {string}           Extra classes on the string title <h1>.
 * backClassName  {string}           Extra classes on the back button.
 * backAriaLabel  {string}           aria-label on the back button.
 */
export function AppSubpageHeader({
  title,
  subtitle,
  onBack,
  sticky = false,
  divider = false,
  right = null,
  className = '',
  titleClassName = '',
  backClassName = '',
  backAriaLabel,
}) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  // Fixed height: py-1 + h-9 (36px) — consistent everywhere.
  const headerClass = [
    'flex items-center gap-3 bg-black px-4 py-1',
    sticky ? 'sticky top-0 z-20' : '',
    divider ? 'border-b border-white/10' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const baseStringClass =
    'min-w-0 flex-1 text-center text-[16px] font-bold tracking-wide text-white uppercase';

  const titleSlot =
    typeof title === 'string' || typeof title === 'number' ? (
      subtitle ? (
        <h1 className={`${baseStringClass} ${titleClassName}`.trim()}>
          <span className="text-white">{title}</span>
          <span className="mx-1 text-white/40">-</span>
          <span className="text-[#DA9811] normal-case">{subtitle}</span>
        </h1>
      ) : (
        <h1 className={`${baseStringClass} ${titleClassName}`.trim()}>
          {title}
        </h1>
      )
    ) : (
      <div className="min-w-0 flex-1 text-center">{title}</div>
    );

  // Invisible spacer keeps title optically centred when no right slot is given.
  const rightElement = right ?? (
    <span className="h-7 w-7 shrink-0" aria-hidden />
  );

  return (
    <header className={headerClass}>
      <AppSubpageBackButton
        onClick={handleBack}
        className={backClassName}
        aria-label={backAriaLabel ?? 'Back'}
      />
      {titleSlot}
      {rightElement}
    </header>
  );
}
