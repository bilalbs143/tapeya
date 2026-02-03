import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthService } from '../../../shared/auth/auth.service';
import { MessageService } from '../../../shared/services/message.service';
import { phoneNumberValidator } from '../../../shared/validators/common-validators';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  standalone: false,
})
export class UpdateProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  public form: FormGroup;
  public isSubmitting: boolean = false;
  public admin: any;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.admin = this.authService.getLoggedInUser();
    this.createForm();
  }

  private createForm(): void {
    this.form = this.fb.group({
      name: [this.admin.name, [Validators.required]],
      username: [this.admin.username, [Validators.required]],
      phone: [this.admin.phone, [Validators.required, phoneNumberValidator()]],
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.authService
      .updateProfile(this.form.value)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.messageService.snackBar(response.message);
          this.authService.setLoggedInUser(response.data);
        },
        error: (error) => {
          this.messageService.snackBar(error.error.message);
        },
      });
  }
}
