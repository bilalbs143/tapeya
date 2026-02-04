import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';

import { NavService } from '../../../../../services/nav.service';
import { NavItem } from '../../../shared/nav/nav-item.model';

@Component({
  selector: 'app-horizontal-nav-item',
  imports: [TablerIconsModule, CommonModule, MatIconModule],
  templateUrl: './nav-item.component.html',
})
export class AppHorizontalNavItemComponent {
  @Input() public depth = 0;
  @Input() public item!: NavItem;

  public readonly navService = inject(NavService);
  public readonly router = inject(Router);

  public onItemSelected(item: NavItem) {
    if (!item.children?.length && item.route) {
      void this.router.navigate([item.route]);
    }
  }
}
