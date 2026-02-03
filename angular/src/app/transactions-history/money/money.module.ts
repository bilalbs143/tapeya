import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { MoneyRoutingModule } from './money-routing.module';
import { MoneyComponent } from './money.component';

@NgModule({
  imports: [CommonModule, SharedModule, MoneyRoutingModule, TranslateModule, ReactiveFormsModule],
  exports: [],
  declarations: [MoneyComponent],
  providers: [],
})
export class MoneyModule {}
