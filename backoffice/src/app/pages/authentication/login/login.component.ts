import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { BrandingComponent } from '../../../layouts/full/vertical/sidebar/branding.component';
import { MaterialModule } from '../../../material.module';

import { AuthService } from 'src/app/services/auth.service';
import { CoreService } from 'src/app/services/core.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-login',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, BrandingComponent],
  templateUrl: './login.component.html',
})
export class AppLoginComponent {
  private readonly settings = inject(CoreService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly messages = inject(MessageService);

  public options = this.settings.getOptions();

  public form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  public loading = false;

  public get f() {
    return this.form.controls;
  }

  public submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { email, password } = this.form.getRawValue();

    this.auth
      .login({
        email: email ?? '',
        password: password ?? '',
      })
      .subscribe({
        next: () => {
          this.loading = false;
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/starter';
          void this.router.navigateByUrl(returnUrl);
        },
        error: (error: unknown) => {
          this.loading = false;
          this.messages.httpError(error, 'Invalid credentials. Please try again.');
        },
      });
  }
}
