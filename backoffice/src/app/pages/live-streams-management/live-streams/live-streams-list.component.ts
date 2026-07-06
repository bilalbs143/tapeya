import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
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
import {
  liveStreamStatusLabel,
  matchControllerLink,
} from 'src/app/pages/tournaments-management/match-controller/live-stream.utils';
import { LiveStreamService, type LiveStreamListItem, type LiveStreamStatus } from 'src/app/services/live-stream.service';
import { MessageService } from 'src/app/services/message.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { TableWrapperComponent } from 'src/app/shared/components/table-wrapper/table-wrapper.component';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { buildListParams } from 'src/app/shared/functions/list-params.function';
import { getStatusClass } from 'src/app/utils/status-class.util';

import {
  LiveStreamCreateDialogComponent,
  type LiveStreamCreateDialogResult,
} from './live-stream-create-dialog/live-stream-create-dialog.component';
import { LiveStreamManageDialogComponent } from './live-stream-manage-dialog/live-stream-manage-dialog.component';

const DEFAULT_FILTERS = {
  status: '',
  search: '',
} as const;

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'idle', label: 'Idle' },
  { value: 'starting', label: 'Starting' },
  { value: 'live', label: 'Live' },
  { value: 'ended', label: 'Ended' },
  { value: 'error', label: 'Error' },
];

const PROVIDER_LABELS: Record<string, string> = {
  external: 'External URL',
  youtube: 'YouTube RTMP',
};

const LIVE_STREAM_DIALOG_OPTIONS = { widthSize: 'md' as const, disableClose: true };

@Component({
  selector: 'app-live-streams-list',
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
    TablerIconsModule,
    RouterLink,
    TableWrapperComponent,
    PaginatorComponent,
  ],
  templateUrl: './live-streams-list.component.html',
})
export class LiveStreamsListComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly streamApi = inject(LiveStreamService);
  private readonly messageService = inject(MessageService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  @ViewChild(MatSort) public sort!: MatSort;

  public searchForm!: FormGroup;
  public dataSource = new MatTableDataSource<LiveStreamListItem>([]);
  public readonly displayedColumns = [
    'sr',
    'title',
    'description',
    'streaming_url',
    'status',
    'provider',
    'match',
    'started_at',
    'actions',
  ];
  public readonly statusOptions = STATUS_OPTIONS;
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusClass = getStatusClass;
  public readonly matchControllerLink = matchControllerLink;

  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;

  constructor() {
    this.searchForm = this.fb.group({
      status: [DEFAULT_FILTERS.status],
      search: [DEFAULT_FILTERS.search],
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

  public openCreateDialog(): void {
    this.messageService.openDialog<LiveStreamCreateDialogComponent, LiveStreamCreateDialogResult>(
      LiveStreamCreateDialogComponent,
      {},
      (result) => {
        if (!result?.saved) {
          return;
        }

        this.loadHttpData();

        if (result.streamId) {
          this.openManageDialog({
            id: result.streamId,
            title: null,
            description: null,
            streaming_url: null,
            status: 'idle',
            provider: result.provider ?? 'youtube',
            match_id: null,
            started_at: null,
          });
        }
      },
      LIVE_STREAM_DIALOG_OPTIONS
    );
  }

  public openManageDialog(row: LiveStreamListItem): void {
    this.messageService.openDialog<LiveStreamManageDialogComponent, boolean>(
      LiveStreamManageDialogComponent,
      { stream: row },
      (mutated) => mutated && this.loadHttpData(),
      LIVE_STREAM_DIALOG_OPTIONS
    );
  }

  public formatDate(value: string | null | undefined): string {
    if (!value) {
      return this.emptyCell;
    }

    return format(new Date(value), 'dd MMM yyyy, HH:mm');
  }

  public statusLabel(status: LiveStreamStatus | null | undefined): string {
    return liveStreamStatusLabel(status);
  }

  public providerLabel(provider: string | null | undefined): string {
    if (!provider) {
      return this.emptyCell;
    }

    return PROVIDER_LABELS[provider] ?? provider;
  }

  public loadHttpData(pageOverride?: number, perPageOverride?: number): void {
    const page = pageOverride ?? this.currentPage;
    const perPage = perPageOverride ?? this.pageSize;
    const filters = this.searchForm.value;

    const params = {
      ...buildListParams(page, perPage, this.sort ?? null, {
        status: (filters.status as string)?.trim() || undefined,
        search: (filters.search as string)?.trim() || undefined,
      }),
    } as Record<string, string | number>;

    this.isLoading = true;

    this.sub.add(
      this.streamApi.listStreams(params).subscribe({
        next: (res) => {
          this.dataSource.data = res.data ?? [];
          this.totalRecords = res.meta?.total ?? 0;
          this.isLoading = false;
        },
        error: () => {
          this.messageService.error('Failed to load live streams.');
          this.isLoading = false;
        },
      })
    );
  }
}
