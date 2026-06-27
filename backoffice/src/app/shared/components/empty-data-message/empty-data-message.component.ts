import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-data-message',
  standalone: true,
  templateUrl: './empty-data-message.component.html',
})
export class EmptyDataMessageComponent {
  @Input() public variant: 'overlay' | 'inline' = 'overlay';

  @Input() public message: string = 'No Data Available';
}
