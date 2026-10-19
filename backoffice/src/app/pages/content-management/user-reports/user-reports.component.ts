import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import { MessageService } from 'src/app/services/message.service';
import type {
  UserReport,
  UserReportReason,
  UserReportSource,
  UserReportStatus,
} from 'src/app/services/user-report.service';
import { UserReportService } from 'src/app/services/user-report.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import {
  bindListSearchFormLiveReload,
  onListPaginationChange,
  resetListSearchForm,
} from 'src/app/shared/functions/list-page-paging.function';
import { buildListParams } from 'src/app/shared/functions/list-params.function';

import { ManageUserReportDialogComponent } from './manage-user-report-dialog/manage-user-report-dialog.component';

const DEFAULT_FILTERS = {
  status: '',
  source: '',
} as const;

const REPORT_STATUS_OPTIONS: { value: '' | UserReportStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'actioned', label: 'Actioned' },
];

const SOURCE_OPTIONS: { value: '' | UserReportSource; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'report', label: 'Report' },
  { value: 'block', label: 'Block' },
];

const REASON_LABELS: Record<UserReportReason, string> = {
  spam: 'Spam',
  harassment: 'Harassment',
  inappropriate: 'Inappropriate Content',
  violence: 'Violence',
  copyright: 'Copyright',
  other: 'Other',
};

const STATUS_LABELS: Record<UserReportStatus, string> = {
  open: 'Open',
  reviewed: 'Reviewed',
  dismissed: 'Dismissed',
  actioned: 'Actioned',
};

@Component({
  selector: 'app-user-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    TablerIconsModule,
    CommonSharedModule,
  ],
  templateUrl: './user-reports.component.html',
})
export class UserReportsComponent implements OnInit, OnDestroy {
  private readonly userReportService = inject(UserReportService);
  private readonly messageService = inject(MessageService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  public searchForm!: FormGroup;
  public readonly displayedColumns: string[] = [
    'sr',
    'reported_user',
    'reporter',
    'reason',
    'source',
    'status',
    'created_at',
    'actions',
  ];
  public dataSource = new MatTableDataSource<UserReport>([]);
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusOptions = REPORT_STATUS_OPTIONS;
  public readonly sourceOptions = SOURCE_OPTIONS;

  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;

  constructor() {
    this.searchForm = this.fb.group({
      status: [DEFAULT_FILTERS.status],
      source: [DEFAULT_FILTERS.source],
    });
    this.pageSize = this.paginatorConfig.pageSize;
  }

  public ngOnInit(): void {
    this.sub.add(bindListSearchFormLiveReload(this));
    this.loadHttpData();
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
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
      ...buildListParams(page, perPage, null, {
        status: filters.status ?? '',
      }),
    } as Record<string, unknown>;
    if ((filters.source ?? '') !== '') {
      params['filter[source]'] = filters.source;
    }

    this.isLoading = true;
    this.userReportService.getList(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load user reports.');
      },
    });
  }

  public reasonLabel(reason: UserReportReason | null | undefined): string {
    if (!reason) return this.emptyCell;
    return REASON_LABELS[reason] ?? reason;
  }

  public statusLabel(status: UserReportStatus | null | undefined): string {
    if (!status) return this.emptyCell;
    return STATUS_LABELS[status] ?? status;
  }

  public personLabel(person: UserReport['reporter'] | UserReport['reported_user']): string {
    if (!person) return this.emptyCell;
    return person.nickname || person.name || this.emptyCell;
  }

  public openUpdateDialog(item: UserReport): void {
    this.messageService.openDialog<ManageUserReportDialogComponent, boolean>(
      ManageUserReportDialogComponent,
      { report: item },
      (result) => result && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }
}
