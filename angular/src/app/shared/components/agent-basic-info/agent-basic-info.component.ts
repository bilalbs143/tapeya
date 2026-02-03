import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { combineLatest, finalize } from 'rxjs';

import { CARD_LOADER } from '../../constants/constants';
import { DirectivesModule } from '../../directives/directives.module';
import { getLoginIpColorClass, getUserIdByURL, getUserTypeByURL } from '../../functions/core.function';
import { DialogData, MessageService } from '../../services/message.service';
import { StatsService } from '../../services/stats.service';
import { UsersService } from '../../services/users.service';
import { AmountDisplayComponent } from '../amount-display/amount-display.component';
import { DateFormatComponent } from '../date-format/date-format.component';
import { HiddenItemComponent } from '../hidden-item/hidden-item.component';
import { ManageDomainsDialogComponent } from '../manage-domains-dialog/manage-domains-dialog.component';
import { ManualPaymentsDialogComponent } from '../manual-payments-dialog/manual-payments-dialog.component';
import { MemoFormComponent } from '../memo-form/memo-form.component';
import { UserDetailsLinkComponent } from '../user-details-link/user-details-link.component';

@Component({
  selector: 'app-agent-basic-info',
  imports: [
    CommonModule,
    MatCardModule,
    RouterLink,
    TranslateModule,
    NgxSkeletonLoaderModule,
    DateFormatComponent,
    AmountDisplayComponent,
    MemoFormComponent,
    UserDetailsLinkComponent,
    HiddenItemComponent,
    MatButton,
    DirectivesModule,
  ],
  templateUrl: './agent-basic-info.component.html',
})
export class AgentBasicInfoComponent implements OnInit {
  private messageService = inject(MessageService);
  private statsService = inject(StatsService);
  private usersService = inject(UsersService);

  public user: any;
  public stats: any;
  protected readonly cardLoader = CARD_LOADER;
  public isLoading: boolean = true;

  public ngOnInit(): void {
    if (getUserTypeByURL() === 'agent' && getUserIdByURL()) {
      this.loadHttpData(getUserIdByURL());
    }
  }

  public openManageDomainDialog(): void {
    const data: DialogData = { record: this.user, action: '' };
    this.messageService.openDialog(ManageDomainsDialogComponent, data, () => this.loadHttpData(this.user.id), {
      widthSize: 'sm',
    });
  }

  public openManualPaymentsDialog(): void {
    const data: DialogData = { record: this.user, action: '' };
    this.messageService.openDialog(ManualPaymentsDialogComponent, data, () => this.loadHttpData(this.user.id), {
      widthSize: 'md',
    });
  }

  public getLoginIpClass(): string {
    if (!this.user) {
      return '';
    }
    return getLoginIpColorClass(this.user.created_at_ip, this.user.last_login?.ip_address);
  }

  public loadHttpData(id: number): void {
    this.isLoading = true;

    combineLatest([this.usersService.show(id), this.statsService.userCalculations(id)])
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ([user, calculations]) => {
          this.user = user.data || '';
          this.stats = calculations.data || '';
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }
}
