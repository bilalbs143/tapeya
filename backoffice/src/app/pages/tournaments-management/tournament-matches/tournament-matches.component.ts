import { CommonModule, formatDate } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Subscription } from 'rxjs';

import { ScheduleTournamentMatchDialogComponent } from '../tournament-detail/schedule-tournament-match-dialog/schedule-tournament-match-dialog.component';

import { EnumsService } from 'src/app/services/enums.service';
import { MessageService } from 'src/app/services/message.service';
import { TournamentMatchesService, type TournamentMatchRow } from 'src/app/services/tournament-matches.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { EmptyDataMessageComponent } from 'src/app/shared/components/empty-data-message/empty-data-message.component';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import {
  onListPaginationChange,
  resetListSearchForm,
  SortReloadBinder,
} from 'src/app/shared/functions/list-page-paging.function';

const DEFAULT_FILTERS = {
  q: '',
  status: '',
  from_date: null as Date | null,
  live_today: false,
} as const;

@Component({
  selector: 'app-tournament-matches',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatDividerModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
    TablerIconsModule,
    CommonSharedModule,
    EmptyDataMessageComponent,
  ],
  templateUrl: './tournament-matches.component.html',
})
export class TournamentMatchesComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly matchesApi = inject(TournamentMatchesService);
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

  public readonly matchStatusOptions$ = this.enumsService.getOptions('match_status');
  public searchForm = this.fb.group({
    q: [DEFAULT_FILTERS.q],
    status: [DEFAULT_FILTERS.status],
    from_date: [DEFAULT_FILTERS.from_date],
    live_today: [DEFAULT_FILTERS.live_today],
  });

  public readonly emptyCell = EMPTY_CELL;

  public tournamentId!: number;
  public dataSource = new MatTableDataSource<TournamentMatchRow>([]);
  public displayedColumns: string[] = ['when', 'teams', 'venue', 'status', 'result', 'actions'];

  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;

  constructor() {
    this.pageSize = this.paginatorConfig.pageSize;
  }

  public ngOnInit(): void {
    const paramMap$ = this.route.parent?.paramMap ?? this.route.paramMap;
    paramMap$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('tournamentId');
      if (!id) {
        void this.router.navigate(['/tournaments-management/tournaments']);
        return;
      }
      this.tournamentId = Number(id);
      this.currentPage = 0;
      this.loadHttpData();
    });
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.sortBinder.destroy();
  }

  public openScheduleDialog(): void {
    this.messageService.openDialog<ScheduleTournamentMatchDialogComponent, boolean>(
      ScheduleTournamentMatchDialogComponent,
      { tournamentId: this.tournamentId, mode: 'create' },
      (saved) => saved && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }

  public openEditDialog(match: TournamentMatchRow): void {
    this.messageService.openDialog<ScheduleTournamentMatchDialogComponent, boolean>(
      ScheduleTournamentMatchDialogComponent,
      { tournamentId: this.tournamentId, mode: 'edit', match },
      (saved) => saved && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
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
    const filters = this.searchForm.getRawValue();

    const sortActive = this.sort?.active;
    const sortDirection = this.sort?.direction;
    const sort = sortActive && sortDirection ? `${sortDirection === 'desc' ? '-' : ''}${sortActive}` : 'match_date';

    const fromDate = filters.from_date instanceof Date ? formatDate(filters.from_date, 'yyyy-MM-dd', 'en-US') : undefined;

    this.isLoading = true;
    this.matchesApi
      .getList(this.tournamentId, {
        page: page + 1,
        per_page: perPage,
        sort,
        q: (filters.q ?? '').trim() || undefined,
        status: filters.status || undefined,
        from_date: fromDate,
        live_today: filters.live_today || undefined,
      })
      .subscribe({
        next: (res) => {
          this.dataSource.data = res.data ?? [];
          this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.messageService.error('Could not load matches.');
        },
      });
  }

  public get hasNoMatches(): boolean {
    return !this.isLoading && this.totalRecords === 0 && !this.hasActiveFilters();
  }

  public get hasFilterEmpty(): boolean {
    return !this.isLoading && this.totalRecords === 0 && this.hasActiveFilters();
  }

  private hasActiveFilters(): boolean {
    const filters = this.searchForm.getRawValue();
    return (
      (filters.q ?? '').trim() !== '' ||
      (filters.status ?? '') !== '' ||
      filters.from_date instanceof Date ||
      !!filters.live_today
    );
  }
}
