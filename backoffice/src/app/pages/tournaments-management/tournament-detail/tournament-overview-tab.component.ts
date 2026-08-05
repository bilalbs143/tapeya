import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgApexchartsModule } from 'ng-apexcharts';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, startWith, switchMap, take } from 'rxjs/operators';

import { MessageService } from 'src/app/services/message.service';
import { TournamentMatchesService, type TournamentMatchRow } from 'src/app/services/tournament-matches.service';
import { TournamentTeamsService } from 'src/app/services/tournament-teams.service';
import { TournamentsService, type Tournament } from 'src/app/services/tournaments.service';
import { UsersService, type UserSearchRow } from 'src/app/services/users.service';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';

@Component({
  selector: 'app-tournament-overview-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    TablerIconsModule,
    RouterLink,
    NgApexchartsModule,
  ],
  templateUrl: './tournament-overview-tab.component.html',
})
export class TournamentOverviewTabComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly teamsService = inject(TournamentTeamsService);
  private readonly matchesService = inject(TournamentMatchesService);
  private readonly usersService = inject(UsersService);
  private readonly messageService = inject(MessageService);
  private readonly sub = new Subscription();

  public tournament: Tournament | null = null;
  public teamCount = 0;
  public matchCount = 0;
  public isLoading = true;

  /** Matches loaded for overview (used for date chart). */
  public matches: TournamentMatchRow[] = [];

  /** Stacked column chart: one bar per match date, stacks by status. */
  public matchDateChart: {
    series: { name: string; data: number[] }[];
    colors: string[];
  } = { series: [], colors: [] };

  public matchDateBarChart = {
    type: 'bar' as const,
    height: 420,
    width: '100%' as const,
    fontFamily: 'inherit',
    stacked: true,
    toolbar: { show: false },
    zoom: { enabled: false },
  };

  public matchDateBarPlotOptions = {
    bar: { horizontal: false, columnWidth: '88%', borderRadius: 2 },
  };

  public matchDateBarXaxis: { categories: string[]; labels: { rotate: number } } = {
    categories: [],
    labels: { rotate: -40 },
  };

  public matchDateBarYaxis = {
    decimalsInFloat: 0,
    labels: {
      formatter: (val: number): string => String(Math.round(val)),
    },
  };

  public broadcaster: UserSearchRow | null = null;
  public candidates: UserSearchRow[] = [];
  public readonly searchControl = new FormControl('', { nonNullable: true });

  public organizerCandidates: UserSearchRow[] = [];
  public readonly organizerSearchControl = new FormControl('', { nonNullable: true });

  /** Shared chip-input options (Broadcaster + Organizer pickers). */
  public readonly roleChipSeparatorKeys = [ENTER, COMMA] as const;
  public readonly roleChipInputAddOnBlur = false;

  public readonly emptyCell = EMPTY_CELL;

  private tournamentId = 0;

  public ngOnInit(): void {
    this.sub.add(
      this.route.parent!.paramMap.subscribe((params) => {
        const id = params.get('tournamentId');
        if (!id) {
          return;
        }
        this.tournamentId = Number(id);
        this.loadOverview();
        this.loadBroadcaster();
      })
    );
    this.sub.add(
      this.searchControl.valueChanges
        .pipe(
          debounceTime(250),
          distinctUntilChanged(),
          switchMap((term) => {
            if (!this.tournamentId) {
              return of({ data: [] as UserSearchRow[] });
            }
            return this.usersService.adminUserSearch(term ?? '').pipe(catchError(() => of({ data: [] as UserSearchRow[] })));
          })
        )
        .subscribe((res) => {
          const attachedId = this.broadcaster?.id;
          this.candidates = (res.data ?? []).filter((u) => attachedId == null || u.id !== attachedId);
        })
    );
    this.sub.add(
      this.organizerSearchControl.valueChanges
        .pipe(
          startWith(''),
          debounceTime(250),
          distinctUntilChanged(),
          switchMap((term) => {
            if (!this.tournamentId) {
              return of({ data: [] as UserSearchRow[] });
            }
            return this.usersService.adminUserSearch(term ?? '').pipe(catchError(() => of({ data: [] as UserSearchRow[] })));
          })
        )
        .subscribe((res) => {
          this.organizerCandidates = res.data ?? [];
        })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private loadOverview(): void {
    this.isLoading = true;
    forkJoin({
      tournament: this.tournamentsService.getById(this.tournamentId),
      teams: this.teamsService.listTeams(this.tournamentId).pipe(catchError(() => of({ data: [] }))),
      matches: this.matchesService.listByTournament(this.tournamentId, true).pipe(catchError(() => of({ data: [] }))),
    }).subscribe({
      next: ({ tournament, teams, matches }) => {
        this.tournament = tournament.data;
        this.teamCount = teams.data?.length ?? 0;
        this.matches = matches.data ?? [];
        this.matchCount = this.matches.length;
        this.buildMatchesByDateChart(this.matches);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Could not load tournament overview.');
      },
    });
  }

  private loadBroadcaster(): void {
    this.tournamentsService
      .getBroadcaster(this.tournamentId)
      .pipe(
        take(1),
        catchError(() => of({ data: null as UserSearchRow | null }))
      )
      .subscribe((res) => {
        this.broadcaster = res.data ?? null;
      });
  }

  /** Label shown on a user chip (broadcaster / organizer pickers). */
  public userChipLabel(u: UserSearchRow): string {
    const nick = u.nickname?.trim();
    if (nick) {
      return nick;
    }
    return u.name?.trim() || `#${u.id}`;
  }

  /** Autocomplete line for a search row (name — email / phone / nickname / id). */
  public userOptionLabel(c: UserSearchRow): string {
    const tail = c.email || c.phone || c.nickname || `#${c.id}`;
    return `${c.name} — ${tail}`;
  }

  public onBroadcasterChipInputTokenEnd(event: MatChipInputEvent): void {
    event.chipInput?.clear();
  }

  public onOrganizerChipInputTokenEnd(event: MatChipInputEvent): void {
    event.chipInput?.clear();
  }

  public onBroadcasterSelected(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value as UserSearchRow;
    if (!user?.id) {
      return;
    }
    this.tournamentsService
      .setBroadcaster(this.tournamentId, user.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.searchControl.setValue('', { emitEvent: false });
          this.candidates = [];
          this.loadBroadcaster();
        },
        error: () => this.messageService.error('Could not update the tournament broadcaster.'),
      });
  }

  public hasMatchChartData(): boolean {
    return this.matches.length > 0;
  }

  /**
   * Builds a stacked column chart: each match date on the X axis, stacks show status mix for that day.
   * Uses 100% stack so busy days and quiet days are comparable; tooltip still shows counts.
   */
  private buildMatchesByDateChart(rows: TournamentMatchRow[]): void {
    type DayBucket = { incoming: number; live: number; completed: number; cancelled: number };
    const emptyBucket = (): DayBucket => ({ incoming: 0, live: 0, completed: 0, cancelled: 0 });
    const byDate = new Map<string, DayBucket>();

    for (const m of rows) {
      const raw = (m.match_date ?? '').toString().trim();
      const key = raw.length >= 10 ? raw.slice(0, 10) : raw || '__none__';
      if (!byDate.has(key)) {
        byDate.set(key, emptyBucket());
      }
      const b = byDate.get(key)!;
      switch (m.status) {
        case 'completed':
          b.completed++;
          break;
        case 'in_progress':
        case 'toss_done':
          b.live++;
          break;
        case 'cancelled':
          b.cancelled++;
          break;
        case 'scheduled':
          b.incoming++;
          break;
        default:
          b.incoming++;
          break;
      }
    }

    const sortKeys = (a: string, b: string): number => {
      if (a === '__none__') {
        return 1;
      }
      if (b === '__none__') {
        return -1;
      }
      return a.localeCompare(b);
    };
    const keys = Array.from(byDate.keys()).sort(sortKeys);
    const categories = keys.map((k) => (k === '__none__' ? 'No date' : k));

    const incoming = keys.map((k) => byDate.get(k)!.incoming);
    const live = keys.map((k) => byDate.get(k)!.live);
    const completed = keys.map((k) => byDate.get(k)!.completed);
    const cancelled = keys.map((k) => byDate.get(k)!.cancelled);

    this.matchDateChart = {
      series: [
        { name: 'Incoming', data: incoming },
        { name: 'Live', data: live },
        { name: 'Completed', data: completed },
        { name: 'Cancelled', data: cancelled },
      ],
      colors: ['var(--mat-sys-outline)', 'var(--mat-sys-secondary)', 'var(--mat-sys-primary)', 'var(--mat-sys-error)'],
    };
    this.matchDateBarXaxis = { categories, labels: { rotate: categories.length > 8 ? -50 : -35 } };
  }

  public removeBroadcaster(): void {
    if (!this.broadcaster?.id) {
      return;
    }
    this.tournamentsService
      .removeBroadcaster(this.tournamentId)
      .pipe(take(1))
      .subscribe({
        next: () => this.loadBroadcaster(),
        error: () => this.messageService.error('Could not remove the tournament broadcaster.'),
      });
  }

  public onOrganizerSelected(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value as UserSearchRow;
    if (!user?.id) {
      return;
    }
    this.tournamentsService
      .update(this.tournamentId, { organizer_id: user.id })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.organizerSearchControl.setValue('', { emitEvent: false });
          this.organizerCandidates = [];
          this.loadOverview();
        },
        error: () => this.messageService.error('Could not update the tournament organizer.'),
      });
  }
}
