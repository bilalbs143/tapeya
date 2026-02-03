import { Component } from '@angular/core';

// components
import { AppWelcomeCardComponent } from '../../../components/dashboard2/welcome-card/welcome-card.component';
import { AppExpenseComponent } from '../../../components/dashboard2/expense/expense.component';
import { AppUserActivityComponent } from '../../../components/dashboard2/user-activity/user-activity.component';
import { AppMonthlyEarningsTwoComponent } from '../../../components/dashboard2/monthly-earnings/monthly-earnings.component';
import { AppPaymentGatewaysComponent } from '../../../components/dashboard2/payment-gateways/payment-gateways.component';
import { AppRecentTransactionsComponent } from '../../../components/dashboard2/recent-transactions/recent-transactions.component';
import { AppTopProjectsComponent } from '../../../components/dashboard2/top-projects/top-projects.component';
import { AppSalesComponent } from 'src/app/components/dashboard2/sales/sales.component';
import { AppCustomerSegmentationComponent } from 'src/app/components/dashboard2/customer-segmentation/customer-segmentation.component';
import { AppSalesTwoComponent } from 'src/app/components/dashboard2/sales-two/sales-two.component';
import { AppGrowthComponent } from 'src/app/components/dashboard2/growth/growth.component';
import { AppQuarterlyStatsComponent } from 'src/app/components/dashboard2/quarterly-stats/quarterly-stats.component';
import { AppWeeklySalesComponent } from 'src/app/components/dashboard2/weekly-sales/weekly-sales.component';

@Component({
  selector: 'app-dashboard2',
  imports: [
    AppWelcomeCardComponent,
    AppExpenseComponent,
    AppTopProjectsComponent,
    AppUserActivityComponent,
    AppCustomerSegmentationComponent,
    AppSalesComponent,
    AppSalesTwoComponent,
    AppGrowthComponent,
    AppMonthlyEarningsTwoComponent,
    AppQuarterlyStatsComponent,
    AppWeeklySalesComponent,
    AppPaymentGatewaysComponent,
    AppRecentTransactionsComponent,
    AppTopProjectsComponent,
  ],
  templateUrl: './dashboard2.component.html',
})
export class AppDashboard2Component {
  constructor() {}
}
