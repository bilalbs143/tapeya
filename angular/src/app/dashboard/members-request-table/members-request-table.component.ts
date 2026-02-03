import { Component, OnInit, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { StatsService } from '../../shared/services/stats.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-members-request-table',
  imports: [SharedModule, TranslateModule],
  templateUrl: './members-request-table.component.html',
})
export class MembersRequestTableComponent implements OnInit {
  private statsService = inject(StatsService);

  public isLoading: boolean = true;
  public displayedColumns: string[] = ['#', 'name', 'username', 'phoneNumber', 'type', 'status'];
  public dataSource = new MatTableDataSource<any>([]);

  public ngOnInit(): void {
    this.loadHttpData();
  }

  public loadHttpData(): void {
    this.isLoading = true;

    this.statsService
      .requests()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.data || [];
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }
}
