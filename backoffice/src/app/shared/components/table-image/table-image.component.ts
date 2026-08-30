import { Component, Input } from '@angular/core';

/**
 * Fixed 28×28 table thumbnail. Host is the crop box; img uses !important so
 * Tailwind Preflight (`img { height: auto }`) cannot grow portrait assets.
 */
@Component({
  selector: 'app-table-image',
  standalone: true,
  templateUrl: './table-image.component.html',
  styles: `
    :host {
      display: inline-block;
      box-sizing: border-box;
      width: 28px;
      height: 28px;
      overflow: hidden;
      vertical-align: middle;
      line-height: 0;
      border-radius: 6px;
      border: 1px solid var(--n-20);
      background: var(--n-05);
    }

    a {
      display: block;
      width: 100%;
      height: 100%;
    }

    img {
      display: block;
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      object-position: center;
    }
  `,
})
export class TableImageComponent {
  @Input() public src: string | null = null;
  @Input() public alt = 'Image';
}
