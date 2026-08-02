/**
 * Compact Explore | Following segmented control — same language as Reels tabs
 * (icon-only when idle, brand pill + label when active).
 */

export default function FeedTabs({ tabs, activeId, onChange, isTabDisabled, className = '' }) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-0.5 rounded-full border border-white/12 bg-black/55 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md ${className}`}
      role="tablist"
      aria-label="Feed"
    >
      {tabs.map((t) => {
        const disabled = Boolean(isTabDisabled?.(t.id));
        const active = activeId === t.id;
        const Icon = t.Icon;
        const label = t.shortLabel || t.label;

        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={t.label}
            title={t.label}
            disabled={disabled}
            onClick={() => onChange(t.id)}
            className={`flex items-center justify-center gap-1.5 rounded-full text-[12px] font-semibold tracking-wide transition-all duration-200 ${
              active
                ? 'bg-brand text-ink min-w-0 flex-1 px-3 py-2 shadow-sm'
                : 'size-9 shrink-0 text-white/65 hover:bg-white/10 hover:text-white'
            } ${disabled ? 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-white/65' : ''}`}
          >
            {Icon ? <Icon className="size-4 shrink-0" /> : null}
            {active ? <span className="truncate">{label}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
