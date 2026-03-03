import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import type { EnumOption } from 'src/app/services/enums.service';
import { EnumsService } from 'src/app/services/enums.service';
import { MessageService } from 'src/app/services/message.service';
import type { TournamentRequest } from 'src/app/services/tournament-request.service';
import { TournamentRequestService } from 'src/app/services/tournament-request.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { getStatusClass } from 'src/app/utils/status-class.util';

export interface TournamentRequestDetailDialogData {
  tournamentRequest: TournamentRequest;
}

@Component({
  selector: 'app-tournament-request-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDivider,
    TablerIconsModule,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './tournament-request-detail-dialog.component.html',
})
export class TournamentRequestDetailDialogComponent implements OnInit {
  public readonly data = inject<TournamentRequestDetailDialogData>(MAT_DIALOG_DATA);
  private readonly tournamentRequestService = inject(TournamentRequestService);
  private readonly enumsService = inject(EnumsService);
  private readonly dialogRef = inject<MatDialogRef<TournamentRequestDetailDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  public tournamentRequest: TournamentRequest | null = null;
  public form!: FormGroup;
  public isSubmitting = false;
  public isLoading = true;
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusClass = getStatusClass;
  public statusOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('tournament_request_status');

  public ngOnInit(): void {
    this.form = this.fb.group({
      status: [this.data.tournamentRequest.status, [Validators.required]],
    });
    this.tournamentRequestService.getById(this.data.tournamentRequest.id).subscribe({
      next: (res) => {
        this.tournamentRequest = res.data;
        this.form.patchValue({ status: this.tournamentRequest?.status ?? this.data.tournamentRequest.status });
        this.isLoading = false;
      },
      error: () => {
        this.tournamentRequest = this.data.tournamentRequest;
        this.isLoading = false;
      },
    });
  }

  public onSubmit(): void {
    if (this.form.invalid || !this.tournamentRequest) return;
    this.isSubmitting = true;
    this.tournamentRequestService
      .updateStatus(this.tournamentRequest.id, this.form.value.status)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res) => {
          this.tournamentRequest = res.data;
          this.dialogRef.close(true);
        },
        error: () => {
          this.messageService.error('Failed to update status.');
        },
      });
  }
}
