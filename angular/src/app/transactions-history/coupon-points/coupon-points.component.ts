import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';

import { PAGING } from '../../shared/constants/constants';
import {
  addCreatedFilter,
  addUsernameFilter,
  baseHttpParams,
  calculateTransactionHistoryStatsByCategory,
} from '../../shared/functions/core.function';
import { TransactionsHistoryService } from '../../shared/services/transactions-history.service';

@Component({
  selector: 'app-coupon-points',
  templateUrl: './coupon-points.component.html',
  standalone: false,
})
export class CouponPointsComponent implements AfterViewInit, OnInit {
  private transactionsHistoryService = inject(TransactionsHistoryService);
  private fb = inject(FormBuilder);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;
  public searchForm: FormGroup;
  public sumArray: any;
  public categories: Array<any> = [];
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public displayedColumns: string[] = [
    '#',
    'name',
    'username',
    'beforeTransaction',
    'amount',
    'afterTransaction',
    'type',
    'memo',
    'receivedFromUser',
    'paidToUser',
    'createdAt',
  ];
  public dataSource = new MatTableDataSource<any>([]);
  public isLoading: boolean = true;

  public ngOnInit(): void {
    this.getAllCategories();
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
      category: [''],
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
    requestParams = addUsernameFilter(requestParams, this.searchForm, 'user.')
      .set('filter[sub_type]', 'coupon_points')
      .set('filter[category]', this.searchForm.value.category || '');

    this.transactionsHistoryService
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
          this.sumArray = calculateTransactionHistoryStatsByCategory(this.dataSource.data, this.categories);
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

  private getAllCategories(): void {
    this.transactionsHistoryService.categories().subscribe({
      next: (response) => {
        this.categories =
          response.sub_types.coupon_points.categories.map((item: { [x: string]: any }) => {
            const key = Object.keys(item)[0];
            return { key: key, value: item[key] };
          }) || [];
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }
}
