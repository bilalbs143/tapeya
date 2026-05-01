/**
 * @file dialog.jsx
 * @description Radix UI Dialog primitives extended with two modal flavors:
 *
 *   1. **Standard modal** (`DialogContent`)
 *      Light background, standard Radix layout. Drop-in replacement for shadcn/ui Dialog.
 *
 *   2. **Dark modal** (`DialogContentDark`)
 *      Default fixed 447 × 380px dark panel (#080807 bg, #141412 border, 17px radius);
 *      height is often overridden per screen (`!h-auto`, `min(90vh,…)`, etc.).
 *      Typical stack: DialogHeaderRow → DialogScrollBody → optional DialogSaveButton.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CURSOR: Composition guide
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Standard modal:
 *  ┌─────────────────────────────────┐
 *  │  <Dialog>                       │
 *  │    <DialogTrigger />            │
 *  │    <DialogContent>              │
 *  │      <DialogHeader>             │
 *  │        <DialogTitle />          │
 *  │        <DialogDescription />   │
 *  │      </DialogHeader>            │
 *  │      {body}                     │
 *  │      <DialogFooter />           │
 *  │    </DialogContent>             │
 *  │  </Dialog>                      │
 *  └─────────────────────────────────┘
 *
 *  Dark modal:
 *  ┌─────────────────────────────────┐
 *  │  <Dialog>                       │
 *  │    <DialogTrigger />            │
 *  │    <DialogContentDark>          │
 *  │      <DialogHeaderRow>          │  ← title + optional trailing + close
 *  │        <DialogTitle className={dialogPrimaryTitleClass}>…</DialogTitle>
 *  │      </DialogHeaderRow>         │
 *  │      <DialogScrollBody>         │  ← hidden-scrollbar flex-1 area
 *  │        {body}                   │
 *  │      </DialogScrollBody>        │
 *  │      <DialogSaveButton>         │  ← attached to modal bottom
 *  │        Save                     │
 *  │      </DialogSaveButton>        │
 *  │    </DialogContentDark>         │
 *  │  </Dialog>                      │
 *  └─────────────────────────────────┘
 */

import { forwardRef } from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';

// ─────────────────────────────────────────────────────────────────────────────
// Re-exported Radix primitives
// CURSOR: Use these directly when you only need the unstyled Radix behaviour,
//         e.g. <DialogClose> inside a custom button component.
// ─────────────────────────────────────────────────────────────────────────────

export const Dialog          = DialogPrimitive.Root;
export const DialogTrigger   = DialogPrimitive.Trigger;
export const DialogPortal    = DialogPrimitive.Portal;
export const DialogClose     = DialogPrimitive.Close;   // unstyled — prefer DialogHeaderClose inside dark modals

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens — shared class strings
// CURSOR: Edit these constants to restyle globally across all modal variants.
// ─────────────────────────────────────────────────────────────────────────────

/** Overlay: semi-transparent black backdrop behind every modal. */
const OVERLAY = 'fixed inset-0 z-50 bg-black/50';

/** Standard modal panel: white bg, rounded-lg, centred on screen. */
const CONTENT_STANDARD = 'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-white p-6 shadow-lg';

/**
 * Dark modal panel.
 * Default fixed 447 × 380px, dark background, 17px radius.
 * CURSOR: Adjust `h-[447px]` / `max-w-[380px]` here to resize the dark modal globally.
 */
const CONTENT_DARK = 'fixed left-1/2 top-1/2 z-50 flex h-[447px] w-full max-w-[380px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[17px] border-2 p-0 shadow-xl';

/** Scrollable modal body (hidden scrollbar). Used inside dark modals. */
const SCROLL_BODY = 'min-h-0 flex-1 overflow-y-auto px-5 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

/**
 * Save button fused to the bottom of a dark modal.
 * Top corners are square so it reads as part of the panel; bottom corners match the modal radius.
 */
