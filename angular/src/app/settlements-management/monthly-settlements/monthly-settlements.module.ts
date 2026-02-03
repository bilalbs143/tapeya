import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { MonthlySettlementsRoutingModule } from './monthly-settlements-routing.module';
import { MonthlySettlementsComponent } from './monthly-settlements.component';

@NgModule({
  declarations: [MonthlySettlementsComponent],
  imports: [CommonModule, MonthlySettlementsRoutingModule, SharedModule, ReactiveFormsModule, TranslateModule],
})
export class MonthlySettlementsModule {}
