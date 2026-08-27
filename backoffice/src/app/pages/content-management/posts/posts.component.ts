import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
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
import type { PostType, AdminPost, PostStatus, PostVisibility } from 'src/app/services/post.service';
import { PostService } from 'src/app/services/post.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { TableImageComponent } from 'src/app/shared/components/table-image/table-image.component';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { buildListParams } from 'src/app/shared/functions/list-params.function';
import { getStatusClass } from 'src/app/utils/status-class.util';

import { ManagePostDialogComponent } from './manage-post-dialog/manage-post-dialog.component';

const DEFAULT_FILTERS = {
  caption: '',
  type: '',
  status: '',
  visibility: '',
} as const;

const POST_TYPE_OPTIONS: { value: '' | PostType; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'repost', label: 'Repost' },
];

const POST_STATUS_OPTIONS: { value: '' | PostStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'uploading', label: 'Uploading' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready', label: 'Ready' },
  { value: 'failed', label: 'Failed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'removed', label: 'Removed' },
];

const POST_VISIBILITY_OPTIONS: { value: '' | PostVisibility; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'public', label: 'Public' },
  { value: 'followers', label: 'Followers' },
  { value: 'private', label: 'Private' },
];

const STATUS_LABELS: Record<PostStatus, string> = {
  uploading: 'Uploading',
  processing: 'Processing',
  ready: 'Ready',
  failed: 'Failed',
  rejected: 'Rejected',
  removed: 'Removed',
};

const VISIBILITY_LABELS: Record<PostVisibility, string> = {
  public: 'Public',
  followers: 'Followers',
  private: 'Private',
};

const TYPE_LABELS: Record<PostType, string> = {
  text: 'Text',
  image: 'Image',
  video: 'Video',
  repost: 'Repost',
};

@Component({
  selector: 'app-posts',
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
    TablerIconsModule,
    TableImageComponent,
    CommonSharedModule,
  ],
  templateUrl: './posts.component.html',
})
export class PostsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly postService = inject(PostService);
  private readonly messageService = inject(MessageService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  @ViewChild(MatSort) public sort!: MatSort;

  public searchForm!: FormGroup;
  public readonly displayedColumns: string[] = [
    'sr',
    'preview',
    'type',
    'caption',
    'creator',
    'status',
    'visibility',
    'views',
    'likes',
    'reports',
    'created_at',
    'actions',
  ];
  public dataSource = new MatTableDataSource<AdminPost>([]);
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusClass = getStatusClass;
  public readonly typeOptions = POST_TYPE_OPTIONS;
  public readonly statusOptions = POST_STATUS_OPTIONS;
  public readonly visibilityOptions = POST_VISIBILITY_OPTIONS;

  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;

  constructor() {
    this.searchForm = this.fb.group({
      caption: [DEFAULT_FILTERS.caption],
      type: [DEFAULT_FILTERS.type],
      status: [DEFAULT_FILTERS.status],
      visibility: [DEFAULT_FILTERS.visibility],
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
    let params = {
      ...buildListParams(page, perPage, this.sort ?? null, {
        status: filters.status ?? '',
      }),
    } as Record<string, unknown>;

    if ((filters.caption ?? '').trim() !== '') {
      params = { ...params, 'filter[caption]': (filters.caption as string).trim() };
    }
    if ((filters.type ?? '').trim() !== '') {
      params = { ...params, 'filter[type]': (filters.type as string).trim() };
    }
    if ((filters.visibility ?? '').trim() !== '') {
      params = { ...params, 'filter[visibility]': (filters.visibility as string).trim() };
    }

    this.isLoading = true;
    this.postService.getList(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load posts.');
      },
    });
  }

  public statusLabel(status: PostStatus | null | undefined): string {
    if (!status) return this.emptyCell;
    return STATUS_LABELS[status] ?? status;
  }

  public visibilityLabel(visibility: PostVisibility | null | undefined): string {
    if (!visibility) return this.emptyCell;
    return VISIBILITY_LABELS[visibility] ?? visibility;
  }

  public typeLabel(type: PostType | null | undefined): string {
    if (!type) return this.emptyCell;
    return TYPE_LABELS[type] ?? type;
  }

  public previewUrl(post: AdminPost): string | null {
    if (post.playback?.poster_url) return post.playback.poster_url;
    if (post.cover_url) return post.cover_url;
    const firstMedia = post.media?.find((m) => !!m.url);
    return firstMedia?.url ?? null;
  }

  public bodyText(post: AdminPost): string | null {
    return post.body ?? post.caption ?? null;
  }

  public canReprocess(post: AdminPost): boolean {
    return post.type === 'video';
  }

  public creatorLabel(post: AdminPost): string {
    const creator = post.creator;
    if (!creator) return this.emptyCell;
    return creator.nickname || creator.name || this.emptyCell;
  }

  public openManageDialog(item: AdminPost): void {
    this.messageService.openDialog<ManagePostDialogComponent, boolean>(
      ManagePostDialogComponent,
      { post: item },
      (result) => result && this.loadHttpData(),
      { widthSize: 'lg', disableClose: true }
    );
  }

  public openReprocessDialog(item: AdminPost): void {
    if (!this.canReprocess(item)) return;

    this.sub.add(
      this.messageService
        .prompt('Reprocess Video?', `Queue reprocessing for video post #${item.id}?`, 'Reprocess', 'Cancel')
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.postService.reprocess(item.id).subscribe({
              next: () => this.loadHttpData(),
              error: () => this.messageService.error('Failed to queue reprocessing.'),
            });
          }
        })
    );
  }

  public openDeleteDialog(item: AdminPost): void {
    this.sub.add(
      this.messageService
        .prompt('Remove Post?', `Are you sure you want to remove post #${item.id}?`, 'Remove', 'Cancel')
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.postService.delete(item.id).subscribe({
              next: () => this.loadHttpData(),
              error: () => this.messageService.error('Failed to remove post.'),
            });
          }
        })
    );
  }
}
