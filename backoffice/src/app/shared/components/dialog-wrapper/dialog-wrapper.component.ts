import { Component, Input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialogClose, MatDialogTitle } from '@angular/material/dialog';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-dialog-wrapper',
  standalone: true,
  templateUrl: './dialog-wrapper.component.html',
  imports: [MatDialogClose, MatDialogTitle, MatIconButton, TablerIconsModule],
})
export class DialogWrapperComponent {
  /**
   * Main dialog title rendered in the header.
   */
  @Input() public title: string = '';

  /**
   * Toggle visibility of the close button.
   */
  @Input() public showClose: boolean = true;
}
