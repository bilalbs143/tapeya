import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-submit-button',
  imports: [MatButtonModule, TranslateModule, MatProgressSpinnerModule],
  templateUrl: './submit-button.component.html',
})
export class SubmitButtonComponent {
  @Input() public isSubmitting: boolean = false;
  @Input() public disabled: boolean = false;
  @Input() public top: number = 3;
  @Input() public text: string = 'SUBMIT';
  @Input() public classesName: string = 'm-l-8';
  @Input() public focusInitial: boolean = false;
}
