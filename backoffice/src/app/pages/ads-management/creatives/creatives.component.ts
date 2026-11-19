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
import type { AdCreative, AdCreativeStatus } from 'src/app/services/ad/ad-creative.service';
import { AdCreativeService } from 'src/app/services/ad/ad-creative.service';
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

import { ManageAdCreativeDialogComponent } from './manage-ad-creative-dialog/manage-ad-creative-dialog.component';

const DEFAULT_FILTERS = { search: '', status: '' } as const;

const STATUS_OPTIONS: { value: '' | AdCreativeStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'paused', label: 'Paused' },
];

@Component({
  selector: 'app-ad-creatives',
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
  templateUrl: './creatives.component.html',
})
export class AdCreativesComponent implements OnInit, OnDestroy {
  private readonly creativeService = inject(AdCreativeService);
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
  public readonly displayedColumns: string[] = ['sr', 'name', 'campaign', 'post_id', 'cta', 'status', 'actions'];
  public dataSource = new MatTableDataSource<AdCreative>([]);
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusOptions = STATUS_OPTIONS;
  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;
  public actionBusyId: number | null = null;

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

  public statusLabel(status: string): string {
    return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
  }

  public ctaTypeLabel(type: string | null | undefined): string {
    if (type === 'deep_link') return 'Deep Link';
    if (type === 'whatsapp') return 'WhatsApp';
    if (type === 'url') return 'URL';
    return type || this.emptyCell;
  }

  public canApprove(row: AdCreative): boolean {
    return row.status === 'pending_review' || row.status === 'rejected' || row.status === 'paused';
  }

  public canReject(row: AdCreative): boolean {
    return row.status === 'pending_review' || row.status === 'approved';
  }

  public canPause(row: AdCreative): boolean {
    return row.status === 'approved';
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
    this.creativeService.getList(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load creatives.');
      },
    });
  }

  public openCreateDialog(): void {
    this.messageService.openDialog<ManageAdCreativeDialogComponent, boolean>(
      ManageAdCreativeDialogComponent,
      { mode: 'create' },
      (result) => result && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }

  public openEditDialog(creative: AdCreative): void {
    this.messageService.openDialog<ManageAdCreativeDialogComponent, boolean>(
      ManageAdCreativeDialogComponent,
      { mode: 'edit', creative },
      (result) => result && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }

  public approve(row: AdCreative): void {
    this.runAction(row.id, () => this.creativeService.approve(row.id), 'Failed to approve creative.');
  }

  public reject(row: AdCreative): void {
    this.sub.add(
      this.messageService
        .prompt('Reject Creative?', `Reject "${row.name}"? It will not serve until approved again.`, 'Reject', 'Cancel')
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.runAction(row.id, () => this.creativeService.reject(row.id), 'Failed to reject creative.');
          }
        })
    );
  }

  public pause(row: AdCreative): void {
    this.runAction(row.id, () => this.creativeService.pause(row.id), 'Failed to pause creative.');
  }

  private runAction(id: number, request: () => ReturnType<AdCreativeService['approve']>, errorMessage: string): void {
    this.actionBusyId = id;
    request().subscribe({
      next: () => {
        this.actionBusyId = null;
        this.loadHttpData();
      },
      error: () => {
        this.actionBusyId = null;
        this.messageService.error(errorMessage);
      },
    });
  }
}
