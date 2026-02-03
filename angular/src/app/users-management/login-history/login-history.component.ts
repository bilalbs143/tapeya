import { HttpParams } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { finalize } from 'rxjs';

import { PAGING } from '../../shared/constants/constants';
import { addUsernameFilter, baseHttpParams } from '../../shared/functions/core.function';
import { LoginHistoryService } from '../../shared/services/login-history.service';

@Component({
  selector: 'app-history.component',
  templateUrl: './login-history.component.html',
  standalone: false,
})
export class LoginHistoryComponent implements AfterViewInit, OnInit {
  private loginHistoryService = inject(LoginHistoryService);
  private fb = inject(FormBuilder);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;
  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public displayedColumns: string[] = ['#', 'name', 'username', 'loginAt', 'logoutAt', 'status', 'type', 'loginIp', 'domain', 'userAgent'];
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
      login_before: [''],
      login_after: [''],
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
    requestParams = addUsernameFilter(requestParams, this.searchForm, 'authenticatable.')
      .set('filter[login_after]', this.searchForm.value.login_after ? moment(this.searchForm.value.login_after).format('YYYY-MM-DD') : '')
      .set('filter[login_before]', this.searchForm.value.login_before ? moment(this.searchForm.value.login_before).format('YYYY-MM-DD') : '');

    this.loginHistoryService
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
