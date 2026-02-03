import { Component } from '@angular/core';

import { BrandingComponent } from './branding.component';

@Component({
  selector: 'app-sidebar',
  imports: [BrandingComponent],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {}
