import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { BetsHistoryRoutingModule } from './bets-history-routing.module';
import { BetsHistoryComponent } from './bets-history.component';

@NgModule({
  declarations: [BetsHistoryComponent],
  imports: [CommonModule, SharedModule, BetsHistoryRoutingModule, ReactiveFormsModule, TranslateModule],
})
export class BetsHistoryModule {}
