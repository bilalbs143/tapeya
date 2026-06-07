import * as ToastPrimitive from '@radix-ui/react-toast';

import { CLOSE_ICON_PATH } from '@/lib/constants/assets';

const viewport =
  'fixed top-[calc(env(safe-area-inset-top)+12px)] left-4 right-4 z-[100] flex max-h-screen w-auto flex-col gap-2 outline-none md:left-auto md:right-4 md:max-w-[380px]';

const root =
  'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-[12px] border-2 border-[#141412] bg-[#080807] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.55)] transition-all duration-300 ease-out data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[state=closed]:opacity-0 data-[state=open]:opacity-100 data-[state=closed]:translate-y-[-6px] data-[state=open]:translate-y-0';

const title = 'text-[13px] font-bold uppercase leading-snug tracking-wide text-[#DA9811]';
const description = 'text-[13px] leading-snug text-[#D4D4D2]';
const descriptionOnly = 'text-[13px] font-medium leading-snug text-white';

const action =
  'inline-flex h-8 shrink-0 items-center justify-center rounded-[6px] border border-[#2A2A28] bg-[#141412] px-3 text-[12px] font-semibold text-[#DA9811] transition-colors hover:bg-[#1a1a18]';

const close =
  'absolute right-2 top-2 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-[#A2A6AB] transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB703] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]';

const accentBar = 'absolute bottom-0 left-0 top-0 w-[3px] shrink-0';

const iconWrap = 'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#141412]';

// ─── Variants ─────────────────────────────────────────────────────────────────

function CheckIcon({ className = '' }) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M13.3 4.3a1 1 0 0 1 0 1.4l-5.5 5.5a1 1 0 0 1-1.4 0L2.7 7.5a1 1 0 1 1 1.4-1.4l2.6 2.6 4.8-4.8a1 1 0 0 1 1.4 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ErrorIcon({ className = '' }) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm3.2 9.7a.75.75 0 0 1-1.06 0L8 8.06 5.86 10.2a.75.75 0 1 1-1.06-1.06L6.94 7 4.8 4.86a.75.75 0 1 1 1.06-1.06L8 5.94l2.14-2.14a.75.75 0 1 1 1.06 1.06L9.06 7l2.14 2.14a.75.75 0 0 1 0 1.06Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InfoIcon({ className = '' }) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm.75 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM8.75 7.5v4.25a.75.75 0 0 1-1.5 0V7.5a.75.75 0 0 1 1.5 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

const TOAST_VARIANTS = {
  default: {
    accent: `${accentBar} bg-[#DA9811]`,
    iconClass: 'text-[#DA9811]',
    Icon: InfoIcon,
  },
  success: {
    accent: `${accentBar} bg-[#DA9811]`,
    iconClass: 'text-[#DA9811]',
    Icon: CheckIcon,
  },
  error: {
    accent: `${accentBar} bg-[#E5484D]`,
    iconClass: 'text-[#F87171]',
    Icon: ErrorIcon,
  },
};

// ─── Primitives ───────────────────────────────────────────────────────────────

export const Toaster = ToastPrimitive.Provider;
export const ToastViewport = ToastPrimitive.Viewport;
export const Toast = ToastPrimitive.Root;
export const ToastTitle = ToastPrimitive.Title;
export const ToastDescription = ToastPrimitive.Description;
export const ToastAction = ToastPrimitive.Action;
export const ToastClose = ToastPrimitive.Close;

export function ToastViewportStyled({ className = '', ...props }) {
  return <ToastPrimitive.Viewport className={`${viewport} ${className}`} {...props} />;
}

export function ToastRootStyled({ className = '', variant = 'default', children, ...props }) {
  const config = TOAST_VARIANTS[variant] ?? TOAST_VARIANTS.default;
  const { Icon } = config;

  return (
    <ToastPrimitive.Root className={`${root} pl-[calc(1rem+3px)] ${className}`} {...props}>
      <span className={config.accent} aria-hidden />
      <span className={iconWrap} aria-hidden>
        <Icon className={config.iconClass} />
      </span>
      <div className="min-w-0 flex-1 pr-1">{children}</div>
    </ToastPrimitive.Root>
  );
}

export function ToastTitleStyled({ className = '', ...props }) {
  return <ToastPrimitive.Title className={`${title} ${className}`} {...props} />;
}

export function ToastDescriptionStyled({ className = '', descriptionOnly: isDescriptionOnly = false, ...props }) {
  return (
    <ToastPrimitive.Description className={`${isDescriptionOnly ? descriptionOnly : description} ${className}`} {...props} />
  );
}

export function ToastActionStyled({ className = '', altText, ...props }) {
  return <ToastPrimitive.Action altText={altText} className={`${action} ${className}`} {...props} />;
}

export function ToastCloseStyled({ className = '', ...props }) {
  return (
    <ToastPrimitive.Close className={`${close} ${className}`} {...props}>
      <svg width={14} height={14} viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path d={CLOSE_ICON_PATH} />
      </svg>
    </ToastPrimitive.Close>
  );
}
