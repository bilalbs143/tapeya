import { beforeEach, describe, expect, it, vi } from 'vitest';

const hide = vi.fn(async () => undefined);
const getPlatform = vi.fn((): 'web' | 'ios' | 'android' => 'web');

vi.mock('@capacitor/core', () => ({
  SystemBars: { hide },
  SystemBarType: { NavigationBar: 'NavigationBar', StatusBar: 'StatusBar' },
}));

vi.mock('@/shared/platform/platform', () => ({
  getPlatform: () => getPlatform(),
}));

describe('androidSystemNav', () => {
  beforeEach(() => {
    hide.mockClear();
    getPlatform.mockReturnValue('web');
  });

  it('no-ops on web and iOS', async () => {
    const { startAndroidSystemNavHidden } = await import('./androidSystemNav');
    getPlatform.mockReturnValue('web');
    await startAndroidSystemNavHidden();
    getPlatform.mockReturnValue('ios');
    await startAndroidSystemNavHidden();
    expect(hide).not.toHaveBeenCalled();
  });

  it('hides only the NavigationBar on Android', async () => {
    getPlatform.mockReturnValue('android');
    const { startAndroidSystemNavHidden, reapplyAndroidSystemNavHidden } = await import('./androidSystemNav');
    await startAndroidSystemNavHidden();
    await reapplyAndroidSystemNavHidden();
    expect(hide).toHaveBeenCalledTimes(2);
    expect(hide).toHaveBeenCalledWith({ bar: 'NavigationBar' });
  });
});
