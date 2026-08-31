import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, inject } from '@angular/core';
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
import { RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Observable, Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import type { EnumOption } from 'src/app/services/enums.service';
import { EnumsService } from 'src/app/services/enums.service';
import { type InterestCampaign, InterestCampaignService } from 'src/app/services/interest-campaign.service';
import { MessageService } from 'src/app/services/message.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import {
  SortReloadBinder,
  onListPaginationChange,
  resetListSearchForm,
} from 'src/app/shared/functions/list-page-paging.function';
import { buildListParams } from 'src/app/shared/functions/list-params.function';
import { environment } from 'src/environments/environment';

import { ManageCampaignDialogComponent } from './manage-campaign-dialog/manage-campaign-dialog.component';

const LINKED_OPTIONS: { value: '' | 'true' | 'false'; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Linked Tournament' },
  { value: 'false', label: 'Custom Title' },
];

const DEFAULT_FILTERS = { status: '', linked: '', search: '' } as const;

@Component({
  selector: 'app-interest-campaigns-list',
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
    RouterLink,
  ],
  templateUrl: './interest-campaigns-list.component.html',
})
export class InterestCampaignsListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public tournamentId: number | null = null;
  @Input() public tournamentName: string | null = null;

  private readonly campaignService = inject(InterestCampaignService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  private readonly sortBinder = new SortReloadBinder(this);

  @ViewChild(MatSort)
  public set sort(value: MatSort | undefined) {
    this.sortBinder.bind(value);
  }

  public get sort(): MatSort | undefined {
    return this.sortBinder.current;
  }

  public searchForm: FormGroup;
  public dataSource = new MatTableDataSource<InterestCampaign>([]);
  public readonly emptyCell = EMPTY_CELL;
  public readonly linkedOptions = LINKED_OPTIONS;

  public statusOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('tournament_interest_campaign_status');

  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;
  public get displayedColumns(): string[] {
    const cols = ['sr', 'title', 'kind', 'slug', 'status', 'submissions', 'created_at', 'actions'];
    if (this.tournamentId !== null) {
      return cols.filter((c) => c !== 'kind');
    }
    return cols;
  }

  constructor() {
    this.searchForm = this.fb.group({
      status: [DEFAULT_FILTERS.status],
      linked: [DEFAULT_FILTERS.linked],
      search: [DEFAULT_FILTERS.search],
    });
    this.pageSize = this.paginatorConfig.pageSize;
  }

  public ngOnInit(): void {
    this.loadHttpData();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['tournamentId']) {
      // Routed navigation (withComponentInputBinding) sets every declared @Input to `undefined`
      // when the route has no matching param/data key, clobbering the `null` class default.
      this.tournamentId ??= null;
      if (!changes['tournamentId'].firstChange) {
        this.currentPage = 0;
        this.loadHttpData();
      }
    }
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
    };
    if (this.tournamentId !== null) {
      params = { ...params, 'filter[tournament_id]': this.tournamentId };
    } else {
      const linked = (filters.linked ?? '').trim();
      if (linked !== '') params = { ...params, 'filter[linked]': linked };
      const search = (filters.search ?? '').trim();
      if (search !== '') params = { ...params, 'filter[tournament_name]': search };
    }

    this.isLoading = true;
    this.campaignService.getList(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to Load Interest Campaigns.');
      },
    });
  }

  public openCreateDialog(): void {
    this.messageService.openDialog<ManageCampaignDialogComponent, boolean>(
      ManageCampaignDialogComponent,
      {
        mode: 'create',
        lockedTournamentId: this.tournamentId,
        lockedTournamentName: this.tournamentName,
      },
      (saved) => saved && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }

  public openEditDialog(campaign: InterestCampaign): void {
    this.messageService.openDialog<ManageCampaignDialogComponent, boolean>(
      ManageCampaignDialogComponent,
      { mode: 'edit', campaign },
      (saved) => saved && this.loadHttpData(),
      {
        widthSize: 'md',
        disableClose: true,
      }
    );
  }

  public openDeleteDialog(campaign: InterestCampaign): void {
    this.sub.add(
      this.messageService
        .prompt(
          'Delete Interest Campaign?',
          `Permanently delete "${campaign.tournament_name}" and all its submissions? This cannot be undone.`,
          'Delete',
          'Cancel'
        )
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.campaignService.delete(campaign.id).subscribe({
              next: () => this.loadHttpData(),
              error: () => this.messageService.error('Failed to Delete Interest Campaign.'),
            });
          }
        })
    );
  }

  public copyLink(campaign: InterestCampaign): void {
    const url = `${environment.appUrl}/interest/${campaign.slug}`;
    navigator.clipboard
      .writeText(url)
      .then(() => this.messageService.success('Link Copied to Clipboard.'))
      .catch(() => this.messageService.error('Failed to Copy Link.'));
  }
}
