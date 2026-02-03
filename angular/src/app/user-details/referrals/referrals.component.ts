import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';

import { PAGING } from '../../shared/constants/constants';
import { getUserIdByURL, addCreatedFilter, baseHttpParams } from '../../shared/functions/core.function';
import { UsersService } from '../../shared/services/users.service';

@Component({
  selector: 'app-referrals',
  templateUrl: './referrals.component.html',
  styles: ``,
  standalone: false,
})
export class ReferralsComponent implements AfterViewInit, OnInit {
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;
  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public readonly displayedColumns: string[] = [
    '#',
    'name',
    'username',
    'agentRecommender',
    'userRecommender',
    'bankName',
    'accountHolder',
    'accountNumber',
    'phoneNumber',
    'status',
    'createdAt',
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
      created_before: [''],
      created_after: [''],
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

  public loadHttpData(): void {
    this.isLoading = true;
    let requestParams: HttpParams = baseHttpParams(this.pageSize, this.currentPage, this.sort);
    requestParams = addCreatedFilter(requestParams, this.searchForm)
      .set('agent_id', getUserIdByURL())
      .set('filter[username]', this.searchForm.value.username || '')
      .set('filter[bank_account.account_holder]', this.searchForm.value.account_holder || '')
      .set('filter[status]', this.searchForm.value.status || '');

    const id = Number(getUserIdByURL());
    this.usersService
      .getReferredUsers(id, requestParams)
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
