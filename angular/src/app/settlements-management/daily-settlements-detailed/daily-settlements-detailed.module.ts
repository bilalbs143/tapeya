import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { DailySettlementsDetailedRoutingModule } from './daily-settlements-detailed-routing.module';
import { DailySettlementsDetailedComponent } from './daily-settlements-detailed.component';

@NgModule({
  declarations: [DailySettlementsDetailedComponent],
  imports: [CommonModule, DailySettlementsDetailedRoutingModule, SharedModule, TranslateModule, ReactiveFormsModule],
})
export class DailySettlementsDetailedModule {}
