import { HttpParams } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';

import { PAGING } from '../../shared/constants/constants';
import { addCreatedFilter, addUsernameFilter, baseHttpParams, calculateTransactionsRequestStats } from '../../shared/functions/core.function';
import { DialogData, MessageService } from '../../shared/services/message.service';
import { PusherService } from '../../shared/services/pusher.service';
import { StatsService } from '../../shared/services/stats.service';
import { TransactionRequestsService } from '../../shared/services/transaction-requests.service';

import { RollingMoneyWithdrawActionDialogComponent } from './action-dialog/action-dialog.component';
import { RollingMoneyWithdrawDialogComponent } from './rolling-money-withdraw-dialog/rolling-money-withdraw-dialog.component';

@Component({
  selector: 'app-rolling-money-withdraw',
  templateUrl: './rolling-money-withdraw.component.html',
  standalone: false,
})
export class RollingMoneyWithdrawComponent implements AfterViewInit, OnInit {
  private readonly messageService = inject(MessageService);
  private readonly transactionRequestsService = inject(TransactionRequestsService);
  private pusherService = inject(PusherService);
  private statsService = inject(StatsService);
  private fb = inject(FormBuilder);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;
  public sumArray: any;
  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public isLoading: boolean = true;
  public displayedColumns: string[] = [
    '#',
    'name',
    'username',
    'requestedMoney',
    'depositedMoney',
    'moneyHeldAtTimeOfRequest',
    'moneyHeldAfterRequest',
    'status',
    'accountInfo',
    'requestedDate',
    'actionDate',
    'ipAddress',
  ];
  public dataSource = new MatTableDataSource([]);

  public onEvent(data: any): void {
    this.loadHttpData();
    this.pusherService.playAudio(data.sound);
  }

  public ngOnInit(): void {
    this.pusherService.on('User\\ExchangeRequest\\NewExchangeRequest', this.onEvent.bind(this));
    this.initialiseSearchForm();
    this.loadHttpData();
  }

  public ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.sort.sortChange.subscribe(() => {
      this.loadHttpData();
    });
  }

  private initialiseSearchForm(): void {
    this.searchForm = this.fb.group({
      username: [''],
      name: [''],
      created_after: [''],
      created_before: [''],
      status: [''],
    });
  }

  public onPaginationChange(event: PageEvent): void {
    const { pageIndex, pageSize } = event;

    if (this.currentPage !== pageIndex + 1 || this.pageSize !== pageSize) {
      this.currentPage = pageIndex + 1;
      this.pageSize = pageSize;
      this.loadHttpData();
    }
  }

  public openActionDialog(type: string, _row: any): void {
    if (type === 'ACCEPT') {
      const data: DialogData = { record: _row, action: '' };
      this.messageService.openDialog(RollingMoneyWithdrawActionDialogComponent, data, () => this.afterDialogClosed(), {
        widthSize: 'md',
      });
    } else {
      this.messageService.openPromptDialog(
        'ROLLING_MONEY_WITHDRAWAL_REQUEST',
        'WOULD_YOU_LIKE_TO_REJECT_THE_ROLLING_MONEY_WITHDRAWAL_REQUEST',
        'REJECT',
        'CANCEL',
        (data) => this.transactionRequestsService.rejectTransactionRequest(data),
        _row,
        () => this.afterDialogClosed()
      );
    }
  }

  public openRollingMoneyWithdrawDialog(): void {
    this.messageService.openDialog(RollingMoneyWithdrawDialogComponent, {}, () => this.afterDialogClosed(), {
      widthSize: 'md',
    });
  }

  private afterDialogClosed(): void {
    this.loadHttpData();
    this.statsService.notifyRequestProcessed();
  }

  public loadHttpData(currentPageView = this.currentPage, perPageLimit = this.pageSize): void {
    let requestParams: HttpParams = baseHttpParams(perPageLimit, currentPageView, this.sort);
    requestParams = addCreatedFilter(requestParams, this.searchForm);
    requestParams = addUsernameFilter(requestParams, this.searchForm, 'creator.')
      .set('filter[status]', this.searchForm.value.status || '')
      .set('filter[type]', 'withdraw_rolling_money');

    this.isLoading = true;
    this.transactionRequestsService
      .get(requestParams)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.data || [];
          this.totalRecords = response.meta.total || 0;
          this.sumArray = calculateTransactionsRequestStats(this.dataSource.data);
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }

  public resetSearchForm(): void {
    this.searchForm.reset();
    this.loadHttpData();
  }
}
