import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgApexchartsModule } from 'ng-apexcharts';
import { forkJoin, from, of } from 'rxjs';
import { catchError, mergeMap, reduce, switchMap } from 'rxjs/operators';

import { AuthService } from 'src/app/services/auth.service';
import { TournamentMatchesService, type TournamentMatchRow } from 'src/app/services/tournament-matches.service';
import { TournamentsService, type Tournament } from 'src/app/services/tournaments.service';
import { LoaderBlockComponent } from 'src/app/shared/components/loader/loader-block.component';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';
import {
  BROADCASTER_DASHBOARD_MATCH_MIX_TOURNAMENTS_PER_PAGE,
  BROADCASTER_DASHBOARD_PHASE_COUNT_PER_PAGE,
  BROADCASTER_DASHBOARD_SCHEDULE_LIST_PER_PAGE,
} from 'src/app/shared/config/paginator.config';

type WritableTournamentList = ReturnType<typeof signal<Tournament[]>>;
type WritableFlag = ReturnType<typeof signal<boolean>>;
type WritableErr = ReturnType<typeof signal<string | null>>;

type PhaseCounts = { upcoming: number; live: number; completed: number };

type MatchMix = {
  scheduled: number;
  toss_done: number;
  in_progress: number;
  completed: number;
  cancelled: number;
};

