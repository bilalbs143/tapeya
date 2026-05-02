import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs/operators';

import { MessageService } from 'src/app/services/message.service';
import { TournamentTeamsService } from 'src/app/services/tournament-teams.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';

export interface EditTournamentTeamGroupDialogData {
  tournamentId: number;
  teamId: number;
  teamName: string;
  numberOfGroups: number;
  currentGroup: number | null;
}

@Component({
  selector: 'app-edit-tournament-team-group-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './edit-tournament-team-group-dialog.component.html',
})
export class EditTournamentTeamGroupDialogComponent implements OnInit {
  public readonly data = inject<EditTournamentTeamGroupDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditTournamentTeamGroupDialogComponent, boolean>);
  private readonly fb = inject(FormBuilder);
  private readonly tournamentTeamsService = inject(TournamentTeamsService);
  private readonly messageService = inject(MessageService);

  public readonly form = this.fb.nonNullable.group({
    group_index: [1, [Validators.required, Validators.min(1)]],
  });

  public groupOptions: number[] = [];

  public isSubmitting = false;

  public get title(): string {
    return `Group — ${this.data.teamName}`;
  }

  public ngOnInit(): void {
    const n = this.data.numberOfGroups;
    this.groupOptions = Array.from({ length: n }, (_, i) => i + 1);
    const initial = this.data.currentGroup != null && this.data.currentGroup >= 1 ? this.data.currentGroup : 1;
    this.form.patchValue({ group_index: initial });
    this.form.controls.group_index.setValidators([Validators.required, Validators.min(1), Validators.max(n)]);
    this.form.controls.group_index.updateValueAndValidity();
  }

  public save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.isSubmitting = true;
    this.tournamentTeamsService
      .updateTeamGroup(this.data.tournamentId, this.data.teamId, v.group_index)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.messageService.success('Group updated.');
          this.dialogRef.close(true);
        },
        error: () => this.messageService.error('Could not update group.'),
      });
  }
}
