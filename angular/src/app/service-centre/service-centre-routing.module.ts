import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'announcements-management',
    loadChildren: () => import('./announcements-management/announcements-management.module').then((m) => m.AnnouncementsManagementModule),
  },

  {
    path: 'customer-inquires',
    loadChildren: () => import('./customer-inquires/customer-inquires.module').then((m) => m.CustomerInquiresModule),
  },

  {
    path: 'faqs-management',
    loadChildren: () => import('./faqs-management/faqs-management.module').then((m) => m.FaqsManagementModule),
  },

  {
    path: 'notes-management',
    loadChildren: () => import('./notes-management/notes-management.module').then((m) => m.NotesManagementModule),
  },

  {
    path: 'popups-management',
    loadChildren: () => import('./popups-management/popups-management.module').then((m) => m.PopupsManagementModule),
  },

  {
    path: 'quick-account-inquiries',
    loadChildren: () => import('./quick-account-inquiries/quick-account-inquiries.module').then((m) => m.QuickAccountInquiriesModule),
  },

  {
    path: 'templates-management',
    loadChildren: () => import('./templates-management/templates-management.module').then((m) => m.TemplatesManagementModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServiceCentreRoutingModule {}
