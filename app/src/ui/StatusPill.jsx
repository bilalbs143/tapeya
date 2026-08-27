import { cn } from '@/lib/utils/cn';

const TONES = {
  brand: 'bg-brand/15 text-brand border-brand/25',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  danger: 'bg-red-500/10 text-red-300 border-red-500/20',
  muted: 'bg-white/5 text-muted border-white/10',
  white: 'bg-white/10 text-white border-white/20',
};

const SIZES = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-[11px]',
};

/**
 * Shared status pill — soft fill + border, used across matches, tournaments, orders.
 *
 * @param {'brand'|'success'|'danger'|'muted'|'white'} [props.tone='muted']
 * @param {'sm'|'md'} [props.size='md']
 * @param {boolean} [props.pulse] — live/active dot
 * @param {string} [props.label]
 * @param {string} [props.className]
 */
export function StatusPill({ tone = 'muted', size = 'md', pulse = false, label, className = '', children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-bold tracking-wide uppercase',
        TONES[tone] ?? TONES.muted,
        SIZES[size] ?? SIZES.md,
        className,
      )}
    >
      {pulse ? (
        <span className="mr-1.5 inline-block size-1.5 shrink-0 animate-pulse rounded-full bg-current" aria-hidden />
      ) : null}
      {children ?? label}
    </span>
  );
}

export default StatusPill;
