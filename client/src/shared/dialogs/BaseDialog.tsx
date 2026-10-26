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

type BaseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentClassName?: string;
  showClose?: boolean;
  /** Sheet handle — default on when dismissible; hidden at `tab+`. */
  showHandle?: boolean | undefined;
  /** When false, blocks outside click / Escape / close affordance (wicket summary). */
  dismissible?: boolean;
  /** Optional Radix open-focus override — set at the call site when needed. */
  onOpenAutoFocus?: ((event: Event) => void) | undefined;
  children: ReactNode;
};

/** Sheet below `tab`, centred card at `tab+`. Registry + feature overlays share this chrome. §13 */
export function BaseDialog({
  open,
  onOpenChange,
  contentClassName,
  showClose = true,
  showHandle,
  dismissible = true,
  onOpenAutoFocus,
  children,
}: BaseDialogProps) {
  const canClose = dismissible;
  const showX = showClose && canClose;
  const handleVisible = showHandle ?? canClose;

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
            // Sheet: lift with `--keyboard-inset`. Bottom pad uses `--dock-above-keyboard`
            // (same token as StickyActionBar `edge`) — one safe-area layer, not footer+sheet.
            // At `tab+`: centred card, no sheet pad.
            'inset-x-0 bottom-[var(--keyboard-inset,0px)] rounded-t-sheet pb-[var(--dock-above-keyboard)]',
            'data-[state=open]:animate-sheet-in data-[state=closed]:animate-sheet-out',
            'tab:top-1/2 tab:left-1/2 tab:bottom-auto tab:w-full tab:max-w-dialog tab:-translate-x-1/2 tab:-translate-y-1/2',
            'tab:rounded-card tab:pb-0 tab:shadow-pop',
            'tab:data-[state=open]:animate-dialog-in tab:data-[state=closed]:animate-dialog-out',
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
            <span aria-hidden className="bg-surface-raised mx-auto mt-3 block h-1 w-9 rounded-full tab:hidden" />
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
        // Match StickyActionBar: px-4 pt-3; bottom pad lives on BaseDialog sheet chrome
        // (`--dock-above-keyboard`) so we do not double safe-area under the CTA.
        'border-border-subtle flex items-center gap-2 border-t px-4 pt-3 pb-0 [&>*]:flex-1 tab:[&>*]:flex-none tab:justify-end',
        className
      )}
      {...props}
    />
  );
}
