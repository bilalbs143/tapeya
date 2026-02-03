import { HttpParams } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';

import { PAGING } from '../../shared/constants/constants';
import { addCreatedFilter, addUsernameFilter, baseHttpParams, calculateTransactionsRequestStats } from '../../shared/functions/core.function';
import { TransactionRequestsService } from '../../shared/services/transaction-requests.service';

@Component({
  selector: 'app-coupon-points-exchange',
  templateUrl: './coupon-points-exchange.component.html',
  standalone: false,
})
export class CouponPointsExchangeComponent implements AfterViewInit, OnInit {
  private readonly transactionRequestsService = inject(TransactionRequestsService);
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
    'createdAt',
    'ipAddress',
  ];
  public dataSource = new MatTableDataSource([]);

  public ngOnInit(): void {
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

  public loadHttpData(currentPageView = this.currentPage, perPageLimit = this.pageSize): void {
    this.isLoading = true;
    let requestParams: HttpParams = baseHttpParams(perPageLimit, currentPageView, this.sort);
    requestParams = addCreatedFilter(requestParams, this.searchForm);
    requestParams = addUsernameFilter(requestParams, this.searchForm, 'creator.')
      .set('filter[status]', this.searchForm.value.status || '')
      .set('filter[type]', 'coupon_points_exchange');

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
