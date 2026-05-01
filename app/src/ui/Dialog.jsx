/**
 * @file Dialog.jsx
 * @description App-wide dark dialog system built on Radix UI primitives.
 *
 * One modal type: dark centered panel (#080807 bg / #141412 border / #DA9811 title).
 * Use `BaseDialog` as the convenience wrapper for all new dialogs.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Composition:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  <Dialog open={open} onOpenChange={onOpenChange}>
 *    <DialogContentDark className="!h-auto !max-h-[90vh]">
 *
 *      <DialogHeaderRow>
 *        <DialogTitle className={dialogPrimaryTitleClass}>
 *          Title here
 *        </DialogTitle>
 *      </DialogHeaderRow>
 *
 *      <DialogScrollBody>
 *        {form / list / content}
 *      </DialogScrollBody>
 *
 *      {/* optional — fused to bottom of panel *\/}
 *      <DialogSaveButton onClick={handleSave}>Save</DialogSaveButton>
 *
 *    </DialogContentDark>
 *  </Dialog>
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Exported API
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Radix primitives (re-exported):
 *    Dialog, DialogTrigger, DialogPortal, DialogClose
 *
 *  Panel & overlay:
 *    DialogOverlay, DialogContentDark
 *
 *  Dark modal building blocks:
 *    DialogHeaderRow, DialogHeaderClose
 *    DialogScrollBody
 *    DialogSaveButton
 *    DialogTitle, DialogDescription
 *
 *  Class-name constants (import when you need to match styling elsewhere):
 *    dialogHeaderClass        — the header-row flex class string
 *    dialogPrimaryTitleClass  — golden uppercase title style
 */

import { forwardRef } from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';

// ─────────────────────────────────────────────────────────────────────────────
// Radix primitives — re-exported for convenience
// ─────────────────────────────────────────────────────────────────────────────

export const Dialog        = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal  = DialogPrimitive.Portal;
export const DialogClose   = DialogPrimitive.Close; // unstyled — use DialogHeaderClose inside panels

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens
// Edit these to restyle all dialogs globally.
// ─────────────────────────────────────────────────────────────────────────────

const OVERLAY =
  'fixed inset-0 z-50 bg-black/50';

const CONTENT_DARK =
  'fixed left-1/2 top-1/2 z-50 flex h-[447px] w-full max-w-[380px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[17px] border-2 p-0 shadow-xl';

const SCROLL_BODY =
  'min-h-0 flex-1 overflow-y-auto px-5 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

const SAVE_BUTTON =
  'w-full shrink-0 rounded-b-[17px] bg-[#E8E8E8] py-4 text-base font-bold uppercase tracking-wide text-black transition-colors hover:bg-[#d8d8d8] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FFB703]';

const HEADER_ROW =
  'flex min-h-[52px] shrink-0 items-center justify-between gap-3 px-5 py-3';

// Golden uppercase title — the standard style for every dialog header.
const TITLE_PRIMARY =
  'text-left text-[14px] font-bold uppercase leading-tight tracking-wide text-[#DA9811]';

const CLOSE_BUTTON =
  'inline-flex size-9 shrink-0 items-center justify-center rounded-md text-[#A2A6AB] transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB703] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807] disabled:pointer-events-none disabled:opacity-30';

const CLOSE_ICON_PATH =
  'M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z';

// ─────────────────────────────────────────────────────────────────────────────
// Exported class-name constants
// ─────────────────────────────────────────────────────────────────────────────

export const dialogHeaderClass       = HEADER_ROW;
export const dialogPrimaryTitleClass = TITLE_PRIMARY;

// ─────────────────────────────────────────────────────────────────────────────
// Internal: shared × icon
// ─────────────────────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 15 15"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path d={CLOSE_ICON_PATH} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Overlay
// ─────────────────────────────────────────────────────────────────────────────

export const DialogOverlay = forwardRef(function DialogOverlay(
  { className = '', ...props },
  ref,
) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={`${OVERLAY} ${className}`.trim()}
      {...props}
    />
  );
});

DialogOverlay.displayName = 'DialogOverlay';

// ─────────────────────────────────────────────────────────────────────────────
// Dark panel
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The single dark modal panel used across the entire app.
 *
 * Default size is 447 × 380 px. Most dialogs override height via:
 *   className="!h-auto !max-h-[90vh]"
 * (BaseDialog does this automatically.)
 */
