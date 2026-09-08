import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { format } from 'date-fns';
import { Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import { LiveStreamService, type YoutubeStreamKey } from 'src/app/services/live-stream.service';
import { MessageService } from 'src/app/services/message.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import {
  bindListSearchFormLiveReload,
  SortReloadBinder,
  onListPaginationChange,
  resetListSearchForm,
} from 'src/app/shared/functions/list-page-paging.function';
import { buildListParams } from 'src/app/shared/functions/list-params.function';

import { CreateYoutubeStreamKeyDialogComponent } from './create-youtube-stream-key-dialog/create-youtube-stream-key-dialog.component';
import { EditYoutubeStreamKeyDialogComponent } from './edit-youtube-stream-key-dialog/edit-youtube-stream-key-dialog.component';

const KEY_DIALOG_OPTIONS = { widthSize: 'sm' as const, disableClose: true };

const DEFAULT_FILTERS = {
  search: '',
  is_active: '',
  in_use: '',
} as const;

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
];

const AVAILABILITY_OPTIONS = [
  { value: '', label: 'All' },
  { value: '0', label: 'Available' },
  { value: '1', label: 'In Use' },
];

@Component({
  selector: 'app-youtube-stream-keys-list',
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
    TablerIconsModule,
    CommonSharedModule,
  ],
  templateUrl: './youtube-stream-keys-list.component.html',
})
export class YoutubeStreamKeysListComponent implements OnInit, OnDestroy {
  private readonly streamApi = inject(LiveStreamService);
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
  public readonly displayedColumns = ['title', 'availability', 'in_use_by', 'created_at', 'actions'];
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusOptions = STATUS_OPTIONS;
  public readonly availabilityOptions = AVAILABILITY_OPTIONS;

  public dataSource = new MatTableDataSource<YoutubeStreamKey>([]);
  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;

  constructor() {
    this.searchForm = this.fb.group({
      search: [DEFAULT_FILTERS.search],
      is_active: [DEFAULT_FILTERS.is_active],
      in_use: [DEFAULT_FILTERS.in_use],
    });
    this.pageSize = this.paginatorConfig.pageSize;
  }

  public ngOnInit(): void {
    this.sub.add(bindListSearchFormLiveReload(this));
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
      ...buildListParams(page, perPage, this.sort ?? { active: 'id', direction: 'desc' }, {}),
    } as Record<string, string | number>;

    if ((filters.search ?? '').trim() !== '') {
      params = { ...params, 'filter[search]': (filters.search as string).trim() };
    }
    if (filters.is_active === '0' || filters.is_active === '1') {
      params = { ...params, 'filter[is_active]': filters.is_active };
    }
    if (filters.in_use === '0' || filters.in_use === '1') {
      params = { ...params, 'filter[in_use]': filters.in_use };
    }

    this.isLoading = true;
    this.streamApi.listYoutubeStreamKeysPaged(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.messageService.error('Failed to load YouTube stream keys.');
        this.isLoading = false;
      },
    });
  }

  public openCreateDialog(): void {
    this.messageService.openDialog<CreateYoutubeStreamKeyDialogComponent, boolean>(
      CreateYoutubeStreamKeyDialogComponent,
      {},
      (saved) => saved && this.loadHttpData(),
      KEY_DIALOG_OPTIONS
    );
  }

  public openManageDialog(row: YoutubeStreamKey): void {
    this.messageService.openDialog<EditYoutubeStreamKeyDialogComponent, boolean>(
      EditYoutubeStreamKeyDialogComponent,
      { keyId: row.id },
      (mutated) => mutated && this.loadHttpData(),
      KEY_DIALOG_OPTIONS
    );
  }

  public formatDate(value: string | null | undefined): string {
    if (!value) {
      return this.emptyCell;
    }

    return format(new Date(value), 'dd MMM yyyy, HH:mm');
  }
}
