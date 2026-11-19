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
import type { BrandPartner, BrandPartnerStatus } from 'src/app/services/ad/brand-partner.service';
import { BrandPartnerService } from 'src/app/services/ad/brand-partner.service';
import { MessageService } from 'src/app/services/message.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { TableImageComponent } from 'src/app/shared/components/table-image/table-image.component';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import {
  bindListSearchFormLiveReload,
  SortReloadBinder,
  onListPaginationChange,
  resetListSearchForm,
} from 'src/app/shared/functions/list-page-paging.function';
import { buildListParams } from 'src/app/shared/functions/list-params.function';

import { ManageBrandPartnerDialogComponent } from './manage-brand-partner-dialog/manage-brand-partner-dialog.component';

const DEFAULT_FILTERS = { search: '', status: '' } as const;

const STATUS_OPTIONS: { value: '' | BrandPartnerStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' },
];

@Component({
  selector: 'app-brand-partners',
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
    TableImageComponent,
    CommonSharedModule,
  ],
  templateUrl: './brand-partners.component.html',
})
export class BrandPartnersComponent implements OnInit, OnDestroy {
  private readonly brandPartnerService = inject(BrandPartnerService);
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
  public readonly displayedColumns: string[] = ['sr', 'name', 'slug', 'logo', 'user', 'status', 'created_at', 'actions'];
  public dataSource = new MatTableDataSource<BrandPartner>([]);
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

  public logoUrl(row: BrandPartner): string | null {
    return row.logo_url ?? row.logo ?? null;
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
    this.brandPartnerService.getList(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load brand partners.');
      },
    });
  }

  public openCreateDialog(): void {
    this.messageService.openDialog<ManageBrandPartnerDialogComponent, boolean>(
      ManageBrandPartnerDialogComponent,
      { mode: 'create' },
      (result) => result && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }

  public openEditDialog(partner: BrandPartner): void {
    this.messageService.openDialog<ManageBrandPartnerDialogComponent, boolean>(
      ManageBrandPartnerDialogComponent,
      { mode: 'edit', partner },
      (result) => result && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }

  public openDeleteDialog(partner: BrandPartner): void {
    this.sub.add(
      this.messageService
        .prompt('Delete Brand Partner?', `Delete "${partner.name}"? Linked campaigns may become unusable.`, 'Delete', 'Cancel')
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.brandPartnerService.delete(partner.id).subscribe({
              next: () => this.loadHttpData(),
              error: () => this.messageService.error('Failed to delete brand partner.'),
            });
          }
        })
    );
  }
}
