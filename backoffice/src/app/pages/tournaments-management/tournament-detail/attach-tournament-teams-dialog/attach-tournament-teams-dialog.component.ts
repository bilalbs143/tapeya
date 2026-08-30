import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, startWith, switchMap } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import { MessageService } from 'src/app/services/message.service';
import { type TeamRow, TeamsService } from 'src/app/services/teams.service';
import { TournamentTeamsService } from 'src/app/services/tournament-teams.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { addSearchFilter, baseListParams } from 'src/app/shared/functions/list-params.function';

export interface AttachTournamentTeamsDialogData {
  tournamentId: number;
  numberOfGroups: number;
  numberOfTeams: number | null;
  attachedTeamIds: number[];
}

@Component({
  selector: 'app-attach-tournament-teams-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule],
  templateUrl: './attach-tournament-teams-dialog.component.html',
  styleUrl: './attach-tournament-teams-dialog.component.scss',
})
export class AttachTournamentTeamsDialogComponent implements OnInit, OnDestroy {
  public readonly data = inject<AttachTournamentTeamsDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AttachTournamentTeamsDialogComponent, boolean>);
  private readonly fb = inject(FormBuilder);
  private readonly teamsService = inject(TeamsService);
  private readonly tournamentTeamsService = inject(TournamentTeamsService);
  private readonly messageService = inject(MessageService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly sub = new Subscription();

  public readonly searchControl = this.fb.nonNullable.control('');
  public readonly groupForm = this.fb.group({
    group_index: [null as number | null],
  });

  public candidates: TeamRow[] = [];
  public selected: TeamRow[] = [];
  private lastFetched: TeamRow[] = [];

  /** Set when user clicks Attach so we can show selection / group validation inline. */
  public attachAttempted = false;

  public isSubmitting = false;

  /** Slots left before the current chip selection (attached count only). */
  public get slotsAvailable(): number | null {
    if (this.data.numberOfTeams === null) {
      return null;
    }
    return this.data.numberOfTeams - this.data.attachedTeamIds.length;
  }

  /** Slots left after the current chip selection. */
  public get remainingSlots(): number | null {
    const available = this.slotsAvailable;
    if (available === null) {
      return null;
    }
    return available - this.selected.length;
  }

  /** Tournament already has no room for more teams. */
  public get isAtCapacity(): boolean {
    const available = this.slotsAvailable;
    return available !== null && available <= 0;
  }

  /** Current selection exceeds the tournament team limit. */
  public get exceedsCapacity(): boolean {
    const remaining = this.remainingSlots;
    return remaining !== null && remaining < 0;
  }

  /** Primary action disabled until there is at least one team and (if grouped) a valid group. */
  public get attachPrimaryDisabled(): boolean {
    if (this.selected.length === 0) {
      return true;
    }
    if (this.exceedsCapacity) {
      return true;
    }
    if (this.data.numberOfGroups > 1 && this.groupForm.invalid) {
      return true;
    }
    return false;
  }

  public get title(): string {
    return 'Attach Teams to Tournament';
  }

  public get groupOptions(): number[] {
    const n = this.data.numberOfGroups;
    if (n <= 1) {
      return [];
    }
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  public ngOnInit(): void {
    if (this.data.numberOfGroups > 1) {
      this.groupForm.controls.group_index.setValidators([Validators.required, Validators.min(1)]);
      this.groupForm.controls.group_index.updateValueAndValidity();
    }

    this.sub.add(
      this.searchControl.valueChanges
        .pipe(
          startWith(this.searchControl.value),
          debounceTime(250),
          distinctUntilChanged(),
          switchMap((term) => {
            const params = addSearchFilter(
              baseListParams(0, this.paginatorConfig.pageSize, { active: 'name', direction: 'asc' }),
              term ?? ''
            );
            return this.teamsService.getList(params).pipe(catchError(() => of({ data: [] as TeamRow[] })));
          })
        )
        .subscribe((res) => {
          this.lastFetched = res.data ?? [];
          this.applyCandidateFilter();
        })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private applyCandidateFilter(): void {
    const attached = new Set(this.data.attachedTeamIds);
    const picked = new Set(this.selected.map((t) => t.id));
    this.candidates = this.lastFetched.filter((t) => !attached.has(t.id) && !picked.has(t.id));
  }

  public removeTeam(team: TeamRow): void {
    this.selected = this.selected.filter((t) => t.id !== team.id);
    this.applyCandidateFilter();
  }

  public onTeamSelected(event: MatAutocompleteSelectedEvent): void {
    const team = event.option.value as TeamRow;
    if (!team?.id || this.selected.some((t) => t.id === team.id)) {
      return;
    }
    if (this.remainingSlots !== null && this.remainingSlots <= 0) {
      this.searchControl.setValue('', { emitEvent: false });
      return;
    }
    this.selected = [...this.selected, team];
    this.searchControl.setValue('', { emitEvent: false });
    this.applyCandidateFilter();
  }

  public teamOptionLabel(t: TeamRow): string {
    return `${t.name} (${t.code})`;
  }

  /**
   * Form submit: prevents native GET reload (outer form has no [formGroup] when numberOfGroups is 1),
   * then validates and attaches teams.
   */
  public onSubmit(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.attachAttempted = true;
    if (this.selected.length === 0) {
      return;
    }
    if (this.data.numberOfGroups > 1) {
      this.groupForm.markAllAsTouched();
      if (!this.groupForm.valid) {
        return;
      }
    }

    const group_index = this.data.numberOfGroups > 1 ? (this.groupForm.value.group_index as number) : null;
    this.isSubmitting = true;
    this.tournamentTeamsService
      .attachTeams(this.data.tournamentId, {
        team_ids: this.selected.map((t) => t.id),
        group_index: group_index ?? undefined,
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.messageService.success('Teams attached.');
          this.dialogRef.close(true);
        },
        error: () => this.messageService.error('Could not attach teams.'),
      });
  }
}
