import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';

import { PAGING } from '../../shared/constants/constants';
import { addCreatedFilter, baseHttpParams } from '../../shared/functions/core.function';
import { CustomerInquiriesService } from '../../shared/services/customer-inquiries.service';
import { DialogData, MessageService } from '../../shared/services/message.service';
import { PusherService } from '../../shared/services/pusher.service';
import { StatsService } from '../../shared/services/stats.service';

import { ManageCustomerInquiriesDialogComponent } from './manage-customer-inquiries-dialog/manage-customer-inquiries-dialog.component';

@Component({
  selector: 'app-customer-inquires',
  templateUrl: './customer-inquires.component.html',
  standalone: false,
})
export class CustomerInquiresComponent implements AfterViewInit, OnInit {
  private customerInquiriesService = inject(CustomerInquiriesService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private statsService = inject(StatsService);
  private pusherService = inject(PusherService);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;
  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public displayedColumns: string[] = [
    '#',
    'name',
    'username',
    'level',
    'title',
    'status',
    'holdingMoney',
    'points',
    'moneyDepositCount',
    'moneyDeposit',
    'moneyWithdrawalCount',
    'moneyWithdrawal',
    'pointsExchangeCount',
    'pointsExchange',
    'couponPointsExchangeCount',
    'couponPointsExchange',
    'createdAt',
    'repliedAt',
    'readAt',
  ];

  public dataSource = new MatTableDataSource<any>([]);
  public isLoading: boolean = true;

  public onEvent(data: any): void {
    this.loadHttpData();
    this.pusherService.playAudio(data.sound);
  }

  public ngOnInit(): void {
    this.pusherService.on('User\\CustomerInquiry\\NewCustomerInquiry', this.onEvent.bind(this));
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
      created_before: [''],
      created_after: [''],
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

  public openManageCustomerInquiriesDialog(_row: any = {}): void {
    const data: DialogData = { record: _row };
    this.messageService.openDialog(ManageCustomerInquiriesDialogComponent, data, () => this.afterDialogClosed(), {
      widthSize: 'lg',
    });
  }

  private afterDialogClosed(): void {
    this.loadHttpData();
    this.statsService.notifyRequestProcessed();
  }

  public loadHttpData(currentPageView = this.currentPage, perPageLimit = this.pageSize): void {
    let requestParams: HttpParams = baseHttpParams(perPageLimit, currentPageView, this.sort);
    requestParams = addCreatedFilter(requestParams, this.searchForm)
      .set('filter[creator.username]', this.searchForm.value.username || '')
      .set('filter[creator.bank_account.account_holder]', this.searchForm.value.account_holder || '')
      .set('filter[status]', this.searchForm.value.status || '');

    this.isLoading = true;
    this.customerInquiriesService
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
