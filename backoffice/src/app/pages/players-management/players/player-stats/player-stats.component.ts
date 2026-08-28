import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, ActivatedRoute } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { EMPTY, Subject, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { EnumsService } from 'src/app/services/enums.service';
import type { EnumOption } from 'src/app/services/enums.service';
import { MessageService } from 'src/app/services/message.service';
import { PlayersService } from 'src/app/services/players.service';
import type {
  PlayerStatsResponse,
  PlayerBattingStats,
  PlayerBowlingStats,
  PlayerFieldingStats,
} from 'src/app/services/players.service';
import type { User } from 'src/app/services/users.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { EmptyDataMessageComponent } from 'src/app/shared/components/empty-data-message/empty-data-message.component';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';

interface StatRow {
  label: string;
  value: string | number | null;
}

@Component({
  selector: 'app-player-stats',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTabsModule,
    TablerIconsModule,
    EmptyDataMessageComponent,
    CommonSharedModule,
  ],
  templateUrl: './player-stats.component.html',
})
export class PlayerStatsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly playersService = inject(PlayersService);
  private readonly enumsService = inject(EnumsService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();
  private readonly statsTrigger$ = new Subject<{ tournament_type: string; cricket_format: string }>();

  public readonly emptyCell = EMPTY_CELL;

  public player: User | null = null;
  public stats: PlayerStatsResponse | null = null;
  public isLoadingPlayer = true;
  public isLoadingStats = false;
  public activeTab: 'batting' | 'bowling' | 'fielding' = 'batting';

  public tournamentTypeOptions: EnumOption[] = [];
  public cricketFormatOptions: EnumOption[] = [];

  public filterForm: FormGroup = this.fb.group({
    tournament_type: ['all'],
    cricket_format: ['all'],
  });

  public get bucketLabel(): string {
    const type = this.tournamentTypeOptions.find((o) => o.value === this.filterForm.value.tournament_type)?.label ?? 'All';
    const format = this.cricketFormatOptions.find((o) => o.value === this.filterForm.value.cricket_format)?.label ?? 'All';
    return `${type} · ${format}`;
  }

  public ngOnInit(): void {
    this.sub.add(
      this.statsTrigger$
        .pipe(
          switchMap(({ tournament_type, cricket_format }) => {
            if (!this.player) {
              return EMPTY;
            }

            this.isLoadingStats = true;
            this.stats = null;

            return this.playersService.getStats(this.player.id, { tournament_type, cricket_format }).pipe(
              catchError(() => {
                this.isLoadingStats = false;
                this.messageService.error('Failed to load player stats.');
                return EMPTY;
              })
            );
          })
        )
        .subscribe((res) => {
          this.stats = res.data;
          this.isLoadingStats = false;
        })
    );

    this.sub.add(
      this.enumsService.getEnums().subscribe((enums) => {
        this.tournamentTypeOptions = [
          { value: 'all', label: 'All' },
          ...(enums['stats_bucket'] ?? enums['tournament_type'] ?? []),
        ];
        this.cricketFormatOptions = [{ value: 'all', label: 'All' }, ...(enums['cricket_format'] ?? [])];
      })
    );

    this.sub.add(
      this.route.paramMap
        .pipe(
          switchMap((params) => {
            const idRaw = params.get('playerId');
            const id = Number(idRaw);
            if (!id || !Number.isFinite(id)) {
              void this.router.navigate(['../../'], { relativeTo: this.route });
              return EMPTY;
            }

            this.isLoadingPlayer = true;
            return this.playersService.getById(id).pipe(
              catchError(() => {
                this.isLoadingPlayer = false;
                this.messageService.error('Could not load player.');
                void this.router.navigate(['../../'], { relativeTo: this.route });
                return EMPTY;
              })
            );
          })
        )
        .subscribe((res) => {
          this.player = res.data;
          this.isLoadingPlayer = false;
          this.loadStats();
        })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public applyFilters(): void {
    this.loadStats();
  }

  public resetFilters(): void {
    this.filterForm.reset({ tournament_type: 'all', cricket_format: 'all' });
    this.loadStats();
  }

  public setActiveTab(tab: 'batting' | 'bowling' | 'fielding'): void {
    this.activeTab = tab;
  }

  public hasActiveTabStats(): boolean {
    if (!this.stats) {
      return false;
    }

    switch (this.activeTab) {
      case 'batting':
        return this.hasBattingActivity(this.stats.batting);
      case 'bowling':
        return this.hasBowlingActivity(this.stats.bowling);
      case 'fielding':
        return this.hasFieldingActivity(this.stats.fielding);
      default:
        return false;
    }
  }

  private loadStats(): void {
    if (!this.player) {
      return;
    }

    this.statsTrigger$.next(this.filterForm.value as { tournament_type: string; cricket_format: string });
  }

  public battingRows(b: PlayerBattingStats): StatRow[] {
    return [
      { label: 'Matches', value: b.matches },
      { label: 'Innings', value: b.innings },
      { label: 'Not Outs', value: b.not_outs },
      { label: 'Runs', value: b.runs },
      { label: 'Balls Faced', value: b.balls_faced },
      { label: 'Highest Score', value: b.highest_score },
      { label: 'Average', value: b.average != null ? b.average.toFixed(2) : this.emptyCell },
      { label: 'Strike Rate', value: b.strike_rate != null ? b.strike_rate.toFixed(2) : this.emptyCell },
      { label: 'Hundreds', value: b.hundreds },
      { label: 'Fifties', value: b.fifties },
      { label: 'Fours', value: b.fours },
      { label: 'Sixes', value: b.sixes },
      { label: 'Dots', value: b.dots },
    ];
  }

  public bowlingRows(b: PlayerBowlingStats): StatRow[] {
    return [
      { label: 'Matches', value: b.matches },
      { label: 'Innings', value: b.innings },
      { label: 'Overs', value: b.overs },
      { label: 'Maidens', value: b.maidens },
      { label: 'Runs Conceded', value: b.runs_conceded },
      { label: 'Wickets', value: b.wickets },
      { label: 'Best (Innings)', value: b.best_bowling_innings },
      { label: 'Best (Match)', value: b.best_bowling_match },
      { label: 'Average', value: b.average != null ? b.average.toFixed(2) : this.emptyCell },
      { label: 'Economy', value: b.economy != null ? b.economy.toFixed(2) : this.emptyCell },
      { label: 'Strike Rate', value: b.strike_rate != null ? b.strike_rate.toFixed(2) : this.emptyCell },
      { label: 'Five Wickets', value: b.five_wickets },
      { label: 'Ten Wickets', value: b.ten_wickets },
      { label: 'No Balls', value: b.no_balls },
      { label: 'Wides', value: b.wides },
    ];
  }

  public fieldingRows(f: PlayerFieldingStats): StatRow[] {
    return [
      { label: 'Matches', value: f.matches },
      { label: 'Catches', value: f.catches },
      { label: 'Run Outs', value: f.run_outs },
      { label: 'Stumpings', value: f.stumpings },
    ];
  }

  public hasBattingActivity(b: PlayerBattingStats): boolean {
    return b.innings > 0 || b.runs > 0;
  }

  public hasBowlingActivity(b: PlayerBowlingStats): boolean {
    return b.innings > 0 || b.wickets > 0 || b.overs > 0;
  }

  public hasFieldingActivity(f: PlayerFieldingStats): boolean {
    return f.catches > 0 || f.run_outs > 0 || f.stumpings > 0;
  }
}
