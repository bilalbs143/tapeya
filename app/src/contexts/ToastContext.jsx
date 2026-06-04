import { createContext, useCallback, useState } from 'react';

import { ToastDescriptionStyled, ToastRootStyled, ToastTitleStyled, ToastViewportStyled } from '@/ui/Toast';

// Provider + context in one module is intentional; only ToastProvider is hot-reloaded as a component boundary.
// eslint-disable-next-line react-refresh/only-export-components -- context instance must be shared with consumers
export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    title: '',
    description: '',
    variant: 'default',
  });

  const show = useCallback((options) => {
    const opts = typeof options === 'string' ? { description: options } : options;
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
  toast.success = (description, title = 'Success') => show({ title, description, variant: 'success' });
  toast.error = (description, title = 'Error') => show({ title, description, variant: 'error' });
  toast.info = (description, title = '') => show({ title: title || 'Info', description, variant: 'default' });

  const handleOpenChange = useCallback((open) => {
    if (!open) setState((s) => ({ ...s, open: false }));
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastViewportStyled />
      <ToastRootStyled variant={state.variant} open={state.open} onOpenChange={handleOpenChange} duration={5000}>
        {state.title && <ToastTitleStyled>{state.title}</ToastTitleStyled>}
        <ToastDescriptionStyled descriptionOnly={!state.title}>{state.description}</ToastDescriptionStyled>
      </ToastRootStyled>
    </ToastContext.Provider>
  );
}
