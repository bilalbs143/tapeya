import { AppSubpageBackButton } from '@/components/AppSubpageHeader';

/**
 * Scoring match page header — back on the left, optional trailing actions on the right.
 * Tabs render as `children` directly below the action row.
 */
export function ScoringMatchHeader({ onBack, trailing = null, children = null }) {
  return (
    <header className="bg-black">
      <div className="flex items-center justify-between gap-3 px-4 py-1">
        <AppSubpageBackButton onClick={onBack} />
        {trailing ? <div className="flex shrink-0 items-center gap-2">{trailing}</div> : null}
      </div>

      {children}
    </header>
  );
}
