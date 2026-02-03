import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';

import { MaterialModule } from 'src/app/material.module';

import { BrandingComponent } from './branding.component';

@Component({
  selector: 'app-sidebar',
  imports: [BrandingComponent, TablerIconsModule, MaterialModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  @Input() showToggle = true;
  @Output() readonly toggleMobileNav = new EventEmitter<void>();
  @Output() readonly toggleCollapsed = new EventEmitter<void>();
}
