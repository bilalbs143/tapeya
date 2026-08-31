import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { format } from 'date-fns';
import { Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import { MessageService } from 'src/app/services/message.service';
import type { Notification } from 'src/app/services/notifications.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import {
  ADMIN_NOTIFICATION_TYPE_LABELS,
  ADMIN_NOTIFICATION_TYPE_OPTIONS,
  AdminNotificationType,
} from 'src/app/shared/constants/notification.constants';
import {
  SortReloadBinder,
  onListPaginationChange,
  resetListSearchForm,
} from 'src/app/shared/functions/list-page-paging.function';
import { buildListParams } from 'src/app/shared/functions/list-params.function';

const DEFAULT_FILTERS = {
  search: '',
  type: '',
  read: '',
  created_after: null as Date | null,
  created_before: null as Date | null,
} as const;

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MaterialModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    TablerIconsModule,
    CommonSharedModule,
  ],
  templateUrl: './notifications-list.component.html',
})
export class NotificationsListComponent implements OnInit, OnDestroy {
  private readonly notificationsService = inject(NotificationsService);
  private readonly messageService = inject(MessageService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  private readonly sortBinder = new SortReloadBinder(this);

  @ViewChild(MatSort)
  public set sort(value: MatSort | undefined) {
    this.sortBinder.bind(value);
  }

  public get sort(): MatSort | undefined {
    return this.sortBinder.current;
  }

  public searchForm: FormGroup;
  public readonly displayedColumns: string[] = ['sr', 'type', 'message', 'read_at', 'created_at', 'actions'];
  public dataSource = new MatTableDataSource<Notification>([]);
  public readonly emptyCell = EMPTY_CELL;
  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;
  public unreadCount = 0;

  public readonly AdminNotificationType = AdminNotificationType;
  public readonly typeOptions = ADMIN_NOTIFICATION_TYPE_OPTIONS;

  public readonly readOptions = [
    { value: '', label: 'All' },
    { value: '0', label: 'Unread' },
    { value: '1', label: 'Read' },
  ];

  constructor() {
    this.searchForm = this.fb.group({
      search: [DEFAULT_FILTERS.search],
      type: [DEFAULT_FILTERS.type],
      read: [DEFAULT_FILTERS.read],
      created_after: [DEFAULT_FILTERS.created_after],
      created_before: [DEFAULT_FILTERS.created_before],
    });
    this.pageSize = this.paginatorConfig.pageSize;
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
    const params = {
      ...buildListParams(page, perPage, this.sort ?? null, {}),
    } as Record<string, unknown>;
    if ((filters.search ?? '').trim() !== '') {
      params['filter[search]'] = (filters.search as string).trim();
    }
    if ((filters.type ?? '').trim() !== '') {
      params['filter[type]'] = (filters.type as string).trim();
    }
    if ((filters.read ?? '').trim() !== '') {
      params['filter[read]'] = (filters.read as string).trim();
    }
    if (filters.created_after) {
      params['filter[created_after]'] = format(filters.created_after as Date, 'yyyy-MM-dd');
    }
    if (filters.created_before) {
      params['filter[created_before]'] = format(filters.created_before as Date, 'yyyy-MM-dd');
    }
    this.isLoading = true;
    this.notificationsService.getList(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.unreadCount = res.meta?.unread_count ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load notifications.');
      },
    });
  }

  public typeLabel(type: string | null): string {
    if (!type) return this.emptyCell;
    return ADMIN_NOTIFICATION_TYPE_LABELS[type as keyof typeof ADMIN_NOTIFICATION_TYPE_LABELS] ?? type;
  }

  public messageText(notification: Notification): string {
    return notification.data?.message ?? this.emptyCell;
  }

  public markAsRead(notification: Notification): void {
    if (notification.read_at) return;
    this.notificationsService.markAsRead(notification.id).subscribe({
      next: () => {
        this.messageService.success('Marked as read.');
        this.loadHttpData();
      },
      error: () => this.messageService.error('Failed to mark as read.'),
    });
  }

  public markAllAsRead(): void {
    if (this.unreadCount === 0) return;
    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        this.messageService.success('All notifications marked as read.');
        this.loadHttpData();
      },
      error: () => this.messageService.error('Failed to mark all as read.'),
    });
  }

  public deleteAll(): void {
    if (this.totalRecords === 0) return;
    if (!confirm('Delete all notifications? This cannot be undone.')) return;
    this.notificationsService.flush().subscribe({
      next: () => {
        this.messageService.success('All notifications have been deleted.');
        this.loadHttpData();
      },
      error: () => this.messageService.error('Failed to delete notifications.'),
    });
  }
}
