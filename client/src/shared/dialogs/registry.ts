import type { ComponentProps } from 'react';

import { AppUpdateDialog } from './AppUpdateDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { SessionExpiredDialog } from './SessionExpiredDialog';

/** Global dialog registry — imports feature-owned bodies; §13.4 exception to feature index-only exports. */
export const DIALOG_COMPONENTS = {
  confirm: ConfirmDialog,
  sessionExpired: SessionExpiredDialog,
  appUpdate: AppUpdateDialog,
};

type DialogRegistry = typeof DIALOG_COMPONENTS;
export type DialogKey = keyof DialogRegistry;
export type DialogProps<K extends DialogKey> = ComponentProps<DialogRegistry[K]>;

export const DIALOG_CONTENT_CLASS_BY_KEY: Partial<Record<DialogKey, string>> = {};

/** `sessionExpired` — no overlay/X; DialogHost routes dismiss to `onLogIn`. */
export const DIALOG_SHOW_CLOSE_BY_KEY: Partial<Record<DialogKey, boolean>> = {
  sessionExpired: false,
};
