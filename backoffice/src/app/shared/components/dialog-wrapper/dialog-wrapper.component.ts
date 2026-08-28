import { Component, Input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialogClose, MatDialogTitle } from '@angular/material/dialog';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-dialog-wrapper',
  standalone: true,
  templateUrl: './dialog-wrapper.component.html',
  imports: [MatDialogClose, MatDialogTitle, MatIconButton, TablerIconsModule],
  styles: `
    /* mat-dialog-title brings its own 6px/24px/13px padding on top of this
       component's own px-5 pt-4 header row — strip it so the wrapper's
       utility classes stay the single source of spacing truth. */
    h3[mat-dialog-title] {
      margin: 0;
      padding: 0;
    }
  `,
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
