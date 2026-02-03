import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs';

import { getUserIdByURL } from '../../../shared/functions/core.function';
import { MessageService } from '../../../shared/services/message.service';
import { UsersService } from '../../../shared/services/users.service';

@Component({
  selector: 'app-user-bonus-setting',
  templateUrl: './user-bonus-setting.component.html',
  standalone: false,
})
export class UserBonusSettingComponent implements OnInit, OnChanges {
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
      is_new_signup_first_recharge_bonus_enabled: [this.user?.is_new_signup_first_recharge_bonus_enabled],
      is_first_recharge_bonus_of_day_enabled: [this.user?.is_first_recharge_bonus_of_day_enabled],
      is_bonus_per_recharge_enabled: [this.user?.is_bonus_per_recharge_enabled],
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValues = {
      ...this.form.value,
      change_password: true,
    };

    this.isSubmitting = true;
    this.usersService
      .update(formValues, getUserIdByURL())
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