export function DialogContentDark({ className = '', children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={`${CONTENT_DARK} ${className}`.trim()}
        style={{ backgroundColor: '#080807', borderColor: '#141412' }}
        aria-describedby={undefined}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Header row
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Styled × close button for dark modal headers.
 * Used automatically by DialogHeaderRow unless hideClose / closeSlot is passed.
 */
export const DialogHeaderClose = forwardRef(function DialogHeaderClose(
  { className = '', ...props },
  ref,
) {
  return (
    <DialogPrimitive.Close
      ref={ref}
      type="button"
      className={`${CLOSE_BUTTON} ${className}`.trim()}
      aria-label="Close"
      {...props}
    >
      <CloseIcon />
    </DialogPrimitive.Close>
  );
});

DialogHeaderClose.displayName = 'DialogHeaderClose';

/**
 * Standard header row: title (left) + optional trailing element + close button.
 *
 * @param {React.ReactNode} [children]           Title slot — use DialogTitle with dialogPrimaryTitleClass.
 * @param {React.ReactNode} [trailing]           Optional element between title and close button.
 * @param {React.ReactNode} [closeSlot]          Override the close button (e.g. a loading skeleton).
 * @param {boolean}         [hideClose=false]    Omit the close button (multi-step flows, etc.).
 * @param {boolean}         [reserveCloseSpace=true]  Keep a size-9 spacer when hideClose is true
 *                                               so centred titles stay visually centred.
 *
 * Usage:
 *   <DialogHeaderRow>
 *     <DialogTitle className={dialogPrimaryTitleClass}>Edit profile</DialogTitle>
 *   </DialogHeaderRow>
 *
 *   Centred title, no close:
 *   <DialogHeaderRow hideClose reserveCloseSpace>
 *     <DialogTitle className={`${dialogPrimaryTitleClass} w-full text-center`}>
 *       Step 2 of 3
 *     </DialogTitle>
 *   </DialogHeaderRow>
 */
export function DialogHeaderRow({
  children          = null,
  trailing          = null,
  closeSlot,
  hideClose         = false,
  reserveCloseSpace = true,
  className         = '',
}) {
  let right;
  if (closeSlot != null) {
    right = closeSlot;
  } else if (hideClose && reserveCloseSpace) {
    right = <span className="inline-flex size-9 shrink-0" aria-hidden />;
  } else if (hideClose) {
    right = null;
  } else {
    right = <DialogHeaderClose />;
  }

  return (
    <div className={`${HEADER_ROW} ${className}`.trim()}>
      <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
      {trailing}
      {right}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scrollable body
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Flex-1 scrollable content area.
 * Always wrap the modal body with this so the save button stays pinned to the bottom.
 */
export function DialogScrollBody({ className = '', ...props }) {
  return <div className={`${SCROLL_BODY} ${className}`.trim()} {...props} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Save button
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Light-coloured primary action button fused to the bottom of the panel.
 * Not a form submit by default — wire an onClick handler.
 *
 * For async saves:
 *   <DialogSaveButton onClick={handleSave} disabled={isSaving}>
 *     {isSaving ? 'Saving…' : 'Save'}
 *   </DialogSaveButton>
 */
export function DialogSaveButton({ className = '', ...props }) {
  return (
    <button
      type="button"
      className={`${SAVE_BUTTON} ${className}`.trim()}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Title & description
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Accessible modal title (Radix DialogPrimitive.Title).
 * Always pair with dialogPrimaryTitleClass for the golden style:
 *   <DialogTitle className={dialogPrimaryTitleClass}>…</DialogTitle>
 *
 * For screen-reader-only titles use className="sr-only".
 */
export function DialogTitle({ className = '', ...props }) {
  return <DialogPrimitive.Title className={className} {...props} />;
}

/**
 * Secondary description text inside a dark modal.
 * Renders in the app's standard secondary text colour (#A2A6AB).
 */
export function DialogDescription({ className = '', ...props }) {
  return (
    <DialogPrimitive.Description
      className={`text-sm text-[#A2A6AB] ${className}`.trim()}
      {...props}
    />
  );
}
