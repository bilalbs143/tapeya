import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';

@Component({
  selector: 'app-submit-button',
  standalone: true,
  imports: [MatButtonModule, LoaderComponent],
  templateUrl: './submit-button.component.html',
})
export class SubmitButtonComponent {
  @Input() public isSubmitting = false;
  @Input() public disabled = false;
  @Input() public text = 'Submit';
  @Input() public className = 'ml-4';
  @Input() public color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() public focusInitial = false;
  @Input() public buttonType: 'button' | 'submit' = 'submit';
  /** Fired for `buttonType="button"` actions outside a form. */
  @Output() public readonly action = new EventEmitter<void>();

  public onClick(): void {
    if (this.buttonType === 'button') {
      this.action.emit();
    }
  }
}
