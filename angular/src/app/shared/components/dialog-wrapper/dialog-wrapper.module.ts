import { NgModule } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialogModule, MatDialogTitle } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { TablerIconComponent } from '@luoxiao123/angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';

import { DialogWrapperComponent } from './dialog-wrapper.component';

@NgModule({
  declarations: [DialogWrapperComponent],
  exports: [DialogWrapperComponent],
  imports: [TranslateModule, MatDialogTitle, MatDividerModule, MatDialogModule, TablerIconComponent, MatIconButton],
})
export class DialogWrapperModule {}
