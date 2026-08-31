import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import { type Highlight, HighlightService } from 'src/app/services/highlight.service';
import { MessageService } from 'src/app/services/message.service';
import type { Tournament } from 'src/app/services/tournaments.service';
import { TournamentsService } from 'src/app/services/tournaments.service';
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

import { ManageHighlightDialogComponent } from './manage-highlight-dialog/manage-highlight-dialog.component';

const DEFAULT_FILTERS = {
  search: '',
  is_active: '',
  tournament_id: '',
  created_after: null as Date | null,
  created_before: null as Date | null,
} as const;

@Component({
  selector: 'app-highlights',
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
    TableImageComponent,
    CommonSharedModule,
  ],
  templateUrl: './highlights.component.html',
})
export class HighlightsComponent implements OnInit, OnDestroy {
  private readonly highlightService = inject(HighlightService);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly messageService = inject(MessageService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  public tournaments: Tournament[] = [];
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
    'title',
    'duration',
    'views_count',
    'likes_count',
    'is_active',
    'created_at',
    'actions',
  ];
  public dataSource = new MatTableDataSource<Highlight>([]);
  public readonly emptyCell = EMPTY_CELL;

  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;
  constructor() {
    this.searchForm = this.fb.group({
      search: [DEFAULT_FILTERS.search],
      is_active: [DEFAULT_FILTERS.is_active],
      tournament_id: [DEFAULT_FILTERS.tournament_id],
      created_after: [DEFAULT_FILTERS.created_after],
      created_before: [DEFAULT_FILTERS.created_before],
    });
    this.pageSize = this.paginatorConfig.pageSize;
  }

  public ngOnInit(): void {
    this.sub.add(bindListSearchFormLiveReload(this));
    this.loadTournaments();
    this.loadHttpData();
  }

  private loadTournaments(): void {
    this.tournamentsService.getList({ all: true, sort: 'tournament_name' }).subscribe({
      next: (res) => {
        this.tournaments = res.data ?? [];
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
        created_after: filters.created_after ? format(filters.created_after, 'yyyy-MM-dd') : undefined,
        created_before: filters.created_before ? format(filters.created_before, 'yyyy-MM-dd') : undefined,
      }),
    } as Record<string, unknown>;
    const isActiveFilter = this.mapYesNo(filters.is_active);
    if (isActiveFilter !== null) requestParams = { ...requestParams, 'filter[is_active]': isActiveFilter };
    if ((filters.tournament_id ?? '') !== '') {
      requestParams = { ...requestParams, 'filter[tournament_id]': filters.tournament_id };
    }

    this.isLoading = true;
    this.highlightService.getList(requestParams).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load highlights.');
      },
    });
  }

  public openCreateDialog(): void {
    this.messageService.openDialog<ManageHighlightDialogComponent, boolean>(
      ManageHighlightDialogComponent,
      { mode: 'create' },
      (result) => result && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }

  public openEditDialog(item: Highlight): void {
    this.messageService.openDialog<ManageHighlightDialogComponent, boolean>(
      ManageHighlightDialogComponent,
      { mode: 'edit', highlight: item },
      (result) => result && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }

  public openDeleteDialog(item: Highlight): void {
    this.sub.add(
      this.messageService
        .prompt('Delete Highlight?', `Are you sure you want to delete "${item.title}"?`, 'Delete', 'Cancel')
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.highlightService.delete(item.id).subscribe({
              next: () => this.loadHttpData(),
              error: () => this.messageService.error('Failed to delete highlight.'),
            });
          }
        })
    );
  }
}
