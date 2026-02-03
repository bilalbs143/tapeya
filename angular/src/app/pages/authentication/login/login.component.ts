import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CoreService } from 'src/app/services/core.service';

import { AppSettings } from '../../../app.config';
import { AuthService } from '../../../shared/auth/auth.service';
import { SystemService } from '../../../shared/services/system.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
})
export class AppLoginComponent implements OnInit {
  private settings = inject(CoreService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private systemService = inject(SystemService);
  private activatedRoute = inject(ActivatedRoute);

  public options: AppSettings = this.settings.getOptions();
  public isSubmitting: boolean = false;
  public isLoginFailed: boolean = false;
  public systemInfo: any;
  public isLoading: boolean = true;

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  public ngOnInit(): void {
    this.isLoading = true;
    this.systemService
      .get()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.systemInfo = response.data || null;
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }

  public loginForm = new FormGroup({
    username: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
    rememberMe: new FormControl(false),
  });
  public get form(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  public submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoginFailed = false;

    this.isSubmitting = true;
    this.authService
      .login(this.loginForm.value.username, this.loginForm.value.password, this.loginForm.value.rememberMe)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: () => {
          const next = this.activatedRoute.snapshot.queryParams['next'] || '/';
          this.router.navigateByUrl(next);
        },
        error: (error) => {
          this.isLoginFailed = true;
          console.error('Error:', error);
        },
      });
  }
}
