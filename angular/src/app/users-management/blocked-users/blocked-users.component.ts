import { HttpParams } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { finalize } from 'rxjs';

import { PAGING } from '../../shared/constants/constants';
import { addUsernameFilter, baseHttpParams } from '../../shared/functions/core.function';
import { UsersService } from '../../shared/services/users.service';

@Component({
  selector: 'app-money-recharge',
  templateUrl: './blocked-users.component.html',
  standalone: false,
})
export class BlockedUsersComponent implements AfterViewInit, OnInit {
  private translate = inject(TranslateService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);

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
    'holdingMoney',
    'points',
    'moneyDepositCount',
    'moneyDeposit',
    'moneyWithdrawalCount',
    'moneyWithdrawal',
    'pointsExchange',
    'pointsExchange',
    'pointsExchangeCount',
    'couponPointsExchange',
    'couponPointsExchangeCount',
    'createdAt',
    'lastLogin',
    'status',
    'blockedAt',
  ];
  public dataSource = new MatTableDataSource<any>([]);
  public isLoading: boolean = true;

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
      blocked_after: [''],
      blocked_before: [''],
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
    requestParams = addUsernameFilter(requestParams, this.searchForm)
      .set('filter[blocked_after]', this.searchForm.value.blocked_after ? moment(this.searchForm.value.blocked_after).format('YYYY-MM-DD') : '')
      .set('filter[blocked_before]', this.searchForm.value.blocked_before ? moment(this.searchForm.value.blocked_before).format('YYYY-MM-DD') : '')
      .set('filter[status]', 'block');

    this.usersService
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
