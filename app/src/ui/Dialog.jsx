/**
 * Radix Dialog - modal dialog
 */

import { forwardRef } from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';

const overlay = 'fixed inset-0 z-50 bg-black/50';
const content =
  'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg rounded-lg';
/** Profile/dark modal: fixed height, dark bg, 17px radius, flex layout */
const contentProfile =
  '!flex h-[447px] max-w-[380px] flex-col overflow-hidden rounded-[17px] border-2 p-0 shadow-xl fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%]';
const scrollBody =
  'min-h-0 flex-1 overflow-y-auto px-5 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
const saveButtonAttached =
  'w-full shrink-0 rounded-b-[17px] bg-[#E8E8E8] py-4 text-base font-bold uppercase tracking-wide text-black transition-colors hover:bg-[#d8d8d8] focus:outline-none focus:ring-2 focus:ring-[#FFB703] focus:ring-inset';
const header = 'flex flex-col gap-1.5 text-center sm:text-left';
const footer = 'flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2';
const title = 'text-lg font-semibold';
const description = 'text-sm text-slate-500';
const closeButton =
  'absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = forwardRef(function DialogOverlay(
  { className = '', ...props },
  ref,
) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={`${overlay} ${className}`}
      {...props}
    />
  );
});

export function DialogContent({ className = '', children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={`${content} ${className}`}
        aria-describedby={undefined}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/** Dark profile modal: bg #080807, border #141412, 17px radius. Use with DialogScrollBody and DialogSaveButton. */
export function DialogContentProfile({ className = '', children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={`${contentProfile} ${className}`}
        style={{ backgroundColor: '#080807', borderColor: '#141412' }}
        aria-describedby={undefined}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/** Scrollable body with hidden scrollbar. Use inside DialogContentProfile. */
export function DialogScrollBody({ className = '', ...props }) {
  return <div className={`${scrollBody} ${className}`} {...props} />;
}

/** Save button attached to bottom of profile modal (17px top radius). */
export function DialogSaveButton({ className = '', ...props }) {
  return (
    <button
      type="button"
      className={`${saveButtonAttached} ${className}`}
      {...props}
    />
  );
}

export function DialogHeader({ className = '', ...props }) {
  return <div className={`${header} ${className}`} {...props} />;
}

export function DialogFooter({ className = '', ...props }) {
  return <div className={`${footer} ${className}`} {...props} />;
}

export function DialogTitle({ className = '', ...props }) {
  return (
    <DialogPrimitive.Title className={`${title} ${className}`} {...props} />
  );
}

export function DialogDescription({ className = '', ...props }) {
  return (
    <DialogPrimitive.Description
      className={`${description} ${className}`}
      {...props}
    />
  );
}

export function DialogCloseButton({ className = '', ...props }) {
  return (
    <DialogPrimitive.Close className={`${closeButton} ${className}`} {...props}>
      <span className="sr-only">Close</span>
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" />
      </svg>
    </DialogPrimitive.Close>
  );
}
