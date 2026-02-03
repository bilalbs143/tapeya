import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AdminProfileModule } from '../../settings/admin-profile/admin-profile.module';
import { SharedModule } from '../../shared/shared.module';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { UpdateAgentProfileComponent } from './update-agent-profile/update-agent-profile.component';
import { UpdateUserPasswordComponent } from './update-user-password/update-user-password.component';
import { UpdateUserProfileComponent } from './update-user-profile/update-user-profile.component';
import { UpdateUserReferralBonusComponent } from './update-user-referral-bonus/update-user-referral-bonus.component';
import { UserBonusSettingComponent } from './user-bonus-setting/user-bonus-setting.component';

@NgModule({
  declarations: [
    SettingsComponent,
    UpdateUserPasswordComponent,
    UpdateUserProfileComponent,
    UpdateAgentProfileComponent,
    UserBonusSettingComponent,
    UpdateUserReferralBonusComponent,
  ],
  imports: [CommonModule, SharedModule, SettingsRoutingModule, ReactiveFormsModule, TranslateModule, AdminProfileModule],
})
export class SettingsModule {}
