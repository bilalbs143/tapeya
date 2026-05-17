import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { of, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';

import { MessageService } from 'src/app/services/message.service';
import { type SquadUser, type TournamentTeamRow, TournamentTeamsService } from 'src/app/services/tournament-teams.service';
import { UsersService } from 'src/app/services/users.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';

export interface ManageTeamSquadDialogData {
  tournamentId: number;
  team: TournamentTeamRow;
}

@Component({
  selector: 'app-manage-team-squad-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './manage-team-squad-dialog.component.html',
  styleUrl: './manage-team-squad-dialog.component.scss',
})
export class ManageTeamSquadDialogComponent implements OnInit, OnDestroy {
  public readonly data = inject<ManageTeamSquadDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ManageTeamSquadDialogComponent, boolean>);
  private readonly teamsService = inject(TournamentTeamsService);
  private readonly usersService = inject(UsersService);
  private readonly messageService = inject(MessageService);
  private readonly sub = new Subscription();

  public selected: SquadUser[] = [];
  public readonly searchControl = new FormControl('', { nonNullable: true });
  public candidates: SquadUser[] = [];

  public isSubmitting = false;

  public get title(): string {
    return `Team Squad — ${this.data.team.name}`;
  }

  public ngOnInit(): void {
    this.loadSquad();
    this.sub.add(
      this.searchControl.valueChanges
        .pipe(
          debounceTime(250),
          distinctUntilChanged(),
          switchMap((term) =>
            this.usersService
              .adminUserSearch(term ?? '', { app_role: 'player' })
              .pipe(catchError(() => of({ data: [] as SquadUser[] })))
          )
        )
        .subscribe((res) => {
          this.candidates = res.data ?? [];
        })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private loadSquad(): void {
    this.teamsService.getTeamSquad(this.data.tournamentId, this.data.team.id).subscribe({
      next: (res) => {
        this.selected = [...(res.data ?? [])];
      },
      error: () => this.messageService.error('Could not load Team Squad.'),
    });
  }

  public removePlayer(user: SquadUser): void {
    this.selected = this.selected.filter((u) => u.id !== user.id);
  }

  public onCandidateSelected(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value as SquadUser;
    if (!user?.id || this.selected.some((u) => u.id === user.id)) {
      return;
    }
    this.selected = [...this.selected, user];
    this.searchControl.setValue('', { emitEvent: false });
    this.candidates = [];
  }

  /**
   * Form submit: prevents native GET reload (outer form has no [formGroup]), then validates and saves squad.
   */
  public onSubmit(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.selected.length === 0) {
      this.messageService.error('Add at least one player to the Team Squad.');
      return;
    }
    this.isSubmitting = true;
    this.teamsService
      .saveTeamSquad(
        this.data.tournamentId,
        this.data.team.id,
        this.selected.map((u) => u.id)
      )
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.messageService.success('Team Squad updated.');
          this.dialogRef.close(true);
        },
        error: () => this.messageService.error('Could not save Team Squad.'),
      });
  }
}
