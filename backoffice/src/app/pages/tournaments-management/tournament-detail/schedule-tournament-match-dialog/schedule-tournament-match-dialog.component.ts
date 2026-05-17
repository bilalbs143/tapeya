import { CommonModule, formatDate } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin, merge } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { EnumsService } from 'src/app/services/enums.service';
import { MessageService } from 'src/app/services/message.service';
import { TournamentMatchesService } from 'src/app/services/tournament-matches.service';
import type { TournamentTeamRow } from 'src/app/services/tournament-teams.service';
import { TournamentTeamsService } from 'src/app/services/tournament-teams.service';
import { TournamentsService } from 'src/app/services/tournaments.service';
import type { Tournament } from 'src/app/services/tournaments.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';

export interface ScheduleTournamentMatchDialogData {
  tournamentId: number;
}

@Component({
  selector: 'app-schedule-tournament-match-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatDatepickerModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './schedule-tournament-match-dialog.component.html',
})
export class ScheduleTournamentMatchDialogComponent implements OnInit {
  public readonly data = inject<ScheduleTournamentMatchDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ScheduleTournamentMatchDialogComponent, boolean>);
  private readonly fb = inject(FormBuilder);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly teamsService = inject(TournamentTeamsService);
  private readonly matchesService = inject(TournamentMatchesService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly groupModeOptions$ = this.enumsService.getOptions('group_mode');

  public teams: TournamentTeamRow[] = [];
  public numberOfGroups = 1;
  public isLoading = true;
  public isSubmitting = false;

  public form = this.fb.nonNullable.group({
    match_group_mode: ['open' as 'open' | 'group_wise'],
    group_index: [null as number | null],
    home_team_id: [0, [Validators.required, Validators.min(1)]],
    away_team_id: [0, [Validators.required, Validators.min(1)]],
    match_date: [null as Date | null, Validators.required],
    match_time: ['14:00', Validators.required],
    venue_name: ['', [Validators.required, Validators.maxLength(255)]],
    players_per_side: [11, [Validators.required, Validators.min(2), Validators.max(20)]],
    overs: [20, [Validators.required, Validators.min(5), Validators.max(50)]],
  });

  constructor() {
    merge(this.form.controls.match_group_mode.valueChanges, this.form.controls.group_index.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.applyGroupModeValidators();
        this.pruneTeamSelections();
      });

    merge(this.form.controls.home_team_id.valueChanges, this.form.controls.away_team_id.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.clearSameFixtureErrors();
        this.pruneTeamSelections();
      });
  }

  private clearSameFixtureErrors(): void {
    for (const name of ['home_team_id', 'away_team_id'] as const) {
      const c = this.form.controls[name];
      if (!c.errors?.['sameFixture']) {
        continue;
      }
      const rest = { ...c.errors };
      delete rest['sameFixture'];
      c.setErrors(Object.keys(rest).length ? rest : null);
    }
  }

  private setSameFixtureErrors(): void {
    for (const name of ['home_team_id', 'away_team_id'] as const) {
      const c = this.form.controls[name];
      c.setErrors({ ...(c.errors ?? {}), sameFixture: true });
    }
  }

  public ngOnInit(): void {
    forkJoin({
      tournament: this.tournamentsService.getById(this.data.tournamentId),
      teams: this.teamsService.listTeams(this.data.tournamentId),
    }).subscribe({
      next: ({ tournament, teams }) => {
        this.applyTournament(tournament.data);
        this.teams = teams.data ?? [];
        this.form.patchValue({
          venue_name: tournament.data.venue_name?.trim() ?? '',
          match_date: new Date(),
          match_group_mode: 'open',
          group_index: null,
        });
        this.applyGroupModeValidators();
        this.pruneTeamSelections();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Could not load tournament or teams.');
      },
    });
  }

  private applyTournament(t: Tournament): void {
    this.numberOfGroups = Math.max(1, t.number_of_groups ?? 1);
  }

  public get showMatchGroupMode(): boolean {
    return this.numberOfGroups > 1;
  }

  public get groupOptions(): number[] {
    return Array.from({ length: this.numberOfGroups }, (_, i) => i + 1);
  }

  /** Teams available for home/away when group-wise stage is selected. */
  public teamsForFixture(): TournamentTeamRow[] {
    if (this.numberOfGroups <= 1) {
      return this.teams;
    }
    if (this.form.controls.match_group_mode.value !== 'group_wise') {
      return this.teams;
    }
    const g = this.form.controls.group_index.value;
    if (g == null) {
      return [];
    }
    return this.teams.filter((t) => Number(t.group_index) === Number(g));
  }

  private applyGroupModeValidators(): void {
    if (this.numberOfGroups <= 1) {
      this.form.controls.group_index.clearValidators();
      this.form.controls.group_index.patchValue(null, { emitEvent: false });
      this.form.controls.group_index.updateValueAndValidity({ emitEvent: false });
      return;
    }
    const gi = this.form.controls.group_index;
    if (this.form.controls.match_group_mode.value === 'group_wise') {
      gi.setValidators([Validators.required, Validators.min(1), Validators.max(this.numberOfGroups)]);
      if (gi.value == null || gi.value < 1) {
        gi.patchValue(1, { emitEvent: false });
      }
    } else {
      gi.clearValidators();
      gi.patchValue(null, { emitEvent: false });
    }
    gi.updateValueAndValidity({ emitEvent: false });
  }

  private pruneTeamSelections(): void {
    const allowed = new Set(this.teamsForFixture().map((t) => t.id));
    const home = this.form.controls.home_team_id.value;
    const away = this.form.controls.away_team_id.value;
    const patch: { home_team_id?: number; away_team_id?: number } = {};
    if (home > 0 && !allowed.has(home)) {
      patch.home_team_id = 0;
    }
    if (away > 0 && !allowed.has(away)) {
      patch.away_team_id = 0;
    }
    if (Object.keys(patch).length > 0) {
      this.form.patchValue(patch, { emitEvent: false });
    }
  }

  public submit(): void {
    this.clearSameFixtureErrors();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    if (v.home_team_id === v.away_team_id && v.home_team_id > 0) {
      this.setSameFixtureErrors();
      this.form.markAllAsTouched();
      return;
    }
    const rawDate = v.match_date;
    let matchDateStr: string;
    if (rawDate instanceof Date) {
      matchDateStr = formatDate(rawDate, 'yyyy-MM-dd', 'en-US');
    } else if (typeof rawDate === 'string' && rawDate) {
      matchDateStr = rawDate;
    } else {
      this.form.controls.match_date.setErrors({ ...(this.form.controls.match_date.errors ?? {}), required: true });
      this.form.markAllAsTouched();
      return;
    }
    const groupIndex =
      this.showMatchGroupMode && v.match_group_mode === 'group_wise' && v.group_index != null ? Number(v.group_index) : null;

    this.isSubmitting = true;
    const payload = {
      home_team_id: v.home_team_id,
      away_team_id: v.away_team_id,
      match_date: matchDateStr,
      match_time: v.match_time,
      venue_name: v.venue_name.trim(),
      players_per_side: v.players_per_side,
      overs: v.overs,
      group_index: groupIndex,
    };
    this.matchesService
      .createMatch(this.data.tournamentId, payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.messageService.success('Match scheduled.');
          this.dialogRef.close(true);
        },
        error: () =>
          this.messageService.error(
            'Could not schedule match. Ensure both teams are in the tournament (and in the chosen group for group-wise fixtures).'
          ),
      });
  }
}
