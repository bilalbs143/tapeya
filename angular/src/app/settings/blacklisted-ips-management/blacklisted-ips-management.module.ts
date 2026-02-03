import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedModule } from '../../shared/shared.module';

import { BlacklistedIpsManagementRoutingModule } from './blacklisted-ips-management-routing.module';
import { BlacklistedIpsManagementComponent } from './blacklisted-ips-management.component';
import { ManageBlacklistedIpsDialogComponent } from './manage-blacklisted-ips-dialog/manage-blacklisted-ips-dialog.component';

@NgModule({
  declarations: [BlacklistedIpsManagementComponent, ManageBlacklistedIpsDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    BlacklistedIpsManagementRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    DialogWrapperModule,
  ],
})
export class BlacklistedIpsManagementModule {}
