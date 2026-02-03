import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedModule } from '../../shared/shared.module';

import { ManageWhitelistedIpsDialogComponent } from './manage-whitelisted-ips-dialog/manage-whitelisted-ips-dialog.component';
import { WhitelistedIpsManagementRoutingModule } from './whitelisted-ips-management-routing.module';
import { WhitelistedIpsManagementComponent } from './whitelisted-ips-management.component';

@NgModule({
  declarations: [WhitelistedIpsManagementComponent, ManageWhitelistedIpsDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    WhitelistedIpsManagementRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    DialogWrapperModule,
  ],
})
export class WhitelistedIpsManagementModule {}
