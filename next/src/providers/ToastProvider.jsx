'use client';

import { useTheme } from 'next-themes';
import { createContext, useEffect, useMemo, useState } from 'react';
import { ToastContainer } from 'react-toastify';

const ToastContext = createContext();

// Toast Provider Component
export function ToastProvider({ children }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize the value object to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      theme: resolvedTheme,
      mounted,
    }),
    [resolvedTheme, mounted],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted && (
        <ToastContainer
          position="top-right"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="z-[9999]"
          theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        />
      )}
    </ToastContext.Provider>
  );
}
