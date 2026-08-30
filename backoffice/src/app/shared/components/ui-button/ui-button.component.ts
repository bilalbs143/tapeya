import { booleanAttribute, ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Button variants:
 * - primary   — solid accent; ONE per view / dialog footer
 * - secondary — white + neutral border (Cancel, Search, Export, Filters)
 * - ghost     — transparent, quiet text actions (Clear, tertiary)
 * - danger    — quiet destructive: white + danger border/text (row Delete, Archive)
 * - danger-solid — solid danger fill; confirmation dialogs only
 *
 * Default is secondary — never primary. Primary must be opted into explicitly.
 *
 * Styles live in `assets/scss/override-component/_ui-button.scss` (global
 * boot styles) so route changes never flash UA button chrome.
 */
export type UiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-solid';
export type UiButtonSize = 'sm' | 'md';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="'ui-btn ui-btn--' + variant + ' ui-btn--' + size"
      [attr.cdkFocusInitial]="focusInitial ? '' : null"
    >
      @if (loading) {
        <span class="ui-btn__spinner" aria-hidden="true"></span>
      }
      <ng-content></ng-content>
    </button>
  `,
})
export class UiButtonComponent {
  /** Default is secondary — primary must be explicit. */
  @Input() public variant: UiButtonVariant = 'secondary';
  @Input() public size: UiButtonSize = 'md';
  @Input({ transform: booleanAttribute }) public disabled = false;
  @Input({ transform: booleanAttribute }) public loading = false;
  @Input({ transform: booleanAttribute }) public focusInitial = false;
  @Input() public type: 'button' | 'submit' = 'button';
}
