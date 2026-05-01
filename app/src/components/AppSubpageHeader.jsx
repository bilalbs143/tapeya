import { useNavigate } from 'react-router-dom';

/** Shared class for the white circular back control (use when a page needs only the button). */
export const appSubpageBackButtonClassName =
  'flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80';

function BackChevron() {
  return (
    <svg
      className="h-5 w-5"
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
 * White circular back button with the standard chevron (matches scorecard / shop / drafting headers).
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

const stringTitleClass =
  'min-w-0 flex-1 pr-[27px] text-center text-[16px] font-bold tracking-wide text-white uppercase';

/**
 * Black app subpage header: back (left) + centered title. Title uses optical centering (`pr-[27px]`) to balance the 27px back control.
 *
 * @param {React.ReactNode} title – Plain string/number becomes the default uppercase title; otherwise rendered inside the centered column.
 * @param {() => void} [onBack] – Defaults to `navigate(-1)`.
 * @param {boolean} [sticky] – Sticky bar with compact vertical padding (e.g. forms).
 * @param {'default' | 'relaxed' | 'compact'} [bottomSpacing] – `relaxed` → `pb-6`; `compact` → `pb-2` (shop filter rails).
 * @param {string} [className] – Merged onto `<header>` (e.g. `-mx-4 -mt-6 lg:mt-0`).
 * @param {string} [titleClassName] – Extra classes when `title` is a string or number (e.g. `truncate`).
 * @param {string} [titleWrapClassName] – Classes for the centered wrapper when `title` is a React node (default balances the 27px back button).
 * @param {string} [backClassName] – Extra classes on the back button (avoid size overrides — keep 27×27 + chevron consistent app-wide).
 * @param {React.ReactNode} [trailing] – Optional right slot (e.g. width spacer so the title stays visually centered).
 * @param {string} [backAriaLabel] – `aria-label` on the back button (default `Back`).
 */
export function AppSubpageHeader({
  title,
  onBack,
  sticky = false,
  bottomSpacing = 'default',
  className = '',
  titleClassName = '',
  titleWrapClassName = 'min-w-0 flex-1 pr-[27px] text-center',
  backClassName = '',
  trailing = null,
  backAriaLabel,
}) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  const spacing = sticky
    ? 'sticky top-0 z-10 py-4'
    : bottomSpacing === 'relaxed'
      ? 'pt-6 pb-6'
      : bottomSpacing === 'compact'
        ? 'pt-6 pb-2'
        : 'pt-6 pb-4';

  const stringHeadingClass =
    trailing != null
      ? `min-w-0 flex-1 text-center text-[16px] font-bold tracking-wide text-white uppercase ${titleClassName}`.trim()
      : `${stringTitleClass} ${titleClassName}`.trim();

  const titleSlot =
    typeof title === 'string' || typeof title === 'number' ? (
      <h1 className={stringHeadingClass}>{title}</h1>
    ) : (
      <div className={titleWrapClassName.trim()}>{title}</div>
    );

  return (
    <header
      className={`flex items-center gap-3 bg-black px-4 ${spacing} ${className}`.trim()}
    >
      <AppSubpageBackButton
        onClick={handleBack}
        className={backClassName.trim()}
        aria-label={backAriaLabel ?? 'Back'}
      />
      {titleSlot}
      {trailing}
    </header>
  );
}
