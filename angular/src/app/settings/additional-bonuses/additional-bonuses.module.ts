import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { AdditionalBonusesRoutingModule } from './additional-bonuses-routing.module';
import { AdditionalBonusesComponent } from './additional-bonuses.component';

@NgModule({
  declarations: [AdditionalBonusesComponent],
  imports: [CommonModule, SharedModule, AdditionalBonusesRoutingModule, TranslateModule, FormsModule, ReactiveFormsModule],
  exports: [],
})
export class AdditionalBonusesModule {}
