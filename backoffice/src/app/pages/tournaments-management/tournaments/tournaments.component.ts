import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import { EnumsService } from 'src/app/services/enums.service';
import { MessageService } from 'src/app/services/message.service';
import { TournamentsService, type Tournament } from 'src/app/services/tournaments.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { cityCountryLine } from 'src/app/shared/functions/display.helper';
import {
  SortReloadBinder,
  bindListSearchFormLiveReload,
  onListPaginationChange,
  resetListSearchForm,
} from 'src/app/shared/functions/list-page-paging.function';
import { buildListParams } from 'src/app/shared/functions/list-params.function';

import { ManageTournamentDialogComponent } from './manage-tournament-dialog/manage-tournament-dialog.component';

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  schedule_window: '',
  tournament_type: '',
} as const;

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    TablerIconsModule,
    MatTooltipModule,
    CommonSharedModule,
    RouterLink,
  ],
  templateUrl: './tournaments.component.html',
})
export class TournamentsComponent implements OnInit, OnDestroy {
  private readonly tournamentsService = inject(TournamentsService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
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

  public statusOptions$ = this.enumsService.getOptions('status');
  public tournamentScheduleWindowOptions$ = this.enumsService.getOptions('tournament_schedule_window');
  public tournamentTypeOptions$ = this.enumsService.getOptions('tournament_type');
  public searchForm: FormGroup;
  public readonly displayedColumns: string[] = [
    'sr',
    'tournament_name',
    'tournament_type',
    'venue_name',
    'prize',
    'location',
    'start_date',
    'end_date',
    'schedule_phase',
    'status',
    'created_at',
    'actions',
  ];
  public dataSource = new MatTableDataSource<Tournament>([]);
  public readonly emptyCell = EMPTY_CELL;

  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;

  constructor() {
    this.initialiseSearchForm();
    this.pageSize = this.paginatorConfig.pageSize;
  }

  private initialiseSearchForm(): void {
    this.searchForm = this.fb.group({
      search: [DEFAULT_FILTERS.search],
      status: [DEFAULT_FILTERS.status],
      schedule_window: [DEFAULT_FILTERS.schedule_window],
      tournament_type: [DEFAULT_FILTERS.tournament_type],
    });
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
    const baseParams = buildListParams(page, perPage, this.sort ?? null, {
      status: filters.status ?? '',
      schedule_window: filters.schedule_window ?? '',
      search: (filters.search ?? '').trim(),
    });
    const requestParams: Record<string, unknown> = { ...baseParams };
    if (filters.tournament_type) requestParams['filter[tournament_type]'] = filters.tournament_type;

    this.isLoading = true;
    this.tournamentsService.getList(requestParams).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load tournaments.');
      },
    });
  }

  public openCreateDialog(): void {
    this.messageService.openDialog<ManageTournamentDialogComponent, boolean>(
      ManageTournamentDialogComponent,
      { mode: 'create' },
      (result) => result && this.loadHttpData(),
      {
        widthSize: 'md',
        disableClose: true,
      }
    );
  }

  public openEditDialog(item: Tournament): void {
    this.messageService.openDialog<ManageTournamentDialogComponent, boolean>(
      ManageTournamentDialogComponent,
      { mode: 'edit', tournament: item },
      (result) => result && this.loadHttpData(),
      {
        widthSize: 'md',
        disableClose: true,
      }
    );
  }

  public openDeleteDialog(item: Tournament): void {
    this.sub.add(
      this.messageService
        .prompt(
          'Delete Tournament?',
          `Delete "${item.tournament_name}"? Its matches, interest campaigns, and submissions will be deleted too. This cannot be undone.`,
          'Delete',
          'Cancel'
        )
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.tournamentsService.delete(item.id).subscribe({
              next: () => this.loadHttpData(),
              error: () => this.messageService.error('Failed to delete tournament.'),
            });
          }
        })
    );
  }

  public cityCountryLine(item: Tournament): string {
    return cityCountryLine(item.city, item.country);
  }
}
