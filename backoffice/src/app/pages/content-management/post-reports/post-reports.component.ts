import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import { MessageService } from 'src/app/services/message.service';
import type { PostReport, PostReportReason, PostReportStatus } from 'src/app/services/post-report.service';
import { PostReportService } from 'src/app/services/post-report.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { TableImageComponent } from 'src/app/shared/components/table-image/table-image.component';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import {
  SortReloadBinder,
  onListPaginationChange,
  resetListSearchForm,
} from 'src/app/shared/functions/list-page-paging.function';
import { buildListParams } from 'src/app/shared/functions/list-params.function';

import { ManagePostReportDialogComponent } from './manage-post-report-dialog/manage-post-report-dialog.component';

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  reason: '',
} as const;

const REPORT_STATUS_OPTIONS: { value: '' | PostReportStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'actioned', label: 'Actioned' },
];

const REASON_LABELS: Record<PostReportReason, string> = {
  spam: 'Spam',
  harassment: 'Harassment',
  inappropriate: 'Inappropriate Content',
  violence: 'Violence',
  copyright: 'Copyright',
  other: 'Other',
};

const REASON_OPTIONS: { value: '' | PostReportReason; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'violence', label: 'Violence' },
  { value: 'copyright', label: 'Copyright' },
  { value: 'other', label: 'Other' },
];

const STATUS_LABELS: Record<PostReportStatus, string> = {
  open: 'Open',
  reviewed: 'Reviewed',
  dismissed: 'Dismissed',
  actioned: 'Actioned',
};

@Component({
  selector: 'app-post-reports',
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
    MatDialogModule,
    TablerIconsModule,
    TableImageComponent,
    CommonSharedModule,
  ],
  templateUrl: './post-reports.component.html',
})
export class PostReportsComponent implements OnInit, OnDestroy {
  private readonly postReportService = inject(PostReportService);
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

  public searchForm!: FormGroup;
  public readonly displayedColumns: string[] = [
    'sr',
    'preview',
    'caption',
    'reason',
    'reporter',
    'status',
    'created_at',
    'actions',
  ];
  public dataSource = new MatTableDataSource<PostReport>([]);
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusOptions = REPORT_STATUS_OPTIONS;
  public readonly reasonOptions = REASON_OPTIONS;

  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;
  constructor() {
    this.searchForm = this.fb.group({
      search: [DEFAULT_FILTERS.search],
      status: [DEFAULT_FILTERS.status],
      reason: [DEFAULT_FILTERS.reason],
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
    let params = {
      ...buildListParams(page, perPage, this.sort ?? null, {
        status: filters.status ?? '',
        search: (filters.search ?? '').trim(),
      }),
    } as Record<string, unknown>;
    if ((filters.reason ?? '') !== '') params = { ...params, 'filter[reason]': filters.reason };

    this.isLoading = true;
    this.postReportService.getList(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load post reports.');
      },
    });
  }

  public reasonLabel(reason: PostReportReason | null | undefined): string {
    if (!reason) return this.emptyCell;
    return REASON_LABELS[reason] ?? reason;
  }

  public statusLabel(status: PostReportStatus | null | undefined): string {
    if (!status) return this.emptyCell;
    return STATUS_LABELS[status] ?? status;
  }

  public reporterLabel(report: PostReport): string {
    const reporter = report.reporter;
    if (!reporter) return this.emptyCell;
    return reporter.nickname || reporter.name || this.emptyCell;
  }

  public previewUrl(report: PostReport): string | null {
    return report.post?.cover_url || null;
  }

  public openUpdateDialog(item: PostReport): void {
    this.messageService.openDialog<ManagePostReportDialogComponent, boolean>(
      ManagePostReportDialogComponent,
      { report: item },
      (result) => result && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }
}
