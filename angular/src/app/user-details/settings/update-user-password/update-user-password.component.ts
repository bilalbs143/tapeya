import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { getUserIdByURL } from '../../../shared/functions/core.function';
import { MessageService } from '../../../shared/services/message.service';
import { UsersService } from '../../../shared/services/users.service';

@Component({
  selector: 'app-update-user-password',
  templateUrl: './update-user-password.component.html',
  standalone: false,
})
export class UpdateUserPasswordComponent implements OnInit {
  private usersService = inject(UsersService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  public form: FormGroup;
  public isSubmitting: boolean = false;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(7)]],
      password_confirmation: ['', [Validators.required]],
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
      .updatePassword(formValues, getUserIdByURL())
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.messageService.snackBar(response.message);
          this.form.reset();
        },
        error: (error) => {
          this.messageService.snackBar(error.error.message);
        },
      });
  }
}
