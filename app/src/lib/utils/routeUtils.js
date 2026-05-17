/**
 * Returns the post-login destination, avoiding redirect loops back to /login.
 * @param {object} state - React Router location state (or any object with state.from.pathname)
 */
export function getRedirectPath(state) {
  const from = state?.from?.pathname;
  return from && from !== '/login' ? from : '/home';
}
