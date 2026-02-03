import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { BrandingComponent } from 'src/app/layouts/full/vertical/sidebar/branding.component';
import { MaterialModule } from 'src/app/material.module';

@Component({
    selector: 'app-sidebar',
    imports: [BrandingComponent, TablerIconsModule, MaterialModule],
    templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  constructor() { }
  @Input() showToggle = true;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  ngOnInit(): void { }
}