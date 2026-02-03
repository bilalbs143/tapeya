import { HttpParams } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';

import { PAGING } from '../../shared/constants/constants';
import { addCreatedFilter, addUsernameFilter, baseHttpParams } from '../../shared/functions/core.function';
import { MessageService } from '../../shared/services/message.service';
import { PusherService } from '../../shared/services/pusher.service';
import { StatsService } from '../../shared/services/stats.service';
import { UsersService } from '../../shared/services/users.service';

@Component({
  selector: 'app-losing-money-withdraw',
  templateUrl: './membership-requests.component.html',
  standalone: false,
})
export class MembershipRequestsComponent implements AfterViewInit, OnInit {
  private readonly messageService = inject(MessageService);
  private usersService = inject(UsersService);
  private pusherService = inject(PusherService);
  private statsService = inject(StatsService);
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
    'agentRecommender',
    'userRecommender',
    'bankName',
    'accountHolder',
    'accountNumber',
    'phoneNumber',
    'registrationIp',
    'status',
    'dob',
    'level',
    'created_at',
  ];
  public dataSource = new MatTableDataSource<any>([]);
  public isLoading: boolean = true;

  public onEvent(data: any): void {
    this.loadHttpData();
    this.pusherService.playAudio(data.sound);
  }
  public ngOnInit(): void {
    this.pusherService.on('Auth\\UserRegistered', this.onEvent.bind(this));
    this.initialiseSearchForm();
    this.loadHttpData();
  }

  public ngAfterViewInit(): void {
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

  public openActionDialog(type: string, id: number): void {
    if (type === 'ACCEPT') {
      this.messageService.openPromptDialog(
        'MEMBERSHIP_REQUEST',
        'WOULD_YOU_LIKE_TO_ACCEPT_THE_MEMBERSHIP_REQUEST',
        'ACCEPT',
        'CANCEL',
        (data) => this.usersService.updateStatus(data),
        { status: 'approved', id },
        () => this.loadHttpData()
      );
    } else {
      this.messageService.openPromptDialog(
        'MEMBERSHIP_REQUEST',
        'WOULD_YOU_LIKE_TO_REJECT_THE_MEMBERSHIP_REQUEST',
        'REJECT',
        'CANCEL',
        (data) => this.usersService.updateStatus(data),
        { status: 'rejected', id },
        () => this.afterDialogClosed()
      );
    }
  }

  private afterDialogClosed(): void {
    this.loadHttpData();
    this.statsService.notifyRequestProcessed();
  }

  public loadHttpData(currentPageView = this.currentPage, perPageLimit = this.pageSize): void {
    let requestParams: HttpParams = baseHttpParams(perPageLimit, currentPageView, this.sort);
    requestParams = addUsernameFilter(requestParams, this.searchForm);
    requestParams = addCreatedFilter(requestParams, this.searchForm).set('filter[status]', this.searchForm.value.status || '');

    this.isLoading = true;
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
