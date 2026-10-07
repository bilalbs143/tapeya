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
import { type DramaEpisode, DramaEpisodeService } from 'src/app/services/drama-episode.service';
import { type DramaSerial, DramaSerialService } from 'src/app/services/drama-serial.service';
import { MessageService } from 'src/app/services/message.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { TableImageComponent } from 'src/app/shared/components/table-image/table-image.component';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import {
  bindListSearchFormLiveReload,
  SortReloadBinder,
  onListPaginationChange,
  resetListSearchForm,
} from 'src/app/shared/functions/list-page-paging.function';
import { buildListParams } from 'src/app/shared/functions/list-params.function';

import { ManageDramaEpisodeDialogComponent } from './manage-drama-episode-dialog/manage-drama-episode-dialog.component';

const DEFAULT_FILTERS = {
  search: '',
  is_active: '',
  drama_serial_id: '',
} as const;

@Component({
  selector: 'app-drama-episodes',
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
  templateUrl: './drama-episodes.component.html',
})
export class DramaEpisodesComponent implements OnInit, OnDestroy {
  private readonly episodeService = inject(DramaEpisodeService);
  private readonly serialService = inject(DramaSerialService);
  private readonly messageService = inject(MessageService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  public serials: DramaSerial[] = [];
  public readonly string = String;
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
    'thumbnail',
    'serial',
    'episode_number',
    'title',
    'views_count',
    'likes_count',
    'is_active',
    'actions',
  ];
  public dataSource = new MatTableDataSource<DramaEpisode>([]);
  public readonly emptyCell = EMPTY_CELL;
  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;

  constructor() {
    this.searchForm = this.fb.group({
      search: [DEFAULT_FILTERS.search],
      is_active: [DEFAULT_FILTERS.is_active],
      drama_serial_id: [DEFAULT_FILTERS.drama_serial_id],
    });
    this.pageSize = this.paginatorConfig.pageSize;
  }

  public ngOnInit(): void {
    this.sub.add(bindListSearchFormLiveReload(this));
    this.loadSerials();
    this.loadHttpData();
  }

  private loadSerials(): void {
    this.serialService.getList({ all: true, sort: 'title' }).subscribe({
      next: (res) => {
        this.serials = res.data ?? [];
      },
    });
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

  private mapYesNo(value: string | undefined): string | null {
    if (value === 'yes') return '1';
    if (value === 'no') return '0';
    return null;
  }

  public loadHttpData(pageOverride?: number, perPageOverride?: number): void {
    const page = pageOverride ?? this.currentPage;
    const perPage = perPageOverride ?? this.pageSize;
    const filters = this.searchForm.value;
    let requestParams = {
      ...buildListParams(page, perPage, this.sort ?? null, {
        search: filters.search ?? '',
      }),
    } as Record<string, unknown>;
    const isActiveFilter = this.mapYesNo(filters.is_active);
    if (isActiveFilter !== null) requestParams = { ...requestParams, 'filter[is_active]': isActiveFilter };
    if ((filters.drama_serial_id ?? '') !== '') {
      requestParams = { ...requestParams, 'filter[drama_serial_id]': filters.drama_serial_id };
    }

    this.isLoading = true;
    this.episodeService.getList(requestParams).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load episodes.');
      },
    });
  }

  public openCreateDialog(): void {
    this.messageService.openDialog<ManageDramaEpisodeDialogComponent, boolean>(
      ManageDramaEpisodeDialogComponent,
      { mode: 'create', serials: this.serials },
      (result) => result && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }

  public openEditDialog(item: DramaEpisode): void {
    this.messageService.openDialog<ManageDramaEpisodeDialogComponent, boolean>(
      ManageDramaEpisodeDialogComponent,
      { mode: 'edit', episode: item, serials: this.serials },
      (result) => result && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }

  public openDeleteDialog(item: DramaEpisode): void {
    this.sub.add(
      this.messageService
        .prompt('Delete Episode?', `Delete "${item.title}"?`, 'Delete', 'Cancel')
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.episodeService.delete(item.id).subscribe({
              next: () => this.loadHttpData(),
              error: () => this.messageService.error('Failed to delete episode.'),
            });
          }
        })
    );
  }
}
