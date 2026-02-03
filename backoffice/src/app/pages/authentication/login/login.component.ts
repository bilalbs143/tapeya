import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { BrandingComponent } from '../../../layouts/full/vertical/sidebar/branding.component';
import { MaterialModule } from '../../../material.module';

import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-login',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, BrandingComponent],
  templateUrl: './login.component.html',
})
export class AppLoginComponent {
  private readonly settings = inject(CoreService);
  private readonly router = inject(Router);

  options = this.settings.getOptions();

  form = new FormGroup({
    uname: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    void this.router.navigate(['/dashboards/dashboard1']);
  }
}
