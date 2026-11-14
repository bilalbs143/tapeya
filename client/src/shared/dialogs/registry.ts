import { type ComponentProps, lazy } from 'react';

import { AppUpdateDialog } from './AppUpdateDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { DownloadAppDialog } from './DownloadAppDialog';
import { SessionExpiredDialog } from './SessionExpiredDialog';

/** Lazy: registry must not pull feature RTK/API graphs into early shared modules. */
const InterestCampaignDialog = lazy(() =>
  import('@/features/interest/ui/InterestCampaignDialog').then((m) => ({
    default: m.InterestCampaignDialog,
  }))
);

/** Global dialog registry — imports feature-owned bodies; §13.4 exception to feature index-only exports. */
export const DIALOG_COMPONENTS = {
  confirm: ConfirmDialog,
  sessionExpired: SessionExpiredDialog,
  appUpdate: AppUpdateDialog,
  downloadApp: DownloadAppDialog,
  interestCampaign: InterestCampaignDialog,
};

type DialogRegistry = typeof DIALOG_COMPONENTS;
export type DialogKey = keyof DialogRegistry;
export type DialogProps<K extends DialogKey> = ComponentProps<DialogRegistry[K]>;

export const DIALOG_CONTENT_CLASS_BY_KEY: Partial<Record<DialogKey, string>> = {
  interestCampaign: 'flex min-h-0 flex-1 flex-col',
};

export const DIALOG_SHELL_CLASS_BY_KEY: Partial<Record<DialogKey, string>> = {
  interestCampaign: 'max-tab:max-h-[90dvh] tab:max-h-[min(90dvh,720px)]',
};

/** `sessionExpired` — no overlay/X; DialogHost routes dismiss to `onLogIn`. */
export const DIALOG_SHOW_CLOSE_BY_KEY: Partial<Record<DialogKey, boolean>> = {
  sessionExpired: false,
};