const SAVE_BUTTON =
  'w-full shrink-0 rounded-b-[17px] bg-[#E8E8E8] py-4 text-base font-bold uppercase tracking-wide text-black transition-colors hover:bg-[#d8d8d8] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FFB703]';

/** Header row: uniform 52px min-height with horizontal padding. */
const HEADER_ROW = 'flex min-h-[52px] shrink-0 items-center justify-between gap-3 px-5 py-3';

/**
 * Golden uppercase title for dark modal headers.
 * CURSOR: Add `w-full text-center` to the className prop when you need a centred title.
 */
const TITLE_PRIMARY = 'text-left text-[14px] font-bold uppercase leading-tight tracking-wide text-[#DA9811]';

/** Close button inside dark modal headers. */
const CLOSE_BUTTON_DARK =
  'inline-flex size-9 shrink-0 items-center justify-center rounded-md text-[#A2A6AB] transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB703] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807] disabled:pointer-events-none disabled:opacity-30';

/** Close button for standard (light) modals — top-right absolute. */
const CLOSE_BUTTON_LIGHT =
  'absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:outline-none focus-visible:ring-0';

// Standard modal sub-parts
const HEADER      = 'flex flex-col gap-1.5 text-center sm:text-left';
const FOOTER      = 'flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2';
const TITLE       = 'text-lg font-semibold';
const DESCRIPTION = 'text-sm text-slate-500';

/** SVG path for the × close icon (shared by both close button variants). */
const CLOSE_ICON_PATH =
  'M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z';

// ─────────────────────────────────────────────────────────────────────────────
// Exported class-name constants
// CURSOR: Import these into other files when you need to match modal styling
//         without importing a full component. e.g.:
//           import { dialogPrimaryTitleClass } from '@/components/ui/dialog';
// ─────────────────────────────────────────────────────────────────────────────

export const dialogHeaderClass        = HEADER_ROW;
export const dialogPrimaryTitleClass  = TITLE_PRIMARY;

