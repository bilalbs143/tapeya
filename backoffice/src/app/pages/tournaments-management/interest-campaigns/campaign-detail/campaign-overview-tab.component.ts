import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Observable, catchError, forkJoin, map, of, Subscription } from 'rxjs';

import { EnumsService } from 'src/app/services/enums.service';
import { type InterestCampaign, InterestCampaignService } from 'src/app/services/interest-campaign.service';
import { InterestSubmissionService } from 'src/app/services/interest-submission.service';
import { MessageService } from 'src/app/services/message.service';
import { LoaderBlockComponent } from 'src/app/shared/components/loader/loader-block.component';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { DEFAULT_INTEREST_FORM_FIELDS } from 'src/app/shared/constants/interest-form-field.constants';

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
  imports: [CommonModule, MatCardModule, TablerIconsModule, RouterLink, LoaderBlockComponent],
  templateUrl: './campaign-overview-tab.component.html',
})
export class CampaignOverviewTabComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly campaignService = inject(InterestCampaignService);
  private readonly submissionService = inject(InterestSubmissionService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly state = inject(CampaignDetailStateService);
  private readonly sub = new Subscription();

  public campaign: InterestCampaign | null = null;
  public stats: SubmissionStats = { total: 0, pending: 0, confirmed: 0, withdrawn: 0 };
  public formFieldLabels: string[] = [];
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
      formFieldOptions: this.enumsService.getOptions('tournament_interest_form_field'),
    }).subscribe({
      next: ({ campaign, pending, confirmed, withdrawn, formFieldOptions }) => {
        this.campaign = campaign.data;
        const keys = campaign.data.form_fields?.length ? campaign.data.form_fields : DEFAULT_INTEREST_FORM_FIELDS;
        const byValue = new Map(formFieldOptions.map((opt) => [String(opt.value), opt.label]));
        this.formFieldLabels = keys.map((key) => byValue.get(key) ?? key);
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
