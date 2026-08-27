const SPLASH_PLAYED_KEY = 'tapeya_splash_played';

export function hasSplashPlayedThisSession() {
  try {
    return sessionStorage.getItem(SPLASH_PLAYED_KEY) === '1';
  } catch {
    return false;
  }
}

export function markSplashPlayedThisSession() {
  try {
    sessionStorage.setItem(SPLASH_PLAYED_KEY, '1');
  } catch {
    // private mode / quota
  }
}

export function clearSplashPlayedThisSession() {
  try {
    sessionStorage.removeItem(SPLASH_PLAYED_KEY);
  } catch {
    // ignore
  }
}

/**
 * @param {{ isAuthenticated?: boolean, isReturning?: boolean }} [args]
 * @returns {'/home'|'/login'|'/register'}
 */
export function resolveSplashDestination({ isAuthenticated = false, isReturning = false } = {}) {
  if (isAuthenticated) return '/home';
  if (isReturning) return '/login';
  return '/register';
}
