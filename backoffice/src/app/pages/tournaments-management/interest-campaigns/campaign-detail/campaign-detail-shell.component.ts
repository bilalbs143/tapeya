import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { CampaignSubmissionsComponent } from '../campaign-submissions/campaign-submissions.component';

import { type InterestCampaign, InterestCampaignService } from 'src/app/services/interest-campaign.service';
import { MessageService } from 'src/app/services/message.service';
import { CommonSharedModule } from 'src/app/shared/common.module';

import { CampaignDetailStateService } from './campaign-detail-state.service';

@Component({
  selector: 'app-campaign-detail-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatTabsModule, CommonSharedModule],
  providers: [CampaignDetailStateService],
  templateUrl: './campaign-detail-shell.component.html',
})
export class CampaignDetailShellComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly campaignService = inject(InterestCampaignService);
  private readonly messageService = inject(MessageService);
  private readonly state = inject(CampaignDetailStateService);
  private readonly sub = new Subscription();

  public campaign: InterestCampaign | null = null;
  public isLoading = true;
  public activeChild: unknown = null;

  public get showSubmissionSearch(): boolean {
    return this.activeChild instanceof CampaignSubmissionsComponent;
  }

  public ngOnInit(): void {
    this.sub.add(
      this.route.paramMap.subscribe((params) => {
        const id = Number(params.get('campaignId'));
        if (!id) {
          void this.router.navigate(['/tournaments-management/interest-campaigns']);
          return;
        }
        this.loadCampaign(id);
      })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public onOutletActivate(component: unknown): void {
    this.activeChild = component;
  }

  public onOutletDeactivate(): void {
    this.activeChild = null;
  }

  public runClearSubmissionSearch(): void {
    if (this.activeChild instanceof CampaignSubmissionsComponent) {
      this.activeChild.resetSearchForm();
    }
  }

  private loadCampaign(id: number): void {
    this.isLoading = true;
    this.campaign = null;
    this.campaignService.getById(id).subscribe({
      next: (res) => {
        this.campaign = res.data;
        this.state.campaign = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to Load Campaign.');
        void this.router.navigate(['/tournaments-management/interest-campaigns']);
      },
    });
  }
}
