/** Default legal run values for circular pickers (0–6). */
const RUN_PICKER_OPTIONS = [0, 1, 2, 3, 4, 5, 6];

const CIRCLE_CLASS =
  'flex aspect-square min-w-0 flex-1 cursor-pointer items-center justify-center rounded-full text-[14px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DA9811]';

/**
 * Compact single-row circular run picker (0–6).
 *
 * @param {number|null|undefined} value
 * @param {Function} onChange
 * @param {number[]} [options]
 * @param {string} [className]
 */
export function RunPickerRow({ value, onChange, options = RUN_PICKER_OPTIONS, className = '' }) {
  return (
    <div className={`flex w-full gap-1.5 ${className}`.trim()}>
      {options.map((n) => {
        const selected = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={selected}
            aria-label={`${n} run${n !== 1 ? 's' : ''}`}
            className={`${CIRCLE_CLASS} ${selected ? 'bg-[#DA9811] text-black' : 'bg-[#141412] text-white'}`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Same layout as {@link RunPickerRow} — fires onSelect immediately (no selected state).
 *
 * @param {Function} onSelect
 * @param {boolean} [disabled]
 * @param {number[]} [options]
 * @param {string} [className]
 */
export function RunPickerActionRow({ onSelect, disabled = false, options = RUN_PICKER_OPTIONS, className = '' }) {
  return (
    <div className={`flex w-full gap-1.5 ${className}`.trim()}>
      {options.map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(n)}
          className={`${CIRCLE_CLASS} border border-[#282824] bg-[#141412] text-white transition-opacity hover:bg-[#1C1C1A] active:opacity-80 disabled:pointer-events-none disabled:opacity-50`}
          aria-label={`${n} run${n !== 1 ? 's' : ''}`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
