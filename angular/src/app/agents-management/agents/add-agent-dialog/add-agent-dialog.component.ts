import { HttpParams } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';

import { AgentsManagementService } from '../../../shared/services/agents-management.service';
import { BanksService } from '../../../shared/services/banks.service';
import { MessageService } from '../../../shared/services/message.service';
import { noSpaceAllowed, onlyNumbers, phoneNumberValidator, usernameValidator } from '../../../shared/validators/common-validators';

@Component({
  selector: 'app-prompt-dialog',
  templateUrl: './add-agent-dialog.component.html',
  standalone: false,
})
export class AddAgentDialogComponent implements OnInit {
  private data = inject(MAT_DIALOG_DATA);
  private agentsManagementService = inject(AgentsManagementService);
  private messageService = inject(MessageService);
  private banksService = inject(BanksService);
  private dialogRef = inject<MatDialogRef<AddAgentDialogComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);

  public agents: Array<any> = [];
  public banks: Array<any> = [];
  public form: FormGroup;
  public isSubmitting: boolean = false;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.getAllAgents();
    this.getAllBanks();
    this.createAgentForm();
  }

  private createAgentForm(): void {
    this.form = this.fb.group({
      username: ['', [Validators.required, usernameValidator(), Validators.minLength(4)]],
      name: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(7)]],
      password_confirmation: ['', [Validators.required]],
      phone: ['', [Validators.required, noSpaceAllowed(), phoneNumberValidator()]],
      dob: ['', [Validators.required]],
      bank_id: ['', [Validators.required]],
      account_number: ['', [Validators.required, onlyNumbers(), noSpaceAllowed()]],
      account_holder: ['', [Validators.required]],
      losing_point_ratio: ['', [Validators.required, Validators.min(0), Validators.max(99), onlyNumbers()]],
      rolling_ratio: ['', [Validators.required, Validators.min(0), Validators.max(1)]],
      parent_id: ['', []],
      ref_code: ['', [Validators.required, Validators.minLength(4), noSpaceAllowed()]],
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.agentsManagementService
      .create(this.form.value)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.messageService.snackBar(response.message);
          this.form.reset();
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.messageService.snackBar(error.error.message);
        },
      });
  }

  private getAllAgents(): void {
    const requestParams = new HttpParams().set('all', true);

    this.agentsManagementService.get(requestParams).subscribe({
      next: (response) => {
        this.agents = response.data || [];
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }

  private getAllBanks(): void {
    const requestParams = new HttpParams().set('all', true);

    this.banksService.get(requestParams).subscribe({
      next: (response) => {
        this.banks = response.data || [];
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }
}
