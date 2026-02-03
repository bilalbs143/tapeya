import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AgentBasicInfoComponent } from '../../shared/components/agent-basic-info/agent-basic-info.component';
import { AgentBasicInfoDetailedComponent } from '../../shared/components/agent-basic-info-detailed/agent-basic-info-detailed.component';
import { MemoFormComponent } from '../../shared/components/memo-form/memo-form.component';
import { SharedModule } from '../../shared/shared.module';

import { HierarchyRoutingModule } from './hierarchy-routing.module';
import { HierarchyTreeComponent } from './hierarchy-tree/hierarchy-tree.component';
import { HierarchyComponent } from './hierarchy.component';

@NgModule({
  declarations: [HierarchyComponent, HierarchyTreeComponent],
  imports: [
    CommonModule,
    SharedModule,
    HierarchyRoutingModule,
    TranslateModule,
    MemoFormComponent,
    ReactiveFormsModule,
    AgentBasicInfoDetailedComponent,
    AgentBasicInfoComponent,
  ],
})
export class HierarchyModule {}
