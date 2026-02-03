import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { finalize } from 'rxjs';

import { CARD_LOADER } from '../../constants/constants';
import { getLoginIpColorClass, getUserIdByURL } from '../../functions/core.function';
import { DialogData, MessageService } from '../../services/message.service';
import { UsersService } from '../../services/users.service';
import { AmountDisplayComponent } from '../amount-display/amount-display.component';
import { DateFormatComponent } from '../date-format/date-format.component';
import { HiddenItemComponent } from '../hidden-item/hidden-item.component';
import { ManualPaymentsDialogComponent } from '../manual-payments-dialog/manual-payments-dialog.component';
import { MemoFormComponent } from '../memo-form/memo-form.component';

@Component({
  selector: 'app-user-basic-info',
  imports: [
    CommonModule,
    MatCardModule,
    RouterLink,
    TranslateModule,
    NgxSkeletonLoaderModule,
    DateFormatComponent,
    AmountDisplayComponent,
    HiddenItemComponent,
    MemoFormComponent,
    MatButtonModule,
  ],
  templateUrl: './user-basic-info.component.html',
})
export class UserBasicInfoComponent implements OnInit {
  private usersService = inject(UsersService);
  private messageService = inject(MessageService);

  protected readonly cardLoader = CARD_LOADER;
  public user: any;
  public isLoading: boolean = true;

  public ngOnInit(): void {
    this.getUser();
  }

  public openManualPaymentsDialog(): void {
    const data: DialogData = { record: this.user, action: '' };
    this.messageService.openDialog(ManualPaymentsDialogComponent, data, () => this.getUser(), {
      widthSize: 'md',
    });
  }

  public getLoginIpClass(): string {
    if (!this.user) {
      return '';
    }
    return getLoginIpColorClass(this.user.created_at_ip, this.user.last_login?.ip_address);
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
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }
}
