import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { PointsHistoryRoutingModule } from './points-history-routing.module';
import { PointsHistoryComponent } from './points-history.component';

@NgModule({
  declarations: [PointsHistoryComponent],
  imports: [CommonModule, SharedModule, PointsHistoryRoutingModule, ReactiveFormsModule, TranslateModule],
})
export class PointsHistoryModule {}
