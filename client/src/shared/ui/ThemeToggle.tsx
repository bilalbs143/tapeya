import { type ThemePreference, useTheme } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';
import { MoonIcon, SunIcon } from '@/shared/ui/icons';

type ThemeToggleProps = {
  variant?: 'icon' | 'segment';
  className?: string;
};

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { theme, resolved, setTheme, toggle } = useTheme();

  if (variant === 'segment') {
    return (
      <div
        role="radiogroup"
        aria-label="Appearance"
        className={cn('bg-page-deep border-border flex gap-0.5 rounded-field border p-0.5', className)}
      >
        {(
          [
            ['system', 'System'],
            ['light', 'Light'],
            ['dark', 'Dark'],
          ] as const
        ).map(([value, label]: readonly [ThemePreference, string]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={theme === value}
            onClick={() => setTheme(value)}
            className={cn(
              'focus-visible:outline-brand flex-1 rounded-nest px-3 py-1.5 text-2xs font-bold transition-colors focus-visible:outline-2',
              theme === value ? 'bg-brand text-white' : 'text-muted hover:text-ink'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={resolved === 'dark' ? 'Light Theme' : 'Dark Theme'}
      className={cn(
        'text-muted hover:text-ink focus-visible:outline-brand grid h-8 w-8 shrink-0 place-items-center rounded-icon transition-colors focus-visible:outline-2',
        className
      )}
    >
      {resolved === 'dark' ? (
        <SunIcon size="sm" strokeWidth={1.9} className="h-[18px] w-[18px]" />
      ) : (
        <MoonIcon size="sm" strokeWidth={1.9} className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
