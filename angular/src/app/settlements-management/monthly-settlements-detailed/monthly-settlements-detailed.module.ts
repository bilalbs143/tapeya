import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { MonthlySettlementsDetailedRoutingModule } from './monthly-settlements-detailed-routing.module';
import { MonthlySettlementsDetailedComponent } from './monthly-settlements-detailed.component';

@NgModule({
  declarations: [MonthlySettlementsDetailedComponent],
  imports: [CommonModule, MonthlySettlementsDetailedRoutingModule, SharedModule, ReactiveFormsModule, TranslateModule],
})
export class MonthlySettlementsDetailedModule {}
