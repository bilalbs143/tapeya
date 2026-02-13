import type { Toolbar } from 'ngx-editor';

/** Toolbar config for ngx-editor (e.g. product description). */
export const NGX_EDITOR_TOOLBAR: Toolbar = [
  ['bold', 'italic'],
  ['underline'],
  ['ordered_list', 'bullet_list'],
  [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
  ['link'],
  ['text_color', 'background_color'],
  ['align_left', 'align_center', 'align_right', 'align_justify'],
];
