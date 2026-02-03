import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AgentBasicInfoComponent } from '../../shared/components/agent-basic-info/agent-basic-info.component';
import { AgentBasicInfoDetailedComponent } from '../../shared/components/agent-basic-info-detailed/agent-basic-info-detailed.component';
import { MemoFormComponent } from '../../shared/components/memo-form/memo-form.component';
import { UserBasicInfoComponent } from '../../shared/components/user-basic-info/user-basic-info.component';
import { UserBasicInfoDetailedComponent } from '../../shared/components/user-basic-info-detailed/user-basic-info-detailed.component';
import { SharedModule } from '../../shared/shared.module';

import { BasicInfoDetailedRoutingModule } from './basic-info-detailed-routing.module';
import { BasicInfoDetailedComponent } from './basic-info-detailed.component';

@NgModule({
  declarations: [BasicInfoDetailedComponent],
  imports: [
    CommonModule,
    SharedModule,
    BasicInfoDetailedRoutingModule,
    ReactiveFormsModule,
    TranslateModule,
    MemoFormComponent,
    UserBasicInfoDetailedComponent,
    AgentBasicInfoDetailedComponent,
    UserBasicInfoComponent,
    AgentBasicInfoComponent,
  ],
})
export class BasicInfoDetailedModule {}
