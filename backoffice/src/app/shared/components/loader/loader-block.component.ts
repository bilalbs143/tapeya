import { Component, Input } from '@angular/core';

import { LoaderComponent } from './loader.component';

/**
 * Centers a `LoaderComponent` and owns the a11y announcement — the standard shape for a
 * card/tab/dialog body loading state. Replaces every hand-rolled
 * `<div class="flex items-center justify-center py-N"><app-loader /></div>` wrapper.
 *
 * Centering is intrinsic (host is `flex items-center justify-center`), so spacing utilities
 * passed via a plain `class="py-10"` attribute on `<app-loader-block>` merge onto the host
 * additively — unlike a JS-built className string, there's nothing to silently overwrite.
 *
 * <app-loader-block />                          — decent default size, centered, "Loading"
 * <app-loader-block label="Loading matches" />   — specific a11y label (recommended)
 * <app-loader-block [diameter]="28" />           — smaller ring for a compact panel
 */
@Component({
  selector: 'app-loader-block',
  standalone: true,
  imports: [LoaderComponent],
  template: `<app-loader [diameter]="diameter" [tone]="tone" [label]="null" />`,
  host: {
    class: 'flex items-center justify-center',
    role: 'status',
    '[attr.aria-label]': 'label',
  },
})
export class LoaderBlockComponent {
  @Input() public diameter: number = 40;
  @Input() public label: string = 'Loading';
  @Input() public tone: 'primary' | 'light' = 'primary';
}
