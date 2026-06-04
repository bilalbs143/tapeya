import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
import { type PushNotificationLog, PushNotificationService } from 'src/app/services/push-notification.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { TableWrapperComponent } from 'src/app/shared/components/table-wrapper/table-wrapper.component';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { buildListParams } from 'src/app/shared/functions/list-params.function';
import { getStatusClass } from 'src/app/utils/status-class.util';

import { SendNotificationDialogComponent } from './send-notification-dialog/send-notification-dialog.component';

const DEFAULT_FILTERS = {
  status: '',
  triggered_by: '',
  created_after: null as Date | null,
  created_before: null as Date | null,
} as const;

@Component({
  selector: 'app-push-notifications',
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
    MatButtonModule,
    MatDialogModule,
    MatDatepickerModule,
    TablerIconsModule,
    TableWrapperComponent,
    PaginatorComponent,
  ],
  templateUrl: './push-notifications.component.html',
})
export class PushNotificationsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly pushService = inject(PushNotificationService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly sub = new Subscription();

  @ViewChild(MatSort) public sort!: MatSort;

  public searchForm!: FormGroup;
  public readonly displayedColumns: string[] = [
    'sr',
    'title',
    'target_type',
    'triggered_by',
    'status',
    'delivery',
    'sent_at',
    'created_at',
  ];
  public dataSource = new MatTableDataSource<PushNotificationLog>([]);
  public readonly emptyCell = EMPTY_CELL;
  public statusOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('push_notification_status');
  public triggeredByOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('push_triggered_by');

  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;

  constructor() {
    this.searchForm = this.fb.group({
      status: [DEFAULT_FILTERS.status],
      triggered_by: [DEFAULT_FILTERS.triggered_by],
      created_after: [DEFAULT_FILTERS.created_after],
      created_before: [DEFAULT_FILTERS.created_before],
    });
    this.pageSize = this.paginatorConfig.pageSize;
  }

  public ngOnInit(): void {
    this.loadHttpData();
  }

  public ngAfterViewInit(): void {
    this.sub.add(
      this.sort?.sortChange.subscribe(() => {
        this.currentPage = 0;
        this.loadHttpData();
      })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public resetSearchForm(): void {
    this.searchForm.reset(DEFAULT_FILTERS);
    this.currentPage = 0;
    this.loadHttpData();
  }

  public onPaginationChange(event: PageEvent): void {
    const { pageIndex, pageSize } = event;
    if (this.currentPage !== pageIndex || this.pageSize !== pageSize) {
      this.currentPage = pageIndex;
      this.pageSize = pageSize;
      this.loadHttpData();
    }
  }

  public openSendDialog(): void {
    const ref = this.dialog.open(SendNotificationDialogComponent, {
      width: '560px',
      disableClose: true,
    });

    this.sub.add(
      ref.afterClosed().subscribe((sent) => {
        if (sent) {
          this.loadHttpData();
        }
      })
    );
  }

  public formatDate(value: string | null | undefined): string {
    if (!value) {
      return this.emptyCell;
    }

    return format(new Date(value), 'dd MMM yyyy, HH:mm');
  }

  public statusClass(status: string): string {
    return getStatusClass(status);
  }

  public deliverySummary(row: PushNotificationLog): string {
    if (row.status === 'queued' || row.status === 'processing') {
      return '—';
    }

    return `${row.success_count} / ${row.total_tokens} (${row.failure_count} failed)`;
  }

  public loadHttpData(pageOverride?: number, perPageOverride?: number): void {
    const page = pageOverride ?? this.currentPage;
    const perPage = perPageOverride ?? this.pageSize;
    const filters = this.searchForm.value;

    const params = {
      ...buildListParams(page, perPage, this.sort ?? null, {
        status: (filters.status as string)?.trim() || undefined,
        created_after: filters.created_after ? format(filters.created_after as Date, 'yyyy-MM-dd') : undefined,
        created_before: filters.created_before ? format(filters.created_before as Date, 'yyyy-MM-dd') : undefined,
      }),
    } as Record<string, unknown>;

    if ((filters.triggered_by ?? '').trim() !== '') {
      params['filter[triggered_by]'] = (filters.triggered_by as string).trim();
    }

    this.isLoading = true;

    this.sub.add(
      this.pushService.getList(params).subscribe({
        next: (res) => {
          this.dataSource.data = res.data ?? [];
          this.totalRecords = res.meta?.total ?? 0;
          this.isLoading = false;
        },
        error: () => {
          this.messageService.error('Failed to load push notifications.');
          this.isLoading = false;
        },
      })
    );
  }
}
