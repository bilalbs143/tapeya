/**
 * Radix Toast - toast notifications
 * Wrap app with Toaster (ToastProvider + ToastViewport)
 */

import * as ToastPrimitive from '@radix-ui/react-toast';

const viewport =
  'fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col p-4 md:max-w-[420px]';
const root =
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border bg-white p-4 shadow-lg transition-all';
const title = 'text-sm font-semibold';
const description = 'text-sm opacity-90';
const action =
  'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium hover:bg-slate-100';
const close =
  'absolute right-2 top-2 rounded-md p-1 opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500';

export const Toaster = ToastPrimitive.Provider;
export const ToastViewport = ToastPrimitive.Viewport;
export const Toast = ToastPrimitive.Root;
export const ToastTitle = ToastPrimitive.Title;
export const ToastDescription = ToastPrimitive.Description;
export const ToastAction = ToastPrimitive.Action;
export const ToastClose = ToastPrimitive.Close;

export function ToastViewportStyled({ className = '', ...props }) {
  return (
    <ToastPrimitive.Viewport
      className={`${viewport} ${className}`}
      {...props}
    />
  );
}

export function ToastRootStyled({ className = '', ...props }) {
  return <ToastPrimitive.Root className={`${root} ${className}`} {...props} />;
}

export function ToastTitleStyled({ className = '', ...props }) {
  return (
    <ToastPrimitive.Title className={`${title} ${className}`} {...props} />
  );
}

export function ToastDescriptionStyled({ className = '', ...props }) {
  return (
    <ToastPrimitive.Description
      className={`${description} ${className}`}
      {...props}
    />
  );
}

export function ToastActionStyled({ className = '', altText, ...props }) {
  return (
    <ToastPrimitive.Action
      altText={altText}
      className={`${action} ${className}`}
      {...props}
    />
  );
}

export function ToastCloseStyled({ className = '', ...props }) {
  return (
    <ToastPrimitive.Close className={`${close} ${className}`} {...props} />
  );
}
