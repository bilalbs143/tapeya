import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dialog-wrapper',
  templateUrl: './dialog-wrapper.component.html',
  standalone: false,
})
export class DialogWrapperComponent {
  @Input() public dialogTitle: string;
}
