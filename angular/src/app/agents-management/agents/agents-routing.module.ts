import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgentsComponent } from './agents.component';

const routes: Routes = [
  {
    path: '',
    component: AgentsComponent,
    data: {
      title: 'AGENTS',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'AGENTS_MANAGEMENT' }, { title: 'AGENTS' }],
      permission: 'agent.view.all|agent.create',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgentsRoutingModule {}
