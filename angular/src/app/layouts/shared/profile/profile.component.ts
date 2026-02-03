import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { AuthService } from '../../../shared/auth/auth.service';
import { LoggedInUser } from '../../../shared/types/types';

@Component({
  selector: 'app-profile',
  imports: [MatButtonModule, MatMenuModule, NgScrollbarModule, TranslateModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  private authService = inject(AuthService);

  public loggedInUser: LoggedInUser;

  constructor() {
    this.loggedInUser = this.authService.getLoggedInUser();
  }

  public logout(): void {
    this.authService.logout(true);
  }
}
