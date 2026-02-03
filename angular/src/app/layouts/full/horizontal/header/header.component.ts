import { Component, Output, EventEmitter, Input, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TablerIconComponent } from '@luoxiao123/angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';

import { AuthService } from '../../../../shared/auth/auth.service';
import { LoggedInUser } from '../../../../shared/types/types';
import { CustomizerButtonComponent } from '../../../shared/customizer-button/customizer-button.component';
import { LanguageComponent } from '../../../shared/language/language.component';
import { MembersRequestComponent } from '../../../shared/members-request/members-request.component';
import { ProfileComponent } from '../../../shared/profile/profile.component';
import { BrandingComponent } from '../../vertical/sidebar/branding.component';

@Component({
  selector: 'app-horizontal-header',
  imports: [
    RouterModule,
    TablerIconComponent,
    MaterialModule,
    BrandingComponent,
    LanguageComponent,
    ProfileComponent,
    CustomizerButtonComponent,
    MembersRequestComponent,
  ],
  templateUrl: './header.component.html',
})
export class AppHorizontalHeaderComponent {
  private authService = inject(AuthService);

  @Input() private showToggle = true;
  @Input() private toggleChecked = false;
  @Output() public readonly toggleMobileNav = new EventEmitter<void>();
  @Output() public readonly toggleMobileFilterNav = new EventEmitter<void>();
  @Output() public readonly toggleCollapsed = new EventEmitter<void>();
  public loggedInUser: LoggedInUser;

  constructor() {
    this.loggedInUser = this.authService.getLoggedInUser();
  }
}
