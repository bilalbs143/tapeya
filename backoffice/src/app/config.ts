export interface AppSettings {
  theme: string;
  sidenavOpened: boolean;
  sidenavCollapsed: boolean;
  boxed: boolean;
  horizontal: boolean;
  activeTheme: string;
  cardBorder: boolean;
  navPos: 'side' | 'top';
}

export const defaults: AppSettings = {
  theme: 'light',
  sidenavOpened: false,
  sidenavCollapsed: false,
  boxed: false,
  horizontal: false,
  cardBorder: false,
  activeTheme: 'blue_theme',
  navPos: 'side',
};
