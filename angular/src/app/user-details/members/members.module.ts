import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { UrlDisplayComponent } from '../../shared/components/url-display/url-display.component';
import { SharedModule } from '../../shared/shared.module';

import { MembersRoutingModule } from './members-routing.module';
import { MembersComponent } from './members.component';

@NgModule({
  declarations: [MembersComponent],
  imports: [CommonModule, SharedModule, MembersRoutingModule, ReactiveFormsModule, TranslateModule, UrlDisplayComponent],
})
export class MembersModule {}
