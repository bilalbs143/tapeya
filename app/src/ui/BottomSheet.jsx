/**
 * Shared bottom sheet — slides up from the bottom (mobile) or centers (md+).
 */

import * as DialogPrimitive from '@radix-ui/react-dialog';

import { CLOSE_ICON_PATH } from '@/lib/constants/assets';
import { DialogOverlay } from '@/ui/Dialog';

export const BOTTOM_SHEET_CONTENT_CLASS =
  'fixed bottom-0 left-0 right-0 z-50 flex max-h-[85vh] flex-col overflow-hidden rounded-t-[17px] border-t-2 p-0 shadow-xl outline-none ' +
  'md:bottom-auto md:left-1/2 md:right-auto md:top-1/2 md:max-h-[80vh] md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[17px] md:border-2';

const CLOSE_BUTTON =
  'inline-flex size-9 shrink-0 items-center justify-center rounded-md text-[#A2A6AB] transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DA9811]';

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {(open: boolean) => void} props.onOpenChange
 * @param {string} [props.title] Header label (uppercase gold)
 * @param {string} [props.ariaLabel] Accessible name when title is omitted
 * @param {boolean} [props.dismissible=true] Allow overlay tap / Escape to close
 * @param {boolean} [props.showClose=true] Show header × button (only when dismissible)
 * @param {React.ReactNode} props.children Scrollable body
 * @param {React.ReactNode} [props.toolbar] Pinned content between header and body (e.g. search)
 * @param {string} [props.bodyClassName] Scroll area classes (defaults to padded body)
 * @param {React.ReactNode} [props.footer] Pinned footer (e.g. action buttons)
 */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  ariaLabel,
  dismissible = true,
  showClose = true,
  children,
  toolbar = null,
  bodyClassName = 'min-h-0 flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  footer = null,
}) {
  const handleOpenChange = (next) => {
    if (!next && !dismissible) return;
    onOpenChange(next);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogOverlay />

        <DialogPrimitive.Content
          className={BOTTOM_SHEET_CONTENT_CLASS}
          style={{ backgroundColor: '#080807', borderColor: '#141412' }}
          aria-describedby={undefined}
          aria-label={ariaLabel ?? title ?? undefined}
          onPointerDownOutside={(e) => {
            if (!dismissible) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (!dismissible) e.preventDefault();
          }}
        >
          {title ? (
            <div className="flex shrink-0 items-center border-b border-white/10 px-5 py-4">
              <DialogPrimitive.Title className="flex-1 text-[14px] font-bold tracking-wide text-[#DA9811] uppercase">
                {title}
              </DialogPrimitive.Title>
              {dismissible && showClose ? (
                <DialogPrimitive.Close type="button" className={CLOSE_BUTTON} aria-label="Close">
                  <svg width={15} height={15} viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path d={CLOSE_ICON_PATH} />
                  </svg>
                </DialogPrimitive.Close>
              ) : null}
            </div>
          ) : null}

          {toolbar ? <div className="shrink-0 px-5 pt-3 pb-2">{toolbar}</div> : null}

          <div className={bodyClassName}>{children}</div>

          {footer ? <div className="shrink-0 border-t border-white/10 px-4 py-4">{footer}</div> : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
