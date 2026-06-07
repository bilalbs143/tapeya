/**
 * Reusable radio-style option list used across scoring dialogs.
 * Renders a `<ul role="radiogroup">` with gold dot indicators.
 *
 * @param {{ value: string, label: string }[]} options
 * @param {string}   value          Currently selected value
 * @param {Function} onChange       Called with the new value on select
 * @param {string}   [ariaLabel]    Accessible label for the group
 * @param {string}   [className]    Extra class on the outer `<ul>`
 */
export function RadioOptionList({ options, value, onChange, ariaLabel, className = '' }) {
  return (
    <ul className={`flex flex-col gap-2 ${className}`} role="radiogroup" aria-label={ariaLabel}>
      {options.length === 0 && <li className="text-[13px] text-muted">Loading options…</li>}
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <li key={opt.value}>
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={`flex w-full items-center gap-3 rounded-[10px] border-2 px-4 py-3 text-left text-[13px] text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                selected ? 'border-brand bg-surface-raised' : 'border-[#141412] bg-surface'
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                  selected ? 'border-brand' : 'border-[#A2A6AB]'
                }`}
                aria-hidden
              >
                {selected ? <span className="h-2 w-2 rounded-full bg-brand" /> : null}
              </span>
              {opt.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
