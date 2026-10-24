import type { ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import { cn } from '@/shared/lib/cn';
import { CloseIcon } from '@/shared/ui/icons';

export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

function Overlay({ className }: { className?: string }) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-veil-deep backdrop-blur-[2px]',
        'data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out',
        className
      )}
    />
  );
}

export type DialogPresentation = 'responsive' | 'sheet' | 'dialog';

type BaseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentClassName?: string;
  /**
   * Overlay chrome — sheets and dialogs are distinct:
   * - `responsive` — sheet below `tab`, centred dialog at `tab+` (default for feature overlays)
   * - `sheet` — bottom sheet at every width (scoring pickers, comment sheets)
   * - `dialog` — centred card at every width (confirm, session expired, app update)
   */
  presentation?: DialogPresentation | undefined;
  /** Shorthand for `presentation="sheet"`. Ignored when `presentation` is set. */
  sheet?: boolean | undefined;
  showClose?: boolean;
  /** Sheet handle — default on for sheet presentations when dismissible. */
  showHandle?: boolean | undefined;
  /** When false, blocks outside click / Escape / close affordance (wicket summary). */
  dismissible?: boolean;
  /** Optional Radix open-focus override — set at the call site when needed. */
  onOpenAutoFocus?: ((event: Event) => void) | undefined;
  children: ReactNode;
};

const SHEET_CHROME =
  'inset-x-0 bottom-[var(--keyboard-inset,0px)] rounded-t-sheet pb-[var(--safe-above-keyboard)] data-[state=open]:animate-sheet-in data-[state=closed]:animate-sheet-out';

const DIALOG_CHROME =
  'top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-dialog -translate-x-1/2 -translate-y-1/2 rounded-card shadow-pop data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out';

/** Registry + feature overlays share this chrome; bodies vary per key. §13 */
export function BaseDialog({
  open,
  onOpenChange,
  contentClassName,
  presentation,
  sheet = false,
  showClose = true,
  showHandle,
  dismissible = true,
  onOpenAutoFocus,
  children,
}: BaseDialogProps) {
  const mode: DialogPresentation = presentation ?? (sheet ? 'sheet' : 'responsive');
  const canClose = dismissible;
  const showX = showClose && canClose;
  const handleVisible = showHandle ?? (mode === 'sheet' && canClose);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!canClose && !next) return;
        onOpenChange(next);
      }}
    >
      <DialogPortal>
        <Overlay />
        <DialogPrimitive.Content
          className={cn(
            'bg-surface border-border fixed z-50 border text-ink focus:outline-none',
            // Sheet: lift with `--keyboard-inset`; `--safe-above-keyboard` zeros home-indicator
            // pad once the keyboard already covers it. Dialog: centred card, no sheet pad.
            mode === 'sheet' && SHEET_CHROME,
            mode === 'dialog' && DIALOG_CHROME,
            mode === 'responsive' && [
              SHEET_CHROME,
              'tab:top-1/2 tab:left-1/2 tab:bottom-auto tab:w-full tab:max-w-dialog tab:-translate-x-1/2 tab:-translate-y-1/2',
              'tab:rounded-card tab:pb-0 tab:shadow-pop',
              'tab:data-[state=open]:animate-dialog-in tab:data-[state=closed]:animate-dialog-out',
            ],
            contentClassName
          )}
          onOpenAutoFocus={onOpenAutoFocus}
          onPointerDownOutside={(event) => {
            if (!canClose) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (!canClose) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (!canClose) event.preventDefault();
          }}
        >
          {handleVisible ? (
            <span aria-hidden className="bg-surface-raised mx-auto mt-3 block h-1 w-9 rounded-full" />
          ) : null}
          {children}
          {showX ? (
            <DialogPrimitive.Close
              aria-label="Close"
              className="text-muted hover:text-ink focus-visible:outline-brand absolute top-4 right-4 grid h-7 w-7 place-items-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <CloseIcon size="sm" strokeWidth={2.2} className="h-4 w-4" />
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}

export function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1.5 p-5 pr-12 pb-4', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('text-base leading-tight font-extrabold', className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('text-muted text-sm leading-relaxed', className)} {...props} />;
}

export function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-4 px-5 pb-5', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'border-border-subtle flex items-center gap-2 border-t p-5 [&>*]:flex-1 tab:[&>*]:flex-none tab:justify-end',
        className
      )}
      {...props}
    />
  );
}
