import type { ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import { KeyboardInsetPad } from '@/shared/layout/KeyboardInsetPad';
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

type BaseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Body layout only (`flex` / `max-h` / `p-0`). Never put position/safe-area here. */
  contentClassName?: string | undefined;
  /** Rare position overrides (e.g. full-height Declare Squad). Prefer `contentClassName`. */
  shellClassName?: string | undefined;
  showClose?: boolean;
  /** Sheet handle — default on when dismissible; hidden at `tab+`. */
  showHandle?: boolean | undefined;
  /** When false, blocks outside click / Escape / close affordance (wicket summary). */
  dismissible?: boolean;
  /** Optional Radix open-focus override — set at the call site when needed. */
  onOpenAutoFocus?: ((event: Event) => void) | undefined;
  children: ReactNode;
};

/**
 * Phone: bottom sheet + slide. Desktop (`tab+`): card centred with `inset-0 m-auto`
 * (not translate) so dialog-in/out can scale without fighting position.
 */
export function BaseDialog({
  open,
  onOpenChange,
  contentClassName,
  shellClassName,
  showClose = true,
  showHandle,
  dismissible = true,
  onOpenAutoFocus,
  children,
}: BaseDialogProps) {
  const canClose = dismissible;
  const showX = showClose && canClose;
  const handleVisible = showHandle ?? canClose;

  function blockDismiss(event: Event) {
    if (!canClose) event.preventDefault();
  }

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
            'bg-surface border-border fixed z-50 flex flex-col text-ink focus:outline-none',
            // Phone sheet — KeyboardInsetPad owns the bottom safe/keyboard fill (no border-b).
            'inset-x-0 bottom-0 rounded-t-sheet border-x border-t',
            'max-tab:data-[state=open]:animate-sheet-in max-tab:data-[state=closed]:animate-sheet-out',
            // Desktop card — margin box centres; transform left for scale-only motion.
            'tab:inset-0 tab:m-auto tab:h-fit tab:max-h-[min(90dvh,720px)] tab:w-full tab:max-w-dialog',
            'tab:overflow-hidden tab:rounded-card tab:border tab:shadow-pop',
            'tab:data-[state=open]:animate-dialog-in tab:data-[state=closed]:animate-dialog-out',
            shellClassName
          )}
          onOpenAutoFocus={onOpenAutoFocus}
          onPointerDownOutside={blockDismiss}
          onEscapeKeyDown={blockDismiss}
          onInteractOutside={blockDismiss}
        >
          {handleVisible ? (
            <span aria-hidden className="bg-surface-raised mx-auto mt-3 block h-1 w-9 rounded-full tab:hidden" />
          ) : null}
          <div className={cn('min-h-0', contentClassName)}>{children}</div>
          {showX ? (
            <DialogPrimitive.Close
              aria-label="Close"
              className="text-muted hover:text-ink focus-visible:outline-brand absolute top-4 right-4 z-10 grid h-7 w-7 place-items-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <CloseIcon size="sm" strokeWidth={2.2} className="h-4 w-4" />
            </DialogPrimitive.Close>
          ) : null}
          <KeyboardInsetPad />
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
        // Same dock chrome as watch CommentComposer (`COMMENT_COMPOSE_DOCK_WATCH`):
        // opaque surface + ≥10px / home-indicator; keyboard lift is KeyboardInsetPad on the sheet.
        'border-border-subtle bg-surface isolate flex items-center gap-2 border-t px-4 pt-3',
        'pb-[max(10px,var(--safe-above-keyboard))]',
        '[&>*:last-child]:flex-1 tab:justify-end tab:[&>*:last-child]:flex-none',
        className
      )}
      {...props}
    />
  );
}
