import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuthService } from '../../shared/auth/auth.service';
import { MessageService } from '../../shared/services/message.service';
import { passwordValidator } from '../../shared/validators/common-validators';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  standalone: false,
})
export class AdminProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  public form: FormGroup;
  public isLoading: boolean = true;

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

    this.authService
      .updatePassword(this.form.value)
      .pipe(
        tap(() => (this.isLoading = true)),
        finalize(() => (this.isLoading = false))
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
