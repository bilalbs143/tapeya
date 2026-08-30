import { CommonModule, formatDate } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin, merge } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import { EnumsService } from 'src/app/services/enums.service';
import { MediaService } from 'src/app/services/media.service';
import { MessageService } from 'src/app/services/message.service';
import { TournamentMatchesService, type TournamentMatchRow } from 'src/app/services/tournament-matches.service';
import type { TournamentTeamRow } from 'src/app/services/tournament-teams.service';
import { TournamentTeamsService } from 'src/app/services/tournament-teams.service';
import { TournamentsService } from 'src/app/services/tournaments.service';
import type { Tournament } from 'src/app/services/tournaments.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { FileUploadComponent, type FileUploadValue } from 'src/app/shared/components/file-upload/file-upload.component';
import { LIVE_STREAM_THUMBNAIL_UPLOAD_HINT } from 'src/app/shared/constants/thumbnail.constants';

export interface ScheduleTournamentMatchDialogData {
  tournamentId: number;
  mode?: 'create' | 'edit';
  match?: TournamentMatchRow;
}

@Component({
  selector: 'app-schedule-tournament-match-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule, FileUploadComponent],
  templateUrl: './schedule-tournament-match-dialog.component.html',
})
export class ScheduleTournamentMatchDialogComponent implements OnInit {
  public readonly data = inject<ScheduleTournamentMatchDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ScheduleTournamentMatchDialogComponent, boolean>);
  private readonly fb = inject(FormBuilder);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly teamsService = inject(TournamentTeamsService);
  private readonly matchesService = inject(TournamentMatchesService);
  private readonly mediaService = inject(MediaService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly originalHasThumbnail = !!this.data.match?.has_custom_thumbnail;

  public readonly groupModeOptions$ = this.enumsService.getOptions('group_mode');

  public teams: TournamentTeamRow[] = [];
  public numberOfGroups = 1;
  public isLoading = true;
  public isSubmitting = false;
  public readonly streamThumbnailHint = LIVE_STREAM_THUMBNAIL_UPLOAD_HINT;

  public get isEditMode(): boolean {
    return this.data.mode === 'edit' && !!this.data.match;
  }

  public get dialogTitle(): string {
    if (!this.isEditMode) {
      return 'Schedule Match';
    }
    const home = this.data.match?.home_team?.name ?? 'Home';
    const away = this.data.match?.away_team?.name ?? 'Away';
    return `Edit Match — ${home} v ${away}`;
  }

  public get submitLabel(): string {
    return this.isEditMode ? 'Save' : 'Schedule';
  }

  public form = this.fb.nonNullable.group({
    match_group_mode: ['open' as 'open' | 'group_wise'],
    group_index: [null as number | null],
    home_team_id: [0, [Validators.required, Validators.min(1)]],
    away_team_id: [0, [Validators.required, Validators.min(1)]],
    match_date: [null as Date | null, Validators.required],
    match_time: ['14:00', Validators.required],
    venue_name: ['', [Validators.required, Validators.maxLength(255)]],
    players_per_side: [11, [Validators.required, Validators.min(2), Validators.max(20)]],
    overs: [20, [Validators.required, Validators.min(1), Validators.max(255)]],
    thumbnail: [null as FileUploadValue | null],
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
        if (this.isEditMode && this.data.match) {
          this.patchFormFromMatch(this.data.match);
        } else {
          this.form.patchValue({
            venue_name: tournament.data.venue_name?.trim() ?? '',
            match_date: new Date(),
            match_group_mode: 'open',
            group_index: null,
          });
        }
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

  private patchFormFromMatch(match: TournamentMatchRow): void {
    const groupIndex = match.group_index != null ? Number(match.group_index) : null;
    const matchDate = match.match_date ? new Date(`${match.match_date}T00:00:00`) : new Date();

    this.form.patchValue({
      match_group_mode: groupIndex != null ? 'group_wise' : 'open',
      group_index: groupIndex,
      home_team_id: match.home_team_id,
      away_team_id: match.away_team_id,
      match_date: matchDate,
      match_time: (match.match_time ?? '').slice(0, 5),
      venue_name: match.venue_name,
      players_per_side: match.players_per_side,
      overs: match.overs,
    });

    if (match.thumbnail_url && match.has_custom_thumbnail) {
      this.form.patchValue(
        { thumbnail: { files: [], existingUrls: [match.thumbnail_url] } as FileUploadValue },
        { emitEvent: false }
      );
    }
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
    if (!(rawDate instanceof Date) && !(typeof rawDate === 'string' && rawDate)) {
      this.form.controls.match_date.setErrors({ ...(this.form.controls.match_date.errors ?? {}), required: true });
      this.form.markAllAsTouched();
      return;
    }
    const groupIndex =
      this.showMatchGroupMode && v.match_group_mode === 'group_wise' && v.group_index != null ? Number(v.group_index) : null;

    const thumbnailVal = this.form.getRawValue().thumbnail;

    this.isSubmitting = true;
    const formData = this.buildFormData(groupIndex);
    const request$ = this.isEditMode
      ? this.matchesService.updateMatch(this.data.match!.id, formData)
      : this.matchesService.createMatch(this.data.tournamentId, formData);

    request$
      .pipe(
        switchMap((res) =>
          this.mediaService.applyField('match', res.data.id, 'thumbnail', thumbnailVal, this.originalHasThumbnail)
        ),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: () => {
          this.messageService.success(this.isEditMode ? 'Match updated.' : 'Match scheduled.');
          this.dialogRef.close(true);
        },
        error: () =>
          this.messageService.error(
            this.isEditMode
              ? 'Could not update match.'
              : 'Could not schedule match. Ensure both teams are in the tournament (and in the chosen group for group-wise fixtures).'
          ),
      });
  }

  private buildFormData(groupIndex: number | null): FormData {
    const v = this.form.getRawValue();
    const rawDate = v.match_date;
    const matchDateStr = rawDate instanceof Date ? formatDate(rawDate, 'yyyy-MM-dd', 'en-US') : String(rawDate ?? '');

    const fd = new FormData();
    fd.append('home_team_id', String(v.home_team_id));
    fd.append('away_team_id', String(v.away_team_id));
    fd.append('match_date', matchDateStr);
    fd.append('match_time', v.match_time);
    fd.append('venue_name', v.venue_name.trim());
    fd.append('players_per_side', String(v.players_per_side));
    fd.append('overs', String(v.overs));
    if (groupIndex != null) {
      fd.append('group_index', String(groupIndex));
    }
    return fd;
  }
}
