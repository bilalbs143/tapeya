import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { AdminProfileRoutingModule } from './admin-profile-routing.module';
import { AdminProfileComponent } from './admin-profile.component';
import { UpdatePasswordComponent } from './update-password/update-password.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';

@NgModule({
  declarations: [AdminProfileComponent, UpdatePasswordComponent, UpdateProfileComponent],
  imports: [CommonModule, SharedModule, AdminProfileRoutingModule, TranslateModule, FormsModule, ReactiveFormsModule],
  exports: [],
})
export class AdminProfileModule {}
