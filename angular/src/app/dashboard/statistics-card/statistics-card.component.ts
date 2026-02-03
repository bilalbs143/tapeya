import {} from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '../../shared/auth/auth.service';
import { AmountDisplayComponent } from '../../shared/components/amount-display/amount-display.component';
import { getLoggedInUserType } from '../../shared/functions/core.function';
import { StatsService } from '../../shared/services/stats.service';

@Component({
  selector: 'app-statistics-card',
  imports: [MatCardModule, TranslateModule, AmountDisplayComponent],
  templateUrl: './statistics-card.component.html',
})
export class StatisticsCardComponent implements OnInit {
  private statsService = inject(StatsService);
  private authService = inject(AuthService);

  public data: any;
  public user: any;
  public loggedInUserType: string = getLoggedInUserType() || '';
  public topCards: any[] = [
    {
      color: 'primary',
      img: '/assets/images/svgs/total-profit.svg',
      title: 'TOTAL_PROFIT',
      dataKey: 'total_difference',
      value: 0,
    },
    {
      color: 'warning',
      img: '/assets/images/svgs/total-deposit.svg',
      title: 'TOTAL_DEPOSIT',
      dataKey: 'total_deposit',
      value: 0,
    },
    {
      color: 'secondary',
      img: '/assets/images/svgs/total-withdrawals.svg',
      title: 'TOTAL_WITHDRAWALS',
      dataKey: 'total_withdrawal',
      value: 0,
    },
    {
      color: 'error',
      img: '/assets/images/svgs/total-betting.svg',
      title: 'TOTAL_BETTING',
      dataKey: 'total_betting',
      value: 0,
    },
    {
      color: 'success',
      img: '/assets/images/svgs/total-winning.svg',
      title: 'BETTING_WINING',
      dataKey: 'betting_winning',
      value: 0,
    },
    {
      color: 'secondary',
      img: '/assets/images/svgs/betting-profit.svg',
      title: 'BETTING_PROFIT',
      dataKey: 'betting_profit',
      value: 0,
    },
  ];
  public statisticsCards = [
    { title: 'TOTAL_HOLDING_MONEY', dataKey: 'total_holding_money', value: 0 },
    { title: 'TOTAL_POINTS', dataKey: 'total_points', value: 0 },
    { title: 'TOTAL_COUPON_POINTS', dataKey: 'total_coupon_points', value: 0 },
    { title: 'TOTAL_LOSING_POINTS', dataKey: 'total_losing_points', value: 0 },
    { title: 'TOTAL_MEMBERS', dataKey: 'total_members', value: 0 },
    { title: 'TOTAL_BLACKLIST_MEMBERS', dataKey: 'total_blacklisted_members', value: 0 },
    { title: 'BETTING_TODAY', dataKey: 'betting_today', value: 0 },
    { title: 'WINNING_TODAY', dataKey: 'winning_today', value: 0 },
    { title: 'BETTING_PROFIT_TODAY', dataKey: 'betting_profit_today', value: 0 },
    { title: 'BETTING_USERS_TODAY', dataKey: 'betting_users_today', value: 0 },
    { title: 'NEW_SIGNUPS_TODAY', dataKey: 'new_members_today', value: 0 },
    { title: 'CURRENT_VISITOR', dataKey: 'current_visitors', value: 0 },
  ];

  public ngOnInit(): void {
    this.loadHttpData();
    if (this.loggedInUserType === 'AGENT') {
      this.getCurrentLoggedInUser();
    }
  }

  public loadHttpData(): void {
    this.statsService.calculations().subscribe({
      next: (response) => {
        this.data = response.data || [];
        this.updateStatisticsCards();
        this.initializeTopCards();
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }

  private updateStatisticsCards(): void {
    this.statisticsCards.forEach((card) => {
      card.value = this.data[card.dataKey] || 0;
    });
  }

  private initializeTopCards(): void {
    this.topCards.forEach((card) => {
      card.value = this.data[card.dataKey] || 0;
    });
  }

  public getCurrentLoggedInUser(): void {
    this.authService.me().subscribe({
      next: (response) => {
        this.user = response.data || '';
        console.log(this.user);
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }
}
