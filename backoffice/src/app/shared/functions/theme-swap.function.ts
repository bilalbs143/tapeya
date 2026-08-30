/**
 * Applies light/dark document classes with transitions suppressed for two
 * animation frames (add class → toggle theme → paint → remove class).
 *
 * Without this, any element with a `transition` on a color/background that
 * reads a theme token (table row hover, row-action icons) visibly animates
 * through the old theme's resolved value — the token flips instantly, but
 * the transition still fires on that value change.
 *
 * No-ops when the document already matches `theme`.
 */
export function applyDocumentTheme(theme: string, htmlElement: HTMLElement = document.documentElement): void {
  const wantDark = theme === 'dark';
  const hasDark = htmlElement.classList.contains('dark-theme');
  const hasLight = htmlElement.classList.contains('light-theme');
  if (wantDark ? hasDark && !hasLight : hasLight && !hasDark) {
    return;
  }

  htmlElement.classList.add('theme-swap-in-progress');
  if (wantDark) {
    htmlElement.classList.add('dark-theme');
    htmlElement.classList.remove('light-theme');
  } else {
    htmlElement.classList.remove('dark-theme');
    htmlElement.classList.add('light-theme');
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      htmlElement.classList.remove('theme-swap-in-progress');
    });
  });
}