@Component({
  selector: 'app-broadcaster-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    TablerIconsModule,
    NgApexchartsModule,
    LoaderComponent,
    LoaderBlockComponent,
  ],
  templateUrl: './broadcaster-dashboard.component.html',
  styleUrl: './broadcaster-dashboard.component.scss',
})
export class BroadcasterDashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly tournamentsApi = inject(TournamentsService);
  private readonly matchesApi = inject(TournamentMatchesService);

  public readonly user = this.auth.currentUser;

  public readonly loadingLive = signal(true);
  public readonly liveTournaments = signal<Tournament[]>([]);
  public readonly liveListError = signal<string | null>(null);

  public readonly loadingUpcoming = signal(true);
  public readonly upcomingTournaments = signal<Tournament[]>([]);
  public readonly upcomingListError = signal<string | null>(null);

  public readonly loadingPhaseCounts = signal(true);
  public readonly phaseCountsError = signal<string | null>(null);
  public readonly phaseCounts = signal<PhaseCounts>({ upcoming: 0, live: 0, completed: 0 });

  public readonly loadingMatchMix = signal(true);
  public readonly matchMixError = signal<string | null>(null);
  public readonly matchMix = signal<MatchMix>(this.emptyMatchMix());
  /** Tournaments included when aggregating match statuses (capped sample). */
  public readonly matchesSampleTournamentCount = signal(0);

  public readonly tournamentsTotal = computed(
    () => this.phaseCounts().upcoming + this.phaseCounts().live + this.phaseCounts().completed
  );

  public readonly matchesTotal = computed(() => {
    const m = this.matchMix();
    return m.scheduled + m.toss_done + m.in_progress + m.completed + m.cancelled;
  });

  public readonly tournamentBarSeries = computed(() => [
    {
      name: 'Tournaments',
      data: [this.phaseCounts().upcoming, this.phaseCounts().live, this.phaseCounts().completed],
    },
  ]);

  public readonly tournamentBarChart = {
    type: 'bar' as const,
    height: 320,
    toolbar: { show: false },
    fontFamily: 'inherit',
    zoom: { enabled: false },
    foreColor: 'var(--mat-sys-on-surface-variant)',
  };

  public readonly tournamentBarPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '52%',
      borderRadius: 6,
      distributed: true,
    },
  };

  public readonly tournamentBarDataLabels = {
    enabled: true,
    formatter: (val: string | number | number[] | undefined): string => {
      const n = Array.isArray(val) ? 0 : Math.round(Number(val ?? 0));
      return String(n);
    },
    offsetY: -4,
    style: {
      fontSize: '12px',
      fontWeight: 600,
      colors: ['var(--mat-sys-on-primary)', 'var(--mat-sys-on-secondary)', 'var(--mat-sys-on-tertiary)'],
    },
  };

  public readonly tournamentBarXaxis = {
    categories: ['Upcoming', 'Live', 'Completed'],
    labels: {
      style: {
        fontSize: '12px',
        colors: 'var(--mat-sys-on-surface-variant)',
      },
    },
  };

  public readonly tournamentBarYaxis = {
    decimalsInFloat: 0,
    labels: {
      style: { colors: 'var(--mat-sys-on-surface-variant)' },
      formatter: (val: number): string => String(Math.round(val)),
    },
  };

  /** M3 palette roles — track theme / dark mode with Material tokens */
  public readonly tournamentBarColors = ['var(--mat-sys-primary)', 'var(--mat-sys-secondary)', 'var(--mat-sys-tertiary)'];

  public readonly tournamentBarLegend = { show: false };

  public readonly matchDonutSeries = computed(() => {
    const m = this.matchMix();
    return [m.scheduled, m.toss_done, m.in_progress, m.completed, m.cancelled];
  });

  public readonly matchDonutLabels = ['Scheduled', 'Toss done', 'In progress', 'Completed', 'Cancelled'];

  public readonly matchDonutChart = {
    type: 'donut' as const,
    height: 320,
    fontFamily: 'inherit',
    toolbar: { show: false },
    foreColor: 'var(--mat-sys-on-surface-variant)',
  };

  public readonly matchDonutColors = [
    'var(--mat-sys-primary)',
    'var(--mat-sys-tertiary)',
    'var(--color-warning)',
    'var(--color-success)',
    'var(--mat-sys-error)',
  ];

  public readonly matchDonutLegend = {
    position: 'bottom' as const,
    fontSize: '12px',
    labels: { colors: 'var(--mat-sys-on-surface-variant)' },
  };

  public readonly matchDonutDataLabels = {
    enabled: true,
    formatter: (val: string | number | number[] | undefined): string => {
      const n = Array.isArray(val) ? 0 : Number(val ?? 0);
      return n > 0 ? String(n) : '';
    },
  };

  public readonly matchDonutPlotOptions = {
    pie: {
      donut: {
        size: '62%',
        labels: {
          show: true,
          name: { color: 'var(--mat-sys-on-surface-variant)' },
          value: { color: 'var(--mat-sys-on-surface)' },
          total: {
            show: true,
            label: 'Matches',
            color: 'var(--mat-sys-on-surface-variant)',
            formatter: (w: { globals: { seriesTotals: number[] } }): string =>
              String(w.globals.seriesTotals.reduce((a, b) => a + b, 0)),
          },
        },
      },
    },
  };

  public ngOnInit(): void {
    this.loadPhaseCounts();
    this.loadMatchMix();
    this.fetchScheduleWindow('live', this.liveTournaments, this.loadingLive, this.liveListError, '-start_date');
    this.fetchScheduleWindow('upcoming', this.upcomingTournaments, this.loadingUpcoming, this.upcomingListError, 'start_date');
  }

  public hasAnyMatchData(): boolean {
    return this.matchesTotal() > 0;
  }

  public hasAnyTournamentPhaseData(): boolean {
    return this.tournamentsTotal() > 0;
  }

  private loadPhaseCounts(): void {
    const params = (window: string, sort: string) =>
      this.tournamentsApi.getList({
        page: 1,
        per_page: BROADCASTER_DASHBOARD_PHASE_COUNT_PER_PAGE,
        sort,
        'filter[schedule_window]': window,
      });

    forkJoin({
      upcoming: params('upcoming', 'start_date'),
      live: params('live', '-start_date'),
      completed: params('completed', '-updated_at'),
    }).subscribe({
      next: (res) => {
        this.phaseCounts.set({
          upcoming: res.upcoming.meta?.total ?? 0,
          live: res.live.meta?.total ?? 0,
          completed: res.completed.meta?.total ?? 0,
        });
        this.phaseCountsError.set(null);
        this.loadingPhaseCounts.set(false);
      },
      error: () => {
        this.phaseCountsError.set('Could not load tournament summary.');
        this.loadingPhaseCounts.set(false);
      },
    });
  }

  private loadMatchMix(): void {
    const list = (window: string, sort: string) =>
      this.tournamentsApi.getList({
        page: 1,
        per_page: BROADCASTER_DASHBOARD_MATCH_MIX_TOURNAMENTS_PER_PAGE,
        sort,
        'filter[schedule_window]': window,
      });

    forkJoin({
      upcoming: list('upcoming', 'start_date'),
      live: list('live', '-start_date'),
      completed: list('completed', '-updated_at'),
    })
      .pipe(
        switchMap((lists) => {
          const ids = this.uniqueTournamentIds([
            ...(lists.upcoming.data ?? []),
            ...(lists.live.data ?? []),
            ...(lists.completed.data ?? []),
          ]).slice(0, 28);
          this.matchesSampleTournamentCount.set(ids.length);
          if (ids.length === 0) {
            return of(this.emptyMatchMix());
          }
          const empty = this.emptyMatchMix();
          return from(ids).pipe(
            mergeMap(
              (id) => this.matchesApi.listByTournament(id).pipe(catchError(() => of({ data: [] as TournamentMatchRow[] }))),
              4
            ),
            reduce(
              (acc, res) => {
                for (const m of res.data ?? []) {
                  switch (m.status) {
                    case 'scheduled':
                      acc.scheduled++;
                      break;
                    case 'toss_done':
                      acc.toss_done++;
                      break;
                    case 'in_progress':
                      acc.in_progress++;
                      break;
                    case 'completed':
                      acc.completed++;
                      break;
                    case 'cancelled':
                      acc.cancelled++;
                      break;
                    default:
                      break;
                  }
                }
                return acc;
              },
              { ...empty }
            )
          );
        })
      )
      .subscribe({
        next: (mix) => {
          this.matchMix.set(mix);
          this.matchMixError.set(null);
          this.loadingMatchMix.set(false);
        },
        error: () => {
          this.matchMixError.set('Could not load match breakdown.');
          this.loadingMatchMix.set(false);
        },
      });
  }

  private uniqueTournamentIds(rows: Tournament[]): number[] {
    const seen = new Set<number>();
    const out: number[] = [];
    for (const t of rows) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        out.push(t.id);
      }
    }
    return out;
  }

  private emptyMatchMix(): MatchMix {
    return {
      scheduled: 0,
      toss_done: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };
  }

  private fetchScheduleWindow(
    window: 'live' | 'upcoming',
    rows: WritableTournamentList,
    loading: WritableFlag,
    err: WritableErr,
    sort: string
  ): void {
    this.tournamentsApi
      .getList({
        page: 1,
        per_page: BROADCASTER_DASHBOARD_SCHEDULE_LIST_PER_PAGE,
        sort,
        'filter[schedule_window]': window,
      })
      .subscribe({
        next: (res) => {
          rows.set(res.data ?? []);
          err.set(null);
          loading.set(false);
        },
        error: () => {
          err.set('Could not load tournaments.');
          loading.set(false);
        },
      });
  }
}
