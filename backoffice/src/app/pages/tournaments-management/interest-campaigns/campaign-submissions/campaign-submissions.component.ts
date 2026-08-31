import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Observable, Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import type { EnumOption } from 'src/app/services/enums.service';
import { EnumsService } from 'src/app/services/enums.service';
import { type InterestSubmission, InterestSubmissionService } from 'src/app/services/interest-submission.service';
import { MessageService } from 'src/app/services/message.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { birthdateAgeLine, cityCountryLine } from 'src/app/shared/functions/display.helper';
import {
  SortReloadBinder,
  onListPaginationChange,
  resetListSearchForm,
} from 'src/app/shared/functions/list-page-paging.function';
import { buildListParams } from 'src/app/shared/functions/list-params.function';

import { SubmissionDetailDialogComponent } from './submission-detail-dialog/submission-detail-dialog.component';

const DEFAULT_FILTERS = { status: '', search: '' } as const;

@Component({
  selector: 'app-campaign-submissions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatTooltipModule,
    TablerIconsModule,
    CommonSharedModule,
  ],
  templateUrl: './campaign-submissions.component.html',
})
export class CampaignSubmissionsComponent implements OnInit, OnDestroy {
  private readonly submissionService = inject(InterestSubmissionService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly sub = new Subscription();

  private readonly sortBinder = new SortReloadBinder(this);

  @ViewChild(MatSort)
  public set sort(value: MatSort | undefined) {
    this.sortBinder.bind(value);
  }

  public get sort(): MatSort | undefined {
    return this.sortBinder.current;
  }

  public campaignId!: number;
  public searchForm: FormGroup;
  public dataSource = new MatTableDataSource<InterestSubmission>([]);
  public readonly emptyCell = EMPTY_CELL;
  public readonly displayedColumns = [
    'sr',
    'player',
    'nickname',
    'email',
    'phone',
    'location',
    'dob_age',
    'status',
    'created_at',
    'actions',
  ];

  public statusOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('tournament_interest_submission_status');

  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;
  constructor() {
    this.searchForm = this.fb.group({
      status: [DEFAULT_FILTERS.status],
      search: [DEFAULT_FILTERS.search],
    });
    this.pageSize = this.paginatorConfig.pageSize;
  }

  public ngOnInit(): void {
    this.sub.add(
      this.route.parent!.paramMap.subscribe((params) => {
        const id = Number(params.get('campaignId'));
        if (!id) {
          this.messageService.error('Invalid Campaign ID.');
          return;
        }
        this.campaignId = id;
        this.currentPage = 0;
        this.loadHttpData();
      })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.sortBinder.destroy();
  }

  public resetSearchForm(): void {
    resetListSearchForm(this, DEFAULT_FILTERS);
  }

  public onPaginationChange(event: PageEvent): void {
    onListPaginationChange(this, event);
  }

  public loadHttpData(): void {
    const filters = this.searchForm.value;
    let params: Record<string, unknown> = {
      ...buildListParams(this.currentPage, this.pageSize, this.sort ?? null, {
        status: filters.status ?? '',
      }),
      'filter[campaign_id]': this.campaignId,
    };
    const search = (filters.search ?? '').trim();
    if (search !== '') params = { ...params, 'filter[search]': search };

    this.isLoading = true;
    this.submissionService.getList(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to Load Submissions.');
      },
    });
  }

  public openDetailDialog(submission: InterestSubmission): void {
    this.messageService.openDialog<SubmissionDetailDialogComponent, boolean>(
      SubmissionDetailDialogComponent,
      { submission },
      (saved) => saved && this.loadHttpData(),
      {
        widthSize: 'md',
        disableClose: true,
      }
    );
  }

  public cityCountryLine(row: InterestSubmission): string {
    return cityCountryLine(row.city, row.country);
  }

  public dobAgeLine(row: InterestSubmission): string {
    return birthdateAgeLine(row.date_of_birth);
  }

  public openDocument(row: InterestSubmission): void {
    const url = row.id_document_url?.trim();
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
