import { cn } from '@/shared/lib/cn';

type KeyboardInsetPadProps = {
  /** Landscape / immersive can turn this off. Default on. */
  enabled?: boolean | undefined;
  className?: string | undefined;
};

/**
 * Opaque soft-keyboard zone — lift + L/R fill in one place.
 *
 * Use as the **last flex child** of a `fixed` / bottom-pinned surface
 * (AppShell, dialog sheet). Height is `--keyboard-inset` (0 when closed).
 * Hidden at `tab+` (centred dialogs / desktop chrome).
 *
 * Do not also set `padding-bottom: var(--keyboard-inset)` on the parent.
 */
export function KeyboardInsetPad({ enabled = true, className }: KeyboardInsetPadProps) {
  if (!enabled) return null;
  return (
    <div
      aria-hidden
      className={cn('bg-surface shrink-0 tab:hidden', className)}
      style={{ height: 'var(--keyboard-inset)' }}
    />
  );
}
