import { useEffect, useState } from 'react';

import { getPlatform } from '@/platform';

/**
 * Hook to get current platform (ios | android | web)
 */
export function usePlatform() {
  const [platform, setPlatform] = useState(() => getPlatform());

  useEffect(() => {
    setPlatform(getPlatform());
  }, []);

  return platform;
}
