import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { AppDashboard1Component } from './dashboard1/dashboard1.component';
import { AppDashboard2Component } from './dashboard2/dashboard2.component';
import { DashboardsRoutes } from './dashboards.routes';

@NgModule({
  imports: [
    RouterModule.forChild(DashboardsRoutes),
    AppDashboard1Component,
    AppDashboard2Component,
  ],
})
export class DashboardsModule { }
