import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, Input, ViewEncapsulation, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { TablerIconComponent } from '@luoxiao123/angular-tabler-icons';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MaterialModule } from 'src/app/material.module';

import { AppSettings } from '../../../../app.config';
import { CoreService } from '../../../../services/core.service';
import { AuthService } from '../../../../shared/auth/auth.service';
import { LoggedInUser } from '../../../../shared/types/types';
import { CustomizerButtonComponent } from '../../../shared/customizer-button/customizer-button.component';
import { LanguageComponent } from '../../../shared/language/language.component';
import { MembersRequestComponent } from '../../../shared/members-request/members-request.component';
import { ProfileComponent } from '../../../shared/profile/profile.component';

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    CommonModule,
    NgScrollbarModule,
    TablerIconComponent,
    MaterialModule,
    LanguageComponent,
    ProfileComponent,
    CustomizerButtonComponent,
    MembersRequestComponent,
  ],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent {
  dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private settings = inject(CoreService);
  private options = this.settings.getOptions();

  @Input() public showToggle = true;
  @Input() public toggleChecked = false;
  @Output() public readonly toggleMobileNav = new EventEmitter<void>();
  @Output() public readonly toggleMobileFilterNav = new EventEmitter<void>();
  @Output() public readonly toggleCollapsed = new EventEmitter<void>();
  @Output() public readonly optionsChange = new EventEmitter<AppSettings>();
  public loggedInUser: LoggedInUser;

  constructor() {
    this.loggedInUser = this.authService.getLoggedInUser();
  }

  private emitOptions(): void {
    this.optionsChange.emit(this.options);
  }
}
