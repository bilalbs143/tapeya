import { DatePipe, NgIf } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { DialogWrapperModule } from '../../shared/components/dialog-wrapper/dialog-wrapper.module';
import { SharedModule } from '../../shared/shared.module';

import { AddAgentDialogComponent } from './add-agent-dialog/add-agent-dialog.component';
import { AgentsRoutingModule } from './agents-routing.module';
import { AgentsComponent } from './agents.component';
import { ManageAgentPermissionsDialogComponent } from './manage-agent-permissions-dialog/manage-agent-permissions-dialog.component';

@NgModule({
  declarations: [AgentsComponent, AddAgentDialogComponent, ManageAgentPermissionsDialogComponent],
  imports: [SharedModule, AgentsRoutingModule, TranslateModule, FormsModule, ReactiveFormsModule, NgIf, DatePipe, DialogWrapperModule],
})
export class AgentsModule {}
