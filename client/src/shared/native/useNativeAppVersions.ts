import { useNativeStoreVersionInfo } from './useNativeStoreVersionInfo';

/** Native drawer footer: installed app version vs public system-settings store version. */
export function useNativeAppVersions() {
  const { isNativeMobile, installedVersion, configuredVersion } = useNativeStoreVersionInfo();
  return { isNativeMobile, installedVersion, configuredVersion };
}
