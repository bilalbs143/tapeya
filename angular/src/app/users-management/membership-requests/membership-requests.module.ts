import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { MembershipRequestsRoutingModule } from './membership-requests-routing.module';
import { MembershipRequestsComponent } from './membership-requests.component';

@NgModule({
  declarations: [MembershipRequestsComponent],
  imports: [CommonModule, SharedModule, MembershipRequestsRoutingModule, FormsModule, ReactiveFormsModule, TranslateModule],
})
export class MembershipRequestsModule {}
