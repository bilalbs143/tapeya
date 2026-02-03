import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HierarchyComponent } from './hierarchy.component';

const routes: Routes = [
  {
    path: '',
    component: HierarchyComponent,
    data: {
      title: 'HIERARCHY',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'AGENTS_MANAGEMENT' }, { title: 'HIERARCHY' }],
      permission: 'agent.view.hierarchy',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HierarchyRoutingModule {}
