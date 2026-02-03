import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { getUserIdByURL } from '../../../shared/functions/core.function';
import { MessageService } from '../../../shared/services/message.service';
import { UsersService } from '../../../shared/services/users.service';

@Component({
  selector: 'app-update-user-referral-bonus',
  templateUrl: './update-user-referral-bonus.component.html',
  standalone: false,
})
export class UpdateUserReferralBonusComponent implements OnInit, OnChanges {
  private usersService = inject(UsersService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  @Input() public user: any;
  public form: FormGroup;
  public isSubmitting: boolean = false;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
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
      referral_bonus_percentage: [this.user?.referral_bonus_percentage ?? null, [Validators.min(0)]],
      referral_bonus_percentage_memo: [this.user?.referral_bonus_percentage_memo ?? null],
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.usersService
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
