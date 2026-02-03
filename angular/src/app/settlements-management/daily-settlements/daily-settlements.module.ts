import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { DailySettlementsRoutingModule } from './daily-settlements-routing.module';
import { DailySettlementsComponent } from './daily-settlements.component';

@NgModule({
  declarations: [DailySettlementsComponent],
  imports: [CommonModule, DailySettlementsRoutingModule, SharedModule, TranslateModule, ReactiveFormsModule],
})
export class DailySettlementsModule {}
