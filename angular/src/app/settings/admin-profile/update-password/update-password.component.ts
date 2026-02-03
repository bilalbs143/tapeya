import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthService } from '../../../shared/auth/auth.service';
import { MessageService } from '../../../shared/services/message.service';
import { passwordValidator } from '../../../shared/validators/common-validators';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  standalone: false,
})
export class UpdatePasswordComponent implements OnInit {
  private authService = inject(AuthService);
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
      current_password: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), passwordValidator()]],
      password_confirmation: ['', [Validators.required]],
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.authService
      .updatePassword(this.form.value)
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
