import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';

import { StatsService } from '../../services/stats.service';
import { AmountDisplayComponent } from '../amount-display/amount-display.component';

@Component({
  selector: 'app-sidebar-stats',
  imports: [AmountDisplayComponent, MatCardModule, TranslateModule],
  templateUrl: './sidebar-stats.component.html',
})
export class SidebarStatsComponent implements OnInit {
  private statsService = inject(StatsService);

  public isLoading: boolean = false;
  public data: any;

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
