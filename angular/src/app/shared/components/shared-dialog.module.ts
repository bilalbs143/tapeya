import { NgModule } from '@angular/core';

import { SharedModule } from '../shared.module';

import { DialogWrapperModule } from './dialog-wrapper/dialog-wrapper.module';
import { PromptDialogModule } from './prompt-dialog/prompt-dialog.module';

@NgModule({
  imports: [SharedModule, PromptDialogModule, DialogWrapperModule],
  exports: [PromptDialogModule, DialogWrapperModule],
})
export class SharedDialogModule {}
