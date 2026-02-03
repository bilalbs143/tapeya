/**
 * Radix AlertDialog - modal dialog for confirmations
 */

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';

const overlay = 'fixed inset-0 z-50 bg-black/50';
const content =
  'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg rounded-lg';
const footer = 'flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2';
const title = 'text-lg font-semibold';
const description = 'text-sm text-slate-500';
const cancelButton =
  'inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100';
const actionButton =
  'inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700';

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogPortal = AlertDialogPrimitive.Portal;

export function AlertDialogOverlay({ className = '', ...props }) {
  return (
    <AlertDialogPrimitive.Overlay
      className={`${overlay} ${className}`}
      {...props}
    />
  );
}

export function AlertDialogContent({ className = '', children, ...props }) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        className={`${content} ${className}`}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  );
}

export function AlertDialogHeader({ className = '', ...props }) {
  return (
    <div
      className={`flex flex-col gap-2 text-center sm:text-left ${className}`}
      {...props}
    />
  );
}

export function AlertDialogFooter({ className = '', ...props }) {
  return <div className={`${footer} ${className}`} {...props} />;
}

export function AlertDialogTitle({ className = '', ...props }) {
  return (
    <AlertDialogPrimitive.Title
      className={`${title} ${className}`}
      {...props}
    />
  );
}

export function AlertDialogDescription({ className = '', ...props }) {
  return (
    <AlertDialogPrimitive.Description
      className={`${description} ${className}`}
      {...props}
    />
  );
}

export function AlertDialogAction({ className = '', ...props }) {
  return (
    <AlertDialogPrimitive.Action
      className={`${actionButton} ${className}`}
      {...props}
    />
  );
}

export function AlertDialogCancel({ className = '', ...props }) {
  return (
    <AlertDialogPrimitive.Cancel
      className={`${cancelButton} ${className}`}
      {...props}
    />
  );
}
