import { ThemeRoot } from './primitives/ThemeRoot';

export const themeMeta = {
  slug: 'theme2',
  folder: 'theme2',
  label: 'Theme 2 — Wine / Gold (controller-3 style)',
  ThemeRoot,
  styleImports: ['./styles/_tokens.css', './styles/controller.scss'],
  googleFontsUrl:
    'https://fonts.googleapis.com/css2?family=Saira:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Saira+Condensed:wght@400;500;600;700;800;900&display=swap',
  /** Used after stylesheet onload — `document.fonts.load()` per family (fonts.ready alone is not enough). */
  googleFontFamilies: ['Saira Condensed', 'Saira'],
};
