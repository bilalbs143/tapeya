import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CanDirective } from './can.directive';
import { CannotDirective } from './cannot.directive';

@NgModule({
  declarations: [CanDirective, CannotDirective],
  exports: [CanDirective, CannotDirective],
  imports: [CommonModule],
})
export class DirectivesModule {}
