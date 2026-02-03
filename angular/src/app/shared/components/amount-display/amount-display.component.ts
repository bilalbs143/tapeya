import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

import { SharedPipeModule } from '../../pipes/shared-pipe.module';

@Component({
  selector: 'app-amount-display',
  imports: [DecimalPipe, SharedPipeModule],
  templateUrl: './amount-display.component.html',
})
export class AmountDisplayComponent {
  @Input() public value: any;
  protected readonly Math = Math;
}
