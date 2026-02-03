import { NgClass } from '@angular/common';
import { Component, Output, EventEmitter, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { MaterialModule } from 'src/app/material.module';

import { AuthService } from '../../../../shared/auth/auth.service';
import { AGENT_DETAILS_MENU, USER_DETAILS_MENU } from '../../../../shared/constants/constants';
import { getUserIdByURL, getUserTypeByURL } from '../../../../shared/functions/core.function';
import { UsersService } from '../../../../shared/services/users.service';
import { LoggedInUser } from '../../../../shared/types/types';

@Component({
  selector: 'app-horizontal-header',
  imports: [RouterModule, MaterialModule, TranslateModule, NgClass],
  templateUrl: './header.component.html',
})
export class AppHorizontalHeaderComponent {
  router = inject(Router);
  private usersService = inject(UsersService);
  private authService = inject(AuthService);

  @Output() public readonly toggleMobileFilterNav = new EventEmitter<void>();
  @Output() public readonly toggleMobileNav = new EventEmitter<void>();
  protected readonly userDetailsMenu: any;
  public isLoading: boolean = true;
  public user: any;

  public userId: number;
  public loggedInUserType: string;
  public viewUserType: string;
  public loggedInUser: LoggedInUser;

  constructor() {
    this.userId = getUserIdByURL();
    this.viewUserType = getUserTypeByURL();

    this.getUser();
    this.loggedInUser = this.authService.getLoggedInUser();
    this.loggedInUserType = this.loggedInUser.typeEnum;
    this.userDetailsMenu = this.getFilteredMenu();
  }

  private getUser(): void {
    this.isLoading = true;

    this.usersService
      .show(this.userId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.user = response.data || '';
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }

  public getFilteredMenu(): any {
    let menu = USER_DETAILS_MENU;
    if (this.viewUserType === 'agent') {
      menu = AGENT_DETAILS_MENU;
    }

    if (this.loggedInUserType === 'AGENT') {
      menu = menu.filter((item) => item.title !== 'SETTINGS');
    }

    // Handle 'Members' visibility based on context
    switch (this.viewUserType) {
      case 'self':
        // Agents don't see 'Members' when viewing their own details
        if (this.loggedInUserType === 'AGENT') {
          menu = menu.filter((item) => item.title !== 'MEMBERS');
        }
        break;
      case 'user':
        // No one sees 'Members' when viewing a member's details
        menu = menu.filter((item) => item.title !== 'MEMBERS');
        break;
    }

    return menu;
  }
}
