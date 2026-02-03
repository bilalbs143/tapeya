import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { UrlDisplayComponent } from '../../shared/components/url-display/url-display.component';
import { SharedModule } from '../../shared/shared.module';

import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users.component';

@NgModule({
  imports: [SharedModule, UsersRoutingModule, CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, UrlDisplayComponent],
  exports: [],
  declarations: [UsersComponent],
  providers: [],
})
export class UsersModule {}
