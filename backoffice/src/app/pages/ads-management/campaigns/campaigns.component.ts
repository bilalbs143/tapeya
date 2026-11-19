import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import type { AdCampaign, AdCampaignStatus } from 'src/app/services/ad/ad-campaign.service';
import { AdCampaignService } from 'src/app/services/ad/ad-campaign.service';
import { MessageService } from 'src/app/services/message.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import {
  bindListSearchFormLiveReload,
  SortReloadBinder,
  onListPaginationChange,
  resetListSearchForm,
} from 'src/app/shared/functions/list-page-paging.function';
import { buildListParams } from 'src/app/shared/functions/list-params.function';

import { ManageAdCampaignDialogComponent } from './manage-ad-campaign-dialog/manage-ad-campaign-dialog.component';

const DEFAULT_FILTERS = { search: '', status: '' } as const;

const STATUS_OPTIONS: { value: '' | AdCampaignStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'ended', label: 'Ended' },
];

@Component({
  selector: 'app-ad-campaigns',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    TablerIconsModule,
    CommonSharedModule,
  ],
  templateUrl: './campaigns.component.html',
})
export class AdCampaignsComponent implements OnInit, OnDestroy {
  private readonly campaignService = inject(AdCampaignService);
  private readonly messageService = inject(MessageService);
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
  public readonly displayedColumns: string[] = [
    'sr',
    'name',
    'brand_partner',
    'status',
    'surfaces',
    'flight',
    'priority',
    'actions',
  ];
  public dataSource = new MatTableDataSource<AdCampaign>([]);
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusOptions = STATUS_OPTIONS;
  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;

  constructor() {
    this.searchForm = this.fb.group({ search: [DEFAULT_FILTERS.search], status: [DEFAULT_FILTERS.status] });
    this.pageSize = this.paginatorConfig.pageSize;
  }

  public ngOnInit(): void {
    this.sub.add(bindListSearchFormLiveReload(this));
    this.loadHttpData();
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.sortBinder.destroy();
  }

  public surfacesLabel(row: AdCampaign): string {
    const labels: Record<string, string> = {
      home_feed: 'Home Feed',
      reels_feed: 'Reels Feed',
      live_overlay: 'Live Overlay',
      live_break: 'Live Break',
    };
    const values = row.surfaces ?? [];
    if (!values.length) return this.emptyCell;
    return values.map((s) => labels[s] ?? s).join(', ');
  }

  public resetSearchForm(): void {
    resetListSearchForm(this, DEFAULT_FILTERS);
  }

  public onPaginationChange(event: PageEvent): void {
    onListPaginationChange(this, event);
  }

  public loadHttpData(pageOverride?: number, perPageOverride?: number): void {
    const page = pageOverride ?? this.currentPage;
    const perPage = perPageOverride ?? this.pageSize;
    const filters = this.searchForm.value;
    let params = { ...buildListParams(page, perPage, this.sort ?? null, {}) } as Record<string, unknown>;
    if ((filters.status ?? '').trim() !== '') {
      params = { ...params, 'filter[status]': filters.status };
    }
    if ((filters.search ?? '').trim() !== '') {
      params = { ...params, 'filter[search]': (filters.search as string).trim() };
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
        this.messageService.error('Failed to load campaigns.');
      },
    });
  }

  public openCreateDialog(): void {
    this.messageService.openDialog<ManageAdCampaignDialogComponent, boolean>(
      ManageAdCampaignDialogComponent,
      { mode: 'create' },
      (result) => result && this.loadHttpData(),
      { widthSize: 'lg', disableClose: true }
    );
  }

  public openEditDialog(campaign: AdCampaign): void {
    this.messageService.openDialog<ManageAdCampaignDialogComponent, boolean>(
      ManageAdCampaignDialogComponent,
      { mode: 'edit', campaign },
      (result) => result && this.loadHttpData(),
      { widthSize: 'lg', disableClose: true }
    );
  }

  public openDeleteDialog(campaign: AdCampaign): void {
    this.sub.add(
      this.messageService
        .prompt('Delete Campaign?', `Delete "${campaign.name}"? Creatives under it will be removed.`, 'Delete', 'Cancel')
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.campaignService.delete(campaign.id).subscribe({
              next: () => this.loadHttpData(),
              error: () => this.messageService.error('Failed to delete campaign.'),
            });
          }
        })
    );
  }
}
