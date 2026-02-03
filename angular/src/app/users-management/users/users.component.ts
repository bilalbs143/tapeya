import { Component, ViewChild, AfterViewInit, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import {
  addCreatedFilter,
  addUsernameFilter,
  baseHttpParams,
  calculateUsersStats,
  getLoginIpColorClass,
} from 'src/app/shared/functions/core.function';

import { PAGING, TABLE_LOADER } from '../../shared/constants/constants';
import { UsersService } from '../../shared/services/users.service';

@Component({
  selector: 'app-coupon-points-exchange',
  templateUrl: './users.component.html',
  standalone: false,
})
export class UsersComponent implements AfterViewInit, OnInit {
  private translate = inject(TranslateService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;
  public tableLoader = TABLE_LOADER;
  public sumArray: any;
  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public readonly displayedColumns: string[] = [
    '#',
    'name',
    'username',
    'holdingMoney',
    'points',
    'couponPoints',
    'moneyDeposit',
    'moneyWithdrawal',
    'bankName',
    'accountHolder',
    'accountNumber',
    'phoneNumber',
    'userRecommender',
    'agentRecommender',
    'status',
    'lastLoginDomain',
    'lastLoginAt',
    'lastWithdrawalMoneyAt',
    'registrationIp',
    'cratedAt',
    'lastLoginIp',
    'level',
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
      created_before: [''],
      created_after: [''],
      status: [''],
      phone: [''],
      bank_account_number: [''],
      ip: [''],
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
    let requestParams = baseHttpParams(perPageLimit, currentPageView, this.sort);
    requestParams = addUsernameFilter(requestParams, this.searchForm);
    requestParams = addCreatedFilter(requestParams, this.searchForm);
    requestParams = requestParams.set('filter[status]', this.searchForm.value.status || 'active,block');

    if (this.searchForm.value.phone) {
      requestParams = requestParams.set('filter[phone]', this.searchForm.value.phone);
    }

    if (this.searchForm.value.bank_account_number) {
      requestParams = requestParams.set('filter[bank_account.account_number]', this.searchForm.value.bank_account_number);
    }

    if (this.searchForm.value.ip) {
      requestParams = requestParams.set('filter[ip]', this.searchForm.value.ip);
    }

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
          this.sumArray = calculateUsersStats(this.dataSource.data);
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

  public getLoginIpClass(element: any): string {
    return getLoginIpColorClass(element.created_at_ip, element.last_login?.ip_address);
  }
}
