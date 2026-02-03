import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { getUserIdByURL, titleToSnakeCase } from '../../../shared/functions/core.function';
import { AgentsManagementService } from '../../../shared/services/agents-management.service';
import { MessageService } from '../../../shared/services/message.service';
import { BanksService } from '../../../shared/services/banks.service';
import { noSpaceAllowed, onlyNumbers, phoneNumberValidator } from '../../../shared/validators/common-validators';

@Component({
  selector: 'app-update-agent-profile',
  templateUrl: './update-agent-profile.component.html',
  standalone: false,
})
export class UpdateAgentProfileComponent implements OnInit, OnChanges {
  private agentsManagementService = inject(AgentsManagementService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private banksService = inject(BanksService);

  @Input() public user: any;
  public banks: Array<any> = [];
  public form: FormGroup;
  public isSubmitting: boolean = false;
  public isLoading: boolean = false;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.getAllBanks();
    this.initializeForm();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && changes['user'].currentValue) {
      if (this.user) {
        this.initializeForm();
      }
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: [this.user?.name, [Validators.required]],
      username: [this.user?.username, [Validators.required, noSpaceAllowed(), Validators.minLength(4)]],
      ref_code: [this.user?.referral_info.code, [Validators.required, Validators.minLength(4), noSpaceAllowed()]],
      phone: [this.user?.phone, [Validators.required, noSpaceAllowed(), phoneNumberValidator()]],
      dob: [this.user?.dob, [Validators.required]],
      level: [this.user?.level.toString(), [Validators.required]],
      status: [titleToSnakeCase(this.user?.status_enum), [Validators.required]],
      bank_id: [this.user?.bank_account.bank_id, [Validators.required]],
      account_number: [this.user?.bank_account.account_number, [Validators.required, onlyNumbers(), noSpaceAllowed()]],
      account_holder: [this.user?.bank_account.account_holder, [Validators.required]],
      losing_point_ratio: [this.user?.losing_point_ratio, [Validators.required, Validators.min(0), Validators.max(99), onlyNumbers()]],
      rolling_ratio: [this.user?.rolling_ratio, [Validators.required, Validators.min(0), Validators.max(1)]],
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

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.agentsManagementService
      .update(this.form.value, getUserIdByURL())
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.messageService.snackBar(response.message);
        },
        error: (error) => {
          this.messageService.snackBar(error.error.message);
        },
      });
  }
}
