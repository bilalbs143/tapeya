export interface AppSettings {
  theme: string;
  sidenavOpened: boolean;
  sidenavCollapsed: boolean;
}

export const defaults: AppSettings = {
  theme: 'light',
  sidenavOpened: false,
  sidenavCollapsed: false,
};
