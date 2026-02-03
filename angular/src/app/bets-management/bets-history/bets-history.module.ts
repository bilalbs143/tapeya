import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedModule } from '../../shared/shared.module';

import { BetsHistoryRoutingModule } from './bets-history-routing.module';
import { BetsHistoryComponent } from './bets-history.component';
import { ViewGameResultComponent } from './view-game-result-dialog/view-game-result.component';

@NgModule({
  declarations: [BetsHistoryComponent, ViewGameResultComponent],
  imports: [CommonModule, SharedModule, BetsHistoryRoutingModule, FormsModule, ReactiveFormsModule, TranslateModule, DialogWrapperModule],
})
export class BetsHistoryModule {}
