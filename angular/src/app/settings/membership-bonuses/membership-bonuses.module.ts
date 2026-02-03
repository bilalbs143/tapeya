import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { MembershipBonusesRoutingModule } from './membership-bonuses-routing.module';
import { MembershipBonusesComponent } from './membership-bonuses.component';

@NgModule({
  declarations: [MembershipBonusesComponent],
  imports: [CommonModule, MembershipBonusesRoutingModule, SharedModule, ReactiveFormsModule, TranslateModule],
})
export class MembershipBonusesModule {}
