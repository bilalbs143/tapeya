import { Component, OnInit, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { finalize } from 'rxjs';

import { getUserIdByURL, getUserTypeByURL } from '../../shared/functions/core.function';
import { UsersService } from '../../shared/services/users.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styles: ``,
  standalone: false,
})
export class SettingsComponent implements OnInit {
  private usersService = inject(UsersService);

  public form: FormGroup;
  public user: any;
  public userType: string;
  public isLoading: boolean = false;

  public ngOnInit(): void {
    this.userType = getUserTypeByURL();
    this.getUser();
  }

  private getUser(): void {
    this.isLoading = true;
    this.usersService
      .show(getUserIdByURL())
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.user = response.data || '';
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }
}
