import { HttpParams } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { finalize } from 'rxjs';

import { PAGING } from '../../shared/constants/constants';
import { addUsernameFilter, baseHttpParams, getLoggedInUserType, getLoginIpColorClass } from '../../shared/functions/core.function';
import { CurrentLoginSessionsService } from '../../shared/services/current-login-sessions.service';
import { MessageService } from '../../shared/services/message.service';

@Component({
  selector: 'app-current-login-sessions',
  templateUrl: './current-login-sessions.component.html',
  standalone: false,
})
export class CurrentLoginSessionsComponent implements AfterViewInit, OnInit {
  private readonly messageService = inject(MessageService);
  private currentLoginSessionsService = inject(CurrentLoginSessionsService);
  private fb = inject(FormBuilder);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;
  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public displayedColumns: string[] = [];
  public dataSource = new MatTableDataSource<any>([]);
  public isLoading: boolean = true;

  public ngOnInit(): void {
    this.initializeDisplayedColumns();
    this.initialiseSearchForm();
    this.loadHttpData();
  }

  private initializeDisplayedColumns(): void {
    const baseColumns = ['#', 'name', 'username', 'loginAt', 'status', 'type', 'loginIp', 'domain', 'userAgent'];

    // Only show action column if user is not an AGENT
    if (getLoggedInUserType() !== 'AGENT') {
      baseColumns.push('action');
    }

    this.displayedColumns = baseColumns;
  }

  public getLoggedInUserType(): string | null {
    return getLoggedInUserType();
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

  public openActionDialog(id: number): void {
    this.messageService.openPromptDialog(
      'KILL_LOGIN_SESSION',
      'WOULD_YOU_LIKE_TO_KILL_THE_LOGIN_SESSION',
      'REJECT',
      'CANCEL',
      (data) => this.currentLoginSessionsService.kill(data),
      id,
      () => this.loadHttpData()
    );
  }

  public loadHttpData(currentPageView = this.currentPage, perPageLimit = this.pageSize): void {
    this.isLoading = true;
    let requestParams: HttpParams = baseHttpParams(perPageLimit, currentPageView, this.sort);
    requestParams = addUsernameFilter(requestParams, this.searchForm, 'authenticatable.')
      .set('filter[login_after]', this.searchForm.value.login_after ? moment(this.searchForm.value.login_after).format('YYYY-MM-DD') : '')
      .set('filter[login_before]', this.searchForm.value.login_before ? moment(this.searchForm.value.login_before).format('YYYY-MM-DD') : '');

    this.currentLoginSessionsService
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

  public getLoginIpClass(element: any): string {
    return getLoginIpColorClass(element.user?.created_at_ip, element.ip_address);
  }
}
