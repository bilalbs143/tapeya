/**
 * @param {'text'|'image'|'video'|undefined} type
 * @param {boolean} isAuthenticated
 */
export function composeDestination(type, isAuthenticated) {
  if (!isAuthenticated) {
    return {
      pathname: '/login',
      state: { from: type ? `/feed/compose?type=${type}` : '/feed/compose' },
    };
  }
  return {
    pathname: '/feed/compose',
    search: type ? `?type=${type}` : '',
    state: type ? { type } : undefined,
  };
}
