/** Single theme boot key/snippet — shared by `index.html` inject and `ThemeProvider`. */
export const THEME_STORAGE_KEY = 'tapeya:theme';

/** Sync `<script>` body injected before the module bundle to avoid FOUC. */
export const THEME_BOOT_SNIPPET =
  `(function(){var s=localStorage.getItem('${THEME_STORAGE_KEY}');` +
  "var d=s==='dark'||s==='light'?s:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');" +
  "document.documentElement.setAttribute('data-theme',d);})();";
