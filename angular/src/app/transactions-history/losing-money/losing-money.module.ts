import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { LosingMoneyRoutingModule } from './losing-money-routing.module';
import { LosingMoneyComponent } from './losing-money.component';

@NgModule({
  imports: [CommonModule, SharedModule, LosingMoneyRoutingModule, ReactiveFormsModule, TranslateModule],
  exports: [],
  declarations: [LosingMoneyComponent],
  providers: [],
})
export class LosingMoneyModule {}
