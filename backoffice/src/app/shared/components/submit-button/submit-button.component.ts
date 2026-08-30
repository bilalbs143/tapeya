import { Component, EventEmitter, Input, Output } from '@angular/core';

import { UiButtonComponent, UiButtonVariant } from 'src/app/shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-submit-button',
  standalone: true,
  imports: [UiButtonComponent],
  templateUrl: './submit-button.component.html',
})
export class SubmitButtonComponent {
  @Input() public isSubmitting = false;
  @Input() public disabled = false;
  /** No default — every call site must say what the button actually does ("Save Brand", not "Submit"). */
  @Input({ required: true }) public text!: string;
  @Input() public className = 'ml-4';
  /** Kept as the public API (no template changes needed) — mapped to a ui-button variant internally. */
  @Input() public color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() public focusInitial = false;
  @Input() public buttonType: 'button' | 'submit' = 'submit';
  /** Fired for `buttonType="button"` actions outside a form. */
  @Output() public readonly action = new EventEmitter<void>();

  public get variant(): UiButtonVariant {
    switch (this.color) {
      case 'warn':
        return 'danger-solid';
      case 'accent':
        return 'secondary';
      default:
        return 'primary';
    }
  }

  public onClick(): void {
    if (this.buttonType === 'button') {
      this.action.emit();
    }
  }
}
