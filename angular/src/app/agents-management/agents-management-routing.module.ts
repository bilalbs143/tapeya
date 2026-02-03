import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'agents',
    loadChildren: () => import('./agents/agents.module').then((m) => m.AgentsModule),
  },

  {
    path: 'hierarchy',
    loadChildren: () => import('./hierarchy/hierarchy.module').then((m) => m.HierarchyModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgentsManagementRoutingModule {}
