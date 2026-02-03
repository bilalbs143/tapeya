import {} from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { MessageService } from '../../shared/services/message.service';
import { ProvidersService } from '../../shared/services/providers.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-providers-table',
  imports: [SharedModule, TranslateModule],
  templateUrl: './providers-table.component.html',
})
export class ProvidersTableComponent implements OnInit {
  private providersService = inject(ProvidersService);
  private messageService = inject(MessageService);

  public isLoading: boolean = true;
  public displayedColumns: string[] = ['#', 'name', 'status'];
  public dataSource = new MatTableDataSource<any>([]);

  public ngOnInit(): void {
    this.loadHttpData();
  }

  public loadHttpData(): void {
    this.isLoading = true;
    const requestParams = new HttpParams().set('all', true);
    this.providersService
      .get(requestParams)
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

  public updateProvider(row: any, event: any): void {
    this.messageService
      .prompt('UPDATE_PROVIDER', 'WOULD_YOU_LIKE_TO_UPDATE_THE_PROVIDER', 'YES', 'CANCEL', false, true)
      .afterClosed()
      .subscribe((result: any) => {
        if (result) {
          this.providersService.update({ is_active: row.status_enum !== 'ACTIVE' }, row.id).subscribe({
            next: (response) => {
              this.messageService.snackBar(response.message);
              this.loadHttpData();
            },
            error: (error) => {
              this.messageService.snackBar(error.error.message);
            },
          });
        } else {
          event.source.checked = !event.source.checked;
        }
      });
  }
}
