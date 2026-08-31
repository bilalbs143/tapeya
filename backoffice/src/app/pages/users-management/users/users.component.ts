import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { format } from 'date-fns';
import { Observable, Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import type { EnumOption } from 'src/app/services/enums.service';
import { EnumsService } from 'src/app/services/enums.service';
import { MessageService } from 'src/app/services/message.service';
import type { User, UserRole } from 'src/app/services/users.service';
import { UsersService } from 'src/app/services/users.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { cityCountryLine } from 'src/app/shared/functions/display.helper';
import {
  SortReloadBinder,
  onListPaginationChange,
  resetListSearchForm,
} from 'src/app/shared/functions/list-page-paging.function';
import { buildListParams } from 'src/app/shared/functions/list-params.function';

import { ManageUserDialogComponent, type ManageUserDialogResult } from './manage-user-dialog/manage-user-dialog.component';

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  active_platform: '',
  created_after: null as Date | null,
  created_before: null as Date | null,
} as const;

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatDialogModule,
    TablerIconsModule,
    CommonSharedModule,
  ],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit, OnDestroy {
  private readonly usersService = inject(UsersService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  public statusOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('user_status');
  public platformOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('active_platform');

  private readonly sortBinder = new SortReloadBinder(this);

  @ViewChild(MatSort)
  public set sort(value: MatSort | undefined) {
    this.sortBinder.bind(value);
  }

  public get sort(): MatSort | undefined {
    return this.sortBinder.current;
  }

  public searchForm: FormGroup;
  public readonly displayedColumns: string[] = [
    'sr',
    'name',
    'nickname',
    'referral_nickname',
    'email',
    'phone',
    'admin_roles',
    'playing_role',
    'bowling_style',
    'batting_style',
    'location',
    'status',
    'active_platform',
    'created_at',
    'updated_at',
    'actions',
  ];
  public dataSource = new MatTableDataSource<User>([]);
  public readonly emptyCell = EMPTY_CELL;

  public formatRoleNames(roles: UserRole[] | undefined): string {
    if (!roles?.length) return EMPTY_CELL;
    return roles.map((r) => r.name).join(', ');
  }

  public cityCountryLine(user: User): string {
    return cityCountryLine(user.city, user.country);
  }

  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;
  constructor() {
    this.initialiseSearchForm();
    this.pageSize = this.paginatorConfig.pageSize;
  }

  private initialiseSearchForm(): void {
    this.searchForm = this.fb.group({
      search: [DEFAULT_FILTERS.search],
      status: [DEFAULT_FILTERS.status],
      active_platform: [DEFAULT_FILTERS.active_platform],
      created_after: [DEFAULT_FILTERS.created_after],
      created_before: [DEFAULT_FILTERS.created_before],
    });
  }

  public ngOnInit(): void {
    this.loadHttpData();
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.sortBinder.destroy();
  }

  public resetSearchForm(): void {
    resetListSearchForm(this, DEFAULT_FILTERS);
  }

  public onPaginationChange(event: PageEvent): void {
    onListPaginationChange(this, event);
  }

  public loadHttpData(pageOverride?: number, perPageOverride?: number): void {
    const page = pageOverride ?? this.currentPage;
    const perPage = perPageOverride ?? this.pageSize;
    const filters = this.searchForm.value;
    const requestParams = buildListParams(page, perPage, this.sort ?? null, {
      search: (filters.search ?? '').trim(),
      status: filters.status ?? '',
      active_platform: filters.active_platform ?? '',
      created_after: filters.created_after ? format(filters.created_after, 'yyyy-MM-dd') : undefined,
      created_before: filters.created_before ? format(filters.created_before, 'yyyy-MM-dd') : undefined,
    });

    this.isLoading = true;
    this.usersService.getList(requestParams).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load users.');
      },
    });
  }

  public openCreateDialog(): void {
    this.messageService.openDialog<ManageUserDialogComponent, ManageUserDialogResult>(
      ManageUserDialogComponent,
      { mode: 'create' },
      (result) => result && this.loadHttpData(),
      {
        widthSize: 'md',
        disableClose: true,
      }
    );
  }

  public openEditDialog(user: User): void {
    this.messageService.openDialog<ManageUserDialogComponent, ManageUserDialogResult>(
      ManageUserDialogComponent,
      { mode: 'edit', user },
      (result) => result && this.loadHttpData(),
      {
        widthSize: 'md',
        disableClose: true,
      }
    );
  }

  public openDeleteDialog(user: User): void {
    this.sub.add(
      this.messageService
        .prompt(
          'Delete User?',
          `Delete ${user.name}? Their orders, posts, comments, and other activity will be permanently deleted too. This cannot be undone.`,
          'Delete',
          'Cancel'
        )
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.usersService.delete(user.id).subscribe({
              next: () => this.loadHttpData(),
              error: () => this.messageService.error('Failed to delete user.'),
            });
          }
        })
    );
  }

  /** Revokes self-serve broadcasting access — ends any active broadcast and deletes its VOD. */
  public openBroadcastBanDialog(user: User): void {
    this.sub.add(
      this.messageService
        .prompt(
          'Ban Broadcaster?',
          `${user.name} will lose broadcast access and any active broadcast will be ended immediately. Continue?`,
          'Ban',
          'Cancel'
        )
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.usersService.banBroadcaster(user.id).subscribe({
              next: () => this.loadHttpData(),
              error: () => this.messageService.error('Failed to revoke broadcast access.'),
            });
          }
        })
    );
  }
}
