import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NotesManagementComponent } from './notes-management.component';

const routes: Routes = [
  {
    path: '',
    component: NotesManagementComponent,
    data: {
      title: 'NOTES_MANAGEMENT',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'SERVICE_CENTRE' }, { title: 'NOTES_MANAGEMENT' }],
      permission: 'note.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotesManagementRoutingModule {}
