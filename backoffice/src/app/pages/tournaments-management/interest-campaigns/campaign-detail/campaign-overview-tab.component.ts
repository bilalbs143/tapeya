import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Observable, catchError, forkJoin, map, of, Subscription } from 'rxjs';

import { type InterestCampaign, InterestCampaignService } from 'src/app/services/interest-campaign.service';
import { InterestSubmissionService } from 'src/app/services/interest-submission.service';
import { MessageService } from 'src/app/services/message.service';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';

import { CampaignDetailStateService } from './campaign-detail-state.service';

interface SubmissionStats {
  total: number;
  pending: number;
  confirmed: number;
  withdrawn: number;
}

@Component({
  selector: 'app-campaign-overview-tab',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, TablerIconsModule, RouterLink],
  templateUrl: './campaign-overview-tab.component.html',
})
export class CampaignOverviewTabComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly campaignService = inject(InterestCampaignService);
  private readonly submissionService = inject(InterestSubmissionService);
  private readonly messageService = inject(MessageService);
  private readonly state = inject(CampaignDetailStateService);
  private readonly sub = new Subscription();

  public campaign: InterestCampaign | null = null;
  public stats: SubmissionStats = { total: 0, pending: 0, confirmed: 0, withdrawn: 0 };
  public isLoading = true;
  public readonly emptyCell = EMPTY_CELL;

  private campaignId = 0;

  public ngOnInit(): void {
    this.sub.add(
      this.route.parent!.paramMap.subscribe((params) => {
        const id = Number(params.get('campaignId'));
        if (!id) return;
        this.campaignId = id;
        this.loadOverview();
      })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private loadOverview(): void {
    this.isLoading = true;

    // Reuse the campaign already fetched by the shell when available.
    const campaign$ = this.state.campaign ? of({ data: this.state.campaign }) : this.campaignService.getById(this.campaignId);

    forkJoin({
      campaign: campaign$,
      pending: this.countByStatus('pending'),
      confirmed: this.countByStatus('confirmed'),
      withdrawn: this.countByStatus('withdrawn'),
    }).subscribe({
      next: ({ campaign, pending, confirmed, withdrawn }) => {
        this.campaign = campaign.data;
        const sum = pending + confirmed + withdrawn;
        const fromApi = campaign.data.submissions_count;
        this.stats = {
          pending,
          confirmed,
          withdrawn,
          total: typeof fromApi === 'number' ? fromApi : sum,
        };
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Could Not Load Campaign Overview.');
      },
    });
  }

  private countByStatus(status: 'pending' | 'confirmed' | 'withdrawn'): Observable<number> {
    return this.submissionService
      .getList({
        page: 1,
        per_page: 1,
        'filter[campaign_id]': this.campaignId,
        'filter[status]': status,
      })
      .pipe(
        map((res) => res.meta?.total ?? res.data?.length ?? 0),
        catchError(() => of(0))
      );
  }
}
