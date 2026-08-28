import { CommonModule, formatDate } from '@angular/common';
import { Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';

import { ScheduleTournamentMatchDialogComponent } from '../tournament-detail/schedule-tournament-match-dialog/schedule-tournament-match-dialog.component';

import { EnumsService } from 'src/app/services/enums.service';
import { MessageService } from 'src/app/services/message.service';
import { TournamentMatchesService, type TournamentMatchRow } from 'src/app/services/tournament-matches.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';

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
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatTooltipModule,
    TablerIconsModule,
    CommonSharedModule,
  ],
  templateUrl: './tournament-matches.component.html',
})
export class TournamentMatchesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly matchesApi = inject(TournamentMatchesService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);

  /** Table + paginator render after load; setters wire them when they appear. */
  @ViewChild(MatSort)
  public set matSort(sort: MatSort | undefined) {
    if (sort) {
      this.dataSource.sort = sort;
      this.dataSource.data = [...this.dataSource.data];
    }
  }

  @ViewChild(MatPaginator)
  public set matPaginator(paginator: MatPaginator | undefined) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
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
  /** Full list from API (before client filters). */
  public allMatches: TournamentMatchRow[] = [];
  public dataSource = new MatTableDataSource<TournamentMatchRow>([]);
  public displayedColumns: string[] = ['when', 'teams', 'venue', 'status', 'result', 'actions'];
  public isLoading = false;

  constructor() {
    this.dataSource.sortingDataAccessor = (row, column) => {
      switch (column) {
        case 'when':
          return `${row.match_date ?? ''} ${row.match_time ?? ''}`;
        case 'teams':
          return `${row.home_team?.name ?? ''} ${row.away_team?.name ?? ''}`;
        case 'venue':
          return row.venue_name ?? '';
        case 'status':
          return row.status ?? '';
        case 'result':
          return row.result_summary ?? '';
        case 'actions':
          return '';
        default:
          return '';
      }
    };
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
      this.loadMatches();
    });
  }

  public openScheduleDialog(): void {
    this.messageService.openDialog<ScheduleTournamentMatchDialogComponent, boolean>(
      ScheduleTournamentMatchDialogComponent,
      { tournamentId: this.tournamentId, mode: 'create' },
      (saved) => saved && this.loadMatches(),
      { widthSize: 'md', disableClose: true }
    );
  }

  public openEditDialog(match: TournamentMatchRow): void {
    this.messageService.openDialog<ScheduleTournamentMatchDialogComponent, boolean>(
      ScheduleTournamentMatchDialogComponent,
      { tournamentId: this.tournamentId, mode: 'edit', match },
      (saved) => saved && this.loadMatches(),
      { widthSize: 'md', disableClose: true }
    );
  }

  public loadMatches(): void {
    this.isLoading = true;
    this.matchesApi.listByTournament(this.tournamentId, true).subscribe({
      next: (res) => {
        this.allMatches = res.data ?? [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Could not load matches.');
      },
    });
  }

  public applyFilters(): void {
    const { q, status, from_date: fromDate, live_today: liveToday } = this.searchForm.getRawValue();
    const term = (q ?? '').trim().toLowerCase();
    const statusVal = (status ?? '').trim();
    const fromVal = fromDate instanceof Date ? formatDate(fromDate, 'yyyy-MM-dd', 'en-US') : '';
    const todayStr = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');

    let rows = [...this.allMatches];

    if (liveToday) {
      rows = rows.filter((r) => (r.match_date ?? '').slice(0, 10) === todayStr);
    }

    if (statusVal) {
      rows = rows.filter((r) => r.status === statusVal);
    }

    if (fromVal) {
      rows = rows.filter((r) => (r.match_date ?? '') >= fromVal);
    }

    if (term) {
      rows = rows.filter((r) => {
        const hay = [
          r.match_date,
          r.match_time,
          r.venue_name,
          r.home_team?.name,
          r.away_team?.name,
          r.status_label,
          r.status,
          r.result_summary,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(term);
      });
    }

    this.dataSource.data = rows;
    if (this.dataSource.sort) {
      this.dataSource.data = [...rows];
    }
    this.dataSource.paginator?.firstPage();
  }

  public resetSearchForm(): void {
    this.searchForm.reset({
      q: DEFAULT_FILTERS.q,
      status: DEFAULT_FILTERS.status,
      from_date: DEFAULT_FILTERS.from_date,
      live_today: DEFAULT_FILTERS.live_today,
    });
    this.applyFilters();
  }

  public get hasNoMatches(): boolean {
    return !this.isLoading && this.allMatches.length === 0;
  }

  public get hasFilterEmpty(): boolean {
    return !this.isLoading && this.allMatches.length > 0 && this.dataSource.data.length === 0;
  }

  public readonly pageSizeOptions = this.paginatorConfig.pageSizeOptions;
  public readonly defaultPageSize = this.paginatorConfig.pageSize;
}
