import type { ReactNode } from 'react';
import { Link, type To } from 'react-router-dom';

import { useTheme } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';
import { ChevronLeftIcon } from '@/shared/ui/icons';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';

import { WhatsAppNotice } from './WhatsAppNotice';

type AuthBack =
  | { to: To; state?: unknown; label?: string; onClick?: undefined }
  | { onClick: () => void; label?: string; to?: undefined; state?: undefined };

type AuthShellProps = {
  children?: ReactNode;
  footer?: ReactNode;
  action?: ReactNode;
  back?: AuthBack | undefined;
  title?: ReactNode;
  description?: ReactNode;
  className?: string | undefined;
};

function AuthLogo({ className }: { className?: string }) {
  const { resolved } = useTheme();
  const src = resolved === 'dark' ? '/brand/tapeya-logo-dark.png' : '/brand/tapeya-logo-light.png';
  return <img src={src} alt="Tapeya" className={cn('w-auto object-contain', className)} />;
}

function AuthBackButton({ back }: { back: AuthBack }) {
  const className =
    'border-border-subtle text-body hover:text-ink focus-visible:outline-brand grid h-8 w-8 shrink-0 place-items-center rounded-icon border focus-visible:outline-2';
  const icon = <ChevronLeftIcon className="h-[15px] w-[15px]" strokeWidth={2.2} />;
  const label = back.label ?? 'Back';

  if (back.to) {
    return (
      <Link to={back.to} state={back.state} aria-label={label} className={className}>
        {icon}
      </Link>
    );
  }

  return (
    <button type="button" onClick={back.onClick} aria-label={label} className={className}>
      {icon}
    </button>
  );
}

/** Auth layout — full-bleed on phone; centred card from `sm`. */
export function AuthShell({ children, footer, action, back, title, description, className }: AuthShellProps) {
  return (
    <div className="bg-surface relative flex min-h-[100dvh] flex-col sm:bg-page">
      <header className="flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))] sm:px-5">
        {back ? <AuthBackButton back={back} /> : <span className="h-8 w-8 shrink-0" aria-hidden />}
        <ThemeToggle className="h-8 w-8" />
      </header>

      <div className="flex flex-1 flex-col items-center px-6 pb-[max(24px,env(safe-area-inset-bottom))] sm:justify-center sm:px-6 sm:pb-12">
        <div
          className={cn(
            'flex w-full max-w-[400px] flex-1 flex-col sm:max-w-[420px] sm:flex-none',
            'sm:bg-surface sm:rounded-card sm:border sm:border-border-subtle sm:px-8 sm:pt-10 sm:pb-8 sm:shadow-pop',
            className
          )}
        >
          <div className="flex justify-center pt-8 pb-9 sm:pt-0 sm:pb-8">
            <AuthLogo className="h-12 sm:h-[52px]" />
          </div>

          {title || description ? (
            <div className="flex flex-col gap-2 pb-6">
              {title ? <h1 className="text-display font-extrabold tracking-tight text-ink">{title}</h1> : null}
              {description ? <p className="text-muted max-w-[38ch] text-sm leading-relaxed">{description}</p> : null}
            </div>
          ) : null}

          {children ? <div className="flex flex-col">{children}</div> : null}

          {action ? <div className="pt-6">{action}</div> : null}

          {footer ? <div className="mt-auto pt-8 text-center sm:mt-8 sm:pt-0">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function AuthSwitch({ prompt, to, label, state }: { prompt: string; to: To; label: string; state?: unknown }) {
  return (
    <span className="text-sm text-muted">
      {prompt}{' '}
      <Link to={to} state={state} className="text-brand-text font-bold">
        {label}
      </Link>
    </span>
  );
}

export function AuthWhatsAppNote() {
  return <WhatsAppNotice className="mt-5" />;
}
