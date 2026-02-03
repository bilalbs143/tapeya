import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../shared/shared.module';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { LastActivitiesTableComponent } from './last-activities-table/last-activities-table.component';
import { MembersRequestTableComponent } from './members-request-table/members-request-table.component';
import { ProvidersTableComponent } from './providers-table/providers-table.component';
import { StatisticsCardComponent } from './statistics-card/statistics-card.component';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    SharedModule,
    DashboardRoutingModule,
    StatisticsCardComponent,
    TranslateModule,
    LastActivitiesTableComponent,
    MembersRequestTableComponent,
    ProvidersTableComponent,
  ],
})
export class DashboardModule {}
