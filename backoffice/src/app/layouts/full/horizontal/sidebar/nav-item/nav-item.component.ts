import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';

import { NavService } from '../../../../../services/nav.service';
import { NavItem } from '../../../vertical/sidebar/nav-item/nav-item';

@Component({
  selector: 'app-horizontal-nav-item',
  imports: [TablerIconsModule, CommonModule, MatIconModule],
  templateUrl: './nav-item.component.html',
})
export class AppHorizontalNavItemComponent {
  @Input() depth = 0;
  @Input() item!: NavItem;

  readonly navService = inject(NavService);
  private readonly router = inject(Router);

  onItemSelected(item: NavItem) {
    if (!item.children?.length && item.route) {
      void this.router.navigate([item.route]);
    }
  }
}
