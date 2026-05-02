import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { of, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, startWith, switchMap } from 'rxjs/operators';

import { MessageService } from 'src/app/services/message.service';
import { type TeamRow, TeamsService } from 'src/app/services/teams.service';
import { TournamentTeamsService } from 'src/app/services/tournament-teams.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { addSearchFilter, baseListParams } from 'src/app/shared/functions/list-params.function';

export interface AttachTournamentTeamsDialogData {
  tournamentId: number;
  numberOfGroups: number;
  attachedTeamIds: number[];
}

@Component({
  selector: 'app-attach-tournament-teams-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
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

  /** Primary action disabled until there is at least one team and (if grouped) a valid group. */
  public get attachPrimaryDisabled(): boolean {
    if (this.selected.length === 0) {
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
    this.selected = [...this.selected, team];
    this.searchControl.setValue('', { emitEvent: false });
    this.applyCandidateFilter();
  }

  public teamOptionLabel(t: TeamRow): string {
    return `${t.name} (${t.code})`;
  }

  public save(): void {
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
