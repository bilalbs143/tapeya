/**
 * Imperative toast API. Use from any component:
 *   import { useToast } from '@/ui/useToast';
 *   const toast = useToast();
 *   toast.success('OTP sent again!');
 *   toast.error('Something went wrong.');
 *   toast('A message');
 */

import { useCallback, useState } from 'react';

import {
  Toast,
  ToastDescriptionStyled,
  ToastRootStyled,
  ToastTitleStyled,
  ToastViewportStyled,
} from '@/ui/Toast';
import { ToastContext } from '@/ui/toastContext';

const variantStyles = {
  default: 'border-slate-200 bg-white text-slate-900',
  success: 'border-emerald-500/50 bg-emerald-50 text-emerald-900',
  error: 'border-red-500/50 bg-red-50 text-red-900',
};

export function ToastProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    title: '',
    description: '',
    variant: 'default',
  });

  const show = useCallback((options) => {
    const opts =
      typeof options === 'string' ? { description: options } : options;
    setState({
      open: true,
      title: opts.title ?? '',
      description: opts.description ?? '',
      variant: opts.variant ?? 'default',
    });
  }, []);

  const toast = useCallback(
    (opts) => {
      show(opts);
    },
    [show],
  );
  toast.success = (description, title = 'Success') =>
    show({ title, description, variant: 'success' });
  toast.error = (description, title = 'Error') =>
    show({ title, description, variant: 'error' });
  toast.info = (description, title = '') =>
    show({ title: title || 'Info', description, variant: 'default' });

  const handleOpenChange = useCallback((open) => {
    if (!open) setState((s) => ({ ...s, open: false }));
  }, []);

  const rootClass = variantStyles[state.variant] ?? variantStyles.default;

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastViewportStyled />
      <Toast open={state.open} onOpenChange={handleOpenChange} duration={5000}>
        <ToastRootStyled className={rootClass}>
          {state.title && <ToastTitleStyled>{state.title}</ToastTitleStyled>}
          <ToastDescriptionStyled>{state.description}</ToastDescriptionStyled>
        </ToastRootStyled>
      </Toast>
    </ToastContext.Provider>
  );
}
