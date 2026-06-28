/** Keys for {@link ProfileRoleOverview} in `ProfileRoleOverview.jsx`. */
export const PROFILE_OVERVIEW_ROLE = {
  PLAYER: 'player',
  ORGANIZER: 'organizer',
  SPONSOR: 'sponsor',
};

/** Max width for profile tab content, aligned with app layout. */
export const CONTENT_MAX_WIDTH = 'max-w-[1100px]';

/** Single centered shell for profile role tabs (player / organizer / sponsor). */
export const PROFILE_SHELL_CLASS = `mx-auto w-full min-w-0 ${CONTENT_MAX_WIDTH}`;

/** Reusable focus ring for interactive elements in dark profile UI. */
export const FOCUS_RING =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D8A11E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F0F]';
