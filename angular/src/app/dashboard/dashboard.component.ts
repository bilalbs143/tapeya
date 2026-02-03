import { Component, OnInit, inject } from '@angular/core';

import { AuthService } from '../shared/auth/auth.service';
import { StatsService } from '../shared/services/stats.service';
import { LoggedInUser } from '../shared/types/types';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: false,
})
export class DashboardComponent implements OnInit {
  private statsService = inject(StatsService);
  private authService = inject(AuthService);

  public loggedInUser: LoggedInUser;
  constructor() {
    this.loggedInUser = this.authService.getLoggedInUser();
  }

  public isLoading: boolean = true;
  public data: any = {
    total_profit: 0,
    total_deposit: 0,
    total_withdrawal: 0,
    total_betting: 0,
    betting_winning: 0,
    betting_profit: 0,
    total_holding_money: 0,
    total_points: 0,
    total_coupon_points: 0,
    total_losing_points: 0,
    total_members: 0,
    total_blacklisted_members: 0,
    betting_today: 0,
    winning_today: 0,
    betting_profit_today: 0,
    betting_users_today: 0,
    new_members_today: 0,
    current_visitors: 0,
  };

  public ngOnInit(): void {
    this.loadHttpData();
  }

  public loadHttpData(): void {
    this.isLoading = true;

    this.statsService.calculations().subscribe({
      next: (response) => {
        this.data = response.data || [];
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }
}