// ─────────────────────────────────────────────────────────────────────────────
// Shared SVG × icon
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
// Dark modal — close button
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Styled close button for dark modals (#080807 / #141412).
 *
 * CURSOR: This is distinct from `DialogClose` (the raw Radix primitive).
 *   - Use `DialogHeaderClose` inside `DialogHeaderRow` for dark modals.
 *   - Use `DialogCloseButton` inside `DialogContent` (standard modals).
 *   - Use `DialogClose` only when you need the bare unstyled Radix trigger.
 */
export const DialogHeaderClose = forwardRef(function DialogHeaderClose(
  { className = '', ...props },
  ref,
) {
  return (
    <DialogPrimitive.Close
      ref={ref}
      type="button"
      className={`${CLOSE_BUTTON_DARK} ${className}`.trim()}
      aria-label="Close"
      {...props}
    >
      <CloseIcon />
    </DialogPrimitive.Close>
  );
});

DialogHeaderClose.displayName = 'DialogHeaderClose';

// ─────────────────────────────────────────────────────────────────────────────
// Dark modal — header row
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Header row for dark modals: title area (flex-1, left) + optional trailing
 * element + close button (or spacer).
 *
 * @param {React.ReactNode}  [children]          Left slot — wrap your title in
 *                                               `<span className={dialogPrimaryTitleClass}>`.
 * @param {React.ReactNode}  [trailing]          Optional element between title and close
 *                                               (e.g. a badge or secondary action).
 * @param {React.ReactNode}  [closeSlot]         Replaces the default `DialogHeaderClose`
 *                                               (e.g. a skeleton during async load).
 * @param {boolean}          [hideClose=false]   Omit close button entirely (e.g. multi-step
 *                                               flows that only dismiss via the overlay).
 * @param {boolean}          [reserveCloseSpace=true]  When `hideClose` is true, keep a
 *                                               size-9 spacer so titles stay horizontally
 *                                               aligned with modals that show the close button.
 *
 * CURSOR: Typical usage —
 *   <DialogHeaderRow>
 *     <DialogTitle className={dialogPrimaryTitleClass}>Edit profile</DialogTitle>
 *   </DialogHeaderRow>
 *
 *   With a trailing badge —
 *   <DialogHeaderRow trailing={<StatusBadge />}>
 *     <DialogTitle className={dialogPrimaryTitleClass}>Booking #123</DialogTitle>
 *   </DialogHeaderRow>
 *
 *   Centred title (no close) —
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
// Shared overlay
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
// Standard modal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Standard (light) modal content panel.
 * Renders inside a Portal with the shared overlay.
 *
 * CURSOR: Compose as:
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>…</DialogTitle>
 *       <DialogDescription>…</DialogDescription>
 *     </DialogHeader>
 *     {body}
 *     <DialogFooter>…</DialogFooter>
 *   </DialogContent>
 */
export function DialogContent({ className = '', children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={`${CONTENT_STANDARD} ${className}`.trim()}
        aria-describedby={undefined}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dark modal (`DialogContentDark`)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dark modal content panel.
 * Background #080807, border #141412, 17px radius; default size 447 × 380px (override with className).
 *
 * CURSOR: Compose as:
 *   <DialogContentDark>
 *     <DialogHeaderRow>
 *       <DialogTitle className={dialogPrimaryTitleClass}>Title</DialogTitle>
 *     </DialogHeaderRow>
 *     <DialogScrollBody>
 *       {form or content}
 *     </DialogScrollBody>
 *     <DialogSaveButton onClick={handleSave}>Save</DialogSaveButton>
 *   </DialogContentDark>
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

/**
 * Scrollable body area for dark modals.
 * Grows to fill available space between the header and save button.
 * Scrollbar is hidden visually but still scrollable.
 *
 * CURSOR: Always wrap the modal's form/content with this — never let content
 *         push the save button off-screen.
 */
export function DialogScrollBody({ className = '', ...props }) {
  return <div className={`${SCROLL_BODY} ${className}`.trim()} {...props} />;
}

/**
 * Save / primary action button fused to the bottom of a dark modal.
 * Not a form submit by default — wire up an `onClick` handler.
 *
 * CURSOR: For async saves, disable the button and show a spinner:
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
// Standard modal sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Header wrapper for standard modals (text-left on sm+). */
export function DialogHeader({ className = '', ...props }) {
  return <div className={`${HEADER} ${className}`.trim()} {...props} />;
}

/** Footer wrapper — stacks buttons vertically on mobile, row on sm+. */
export function DialogFooter({ className = '', ...props }) {
  return <div className={`${FOOTER} ${className}`.trim()} {...props} />;
}

/**
 * Modal title (Radix `DialogPrimitive.Title`). Use in both shells; merge `className`
 * with `dialogPrimaryTitleClass` for the golden header style in dark modals.
 */
export function DialogTitle({ className = '', ...props }) {
  return (
    <DialogPrimitive.Title
      className={`${TITLE} ${className}`.trim()}
      {...props}
    />
  );
}

/** Subtitle / helper text below DialogTitle in standard modals. */
export function DialogDescription({ className = '', ...props }) {
  return (
    <DialogPrimitive.Description
      className={`${DESCRIPTION} ${className}`.trim()}
      {...props}
    />
  );
}

/**
 * Absolute top-right close button for standard (light) modals.
 * CURSOR: For dark modals use `DialogHeaderClose` (inside DialogHeaderRow) instead.
 */
export function DialogCloseButton({ className = '', ...props }) {
  return (
    <DialogPrimitive.Close
      className={`${CLOSE_BUTTON_LIGHT} ${className}`.trim()}
      {...props}
    >
      <span className="sr-only">Close</span>
      <CloseIcon />
    </DialogPrimitive.Close>
  );
}