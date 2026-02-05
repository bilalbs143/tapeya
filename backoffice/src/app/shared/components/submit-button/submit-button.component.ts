import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-submit-button',
  standalone: true,
  imports: [MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './submit-button.component.html',
})
export class SubmitButtonComponent {
  @Input() public isSubmitting = false;
  @Input() public disabled = false;
  @Input() public text = 'Submit';
  @Input() public className = 'ml-4';
  @Input() public color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() public focusInitial = false;
}
