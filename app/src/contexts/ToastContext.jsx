import { createContext, useCallback, useState } from 'react';

import {
  Toast,
  ToastDescriptionStyled,
  ToastRootStyled,
  ToastTitleStyled,
  ToastViewportStyled,
} from '@/ui/Toast';

// Provider + context in one module is intentional; only ToastProvider is hot-reloaded as a component boundary.
// eslint-disable-next-line react-refresh/only-export-components -- context instance must be shared with consumers
export const ToastContext = createContext(null);

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
