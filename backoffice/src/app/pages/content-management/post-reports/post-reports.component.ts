import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
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
import { buildListParams } from 'src/app/shared/functions/list-params.function';

import { ManagePostReportDialogComponent } from './manage-post-report-dialog/manage-post-report-dialog.component';

const DEFAULT_FILTERS = {
  status: '',
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
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    TablerIconsModule,
    TableImageComponent,
    CommonSharedModule,
  ],
  templateUrl: './post-reports.component.html',
})
export class PostReportsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly postReportService = inject(PostReportService);
  private readonly messageService = inject(MessageService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  @ViewChild(MatSort) public sort!: MatSort;

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

  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;

  constructor() {
    this.searchForm = this.fb.group({ status: [DEFAULT_FILTERS.status] });
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
    this.searchForm.reset({ ...DEFAULT_FILTERS });
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

  public loadHttpData(pageOverride?: number, perPageOverride?: number): void {
    const page = pageOverride ?? this.currentPage;
    const perPage = perPageOverride ?? this.pageSize;
    const filters = this.searchForm.value;
    const params = {
      ...buildListParams(page, perPage, this.sort ?? null, {
        status: filters.status ?? '',
      }),
    } as Record<string, unknown>;

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
      { widthSize: 'lg', disableClose: true }
    );
  }
}
