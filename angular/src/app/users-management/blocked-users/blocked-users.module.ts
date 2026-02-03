import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { BlockedUsersRoutingModule } from './blocked-users-routing.module';
import { BlockedUsersComponent } from './blocked-users.component';

@NgModule({
  imports: [CommonModule, SharedModule, BlockedUsersRoutingModule, ReactiveFormsModule, TranslateModule],
  exports: [],
  declarations: [BlockedUsersComponent],
  providers: [],
})
export class BlockedUsersModule {}
