import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';

import { PAGING } from '../../shared/constants/constants';
import { addCreatedFilter, baseHttpParams } from '../../shared/functions/core.function';
import { UsersService } from '../../shared/services/users.service';

@Component({
  selector: 'app-referral-downline',
  templateUrl: './referral-downline.component.html',
  styles: ``,
  standalone: false,
})
export class ReferralDownlineComponent implements AfterViewInit, OnInit {
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
  public isLoading: boolean = false;
  public isLoadingUsers: boolean = false;
  public usersWithReferrals: any[] = [];

  public ngOnInit(): void {
    this.initialiseSearchForm();
    this.loadUsersWithReferrals();
  }

  public ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.sort.sortChange.subscribe(() => {
      if (this.searchForm.value.userId) {
        this.loadHttpData();
      }
    });
  }

  private initialiseSearchForm(): void {
    this.searchForm = this.fb.group({
      userId: ['', Validators.required],
      created_before: [''],
      created_after: [''],
    });
  }

  public onPaginationChange(event: PageEvent): void {
    const { pageIndex, pageSize } = event;

    if (this.currentPage !== pageIndex + 1 || this.pageSize !== pageSize) {
      this.currentPage = pageIndex + 1;
      this.pageSize = pageSize;
      if (this.searchForm.value.userId) {
        this.loadHttpData();
      }
    }
  }

  private loadUsersWithReferrals(): void {
    this.isLoadingUsers = true;
    this.usersService
      .getUsersWithReferrals()
      .pipe(
        finalize(() => {
          this.isLoadingUsers = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.usersWithReferrals = response.data || [];
        },
        error: (error) => {
          console.error('Error loading users with referrals:', error);
        },
      });
  }

  public loadHttpData(): void {
    if (!this.searchForm.value.userId) {
      this.dataSource.data = [];
      this.totalRecords = 0;
      return;
    }

    this.isLoading = true;
    let requestParams: HttpParams = baseHttpParams(this.pageSize, this.currentPage, this.sort);
    requestParams = addCreatedFilter(requestParams, this.searchForm);

    const userId = Number(this.searchForm.value.userId);
    this.usersService
      .getReferredUsers(userId, requestParams)
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
    this.dataSource.data = [];
    this.totalRecords = 0;
  }

  public onSubmit(): void {
    if (this.searchForm.valid && this.searchForm.value.userId) {
      this.currentPage = 1;
      this.loadHttpData();
    }
  }
}
