import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { PointsRoutingModule } from './points-routing.module';
import { PointsComponent } from './points.component';

@NgModule({
  imports: [CommonModule, SharedModule, PointsRoutingModule, ReactiveFormsModule, TranslateModule],
  exports: [],
  declarations: [PointsComponent],
  providers: [],
})
export class PointsModule {}
