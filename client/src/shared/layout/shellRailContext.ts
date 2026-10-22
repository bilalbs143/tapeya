import { createContext, type ReactNode } from 'react';

/** Setter only — must stay stable so registering pages do not loop. */
export const ShellRailSetContext = createContext<((node: ReactNode) => void) | null>(null);

/** Current rail node — read by AppShell only. */
export const ShellRailValueContext = createContext<ReactNode>(null);
