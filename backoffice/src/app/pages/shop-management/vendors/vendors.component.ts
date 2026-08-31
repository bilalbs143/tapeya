import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
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
import { MessageService } from 'src/app/services/message.service';
import type { Vendor } from 'src/app/services/shop/vendor.service';
import { VendorService } from 'src/app/services/shop/vendor.service';
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

import { ManageVendorDialogComponent } from './manage-vendor-dialog/manage-vendor-dialog.component';
import { VendorReasonDialogComponent } from './vendor-reason-dialog/vendor-reason-dialog.component';

const DEFAULT_FILTERS = { search: '', status: '' } as const;

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'rejected', label: 'Rejected' },
] as const;

@Component({
  selector: 'app-vendors',
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
  templateUrl: './vendors.component.html',
})
export class VendorsComponent implements OnInit, OnDestroy {
  private readonly vendorService = inject(VendorService);
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
    'store_name',
    'slug',
    'user',
    'phone',
    'status',
    'commission_rate',
    'is_platform',
    'actions',
  ];
  public dataSource = new MatTableDataSource<Vendor>([]);
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusFilterOptions = STATUS_FILTER_OPTIONS;
  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;
  constructor() {
    this.searchForm = this.fb.group({
      search: [DEFAULT_FILTERS.search],
      status: [DEFAULT_FILTERS.status],
    });
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
    if ((filters.search ?? '').trim() !== '') {
      params = { ...params, 'filter[search]': (filters.search as string).trim() };
    }
    if ((filters.status ?? '') !== '') {
      params = { ...params, 'filter[status]': filters.status };
    }
    this.isLoading = true;
    this.vendorService.getList(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load vendors.');
      },
    });
  }

  public statusLabel(vendor: Vendor): string {
    if (vendor.status_label) return vendor.status_label;
    if (!vendor.status) return this.emptyCell;
    return vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1);
  }

  public canApprove(vendor: Vendor): boolean {
    return vendor.status === 'pending' || vendor.status === 'suspended' || vendor.status === 'rejected';
  }

  public canSuspend(vendor: Vendor): boolean {
    return vendor.status === 'approved';
  }

  public canReject(vendor: Vendor): boolean {
    return vendor.status === 'pending' && !vendor.is_platform;
  }

  public openCreateDialog(): void {
    this.messageService.openDialog<ManageVendorDialogComponent, boolean>(
      ManageVendorDialogComponent,
      { mode: 'create' },
      (result) => result && this.loadHttpData(),
      {
        widthSize: 'md',
        disableClose: true,
      }
    );
  }

  public openEditDialog(vendor: Vendor): void {
    this.messageService.openDialog<ManageVendorDialogComponent, boolean>(
      ManageVendorDialogComponent,
      { mode: 'edit', vendor },
      (result) => result && this.loadHttpData(),
      {
        widthSize: 'md',
        disableClose: true,
      }
    );
  }

  public approveVendor(vendor: Vendor): void {
    this.sub.add(
      this.messageService
        .prompt('Approve Vendor?', `Approve "${vendor.store_name}"?`, 'Approve', 'Cancel')
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.vendorService.approve(vendor.id).subscribe({
              next: () => this.loadHttpData(),
              error: () => this.messageService.error('Failed to approve vendor.'),
            });
          }
        })
    );
  }

  public suspendVendor(vendor: Vendor): void {
    this.messageService.openDialog<VendorReasonDialogComponent, string>(
      VendorReasonDialogComponent,
      {
        title: 'Suspend Vendor',
        message: `Suspend "${vendor.store_name}"? Products from this store will be hidden from shoppers.`,
        confirmText: 'Suspend',
        reasonLabel: 'Suspension Reason',
      },
      (reason) => {
        this.vendorService.suspend(vendor.id, { suspension_reason: reason.trim() || null }).subscribe({
          next: () => this.loadHttpData(),
          error: () => this.messageService.error('Failed to suspend vendor.'),
        });
      },
      { widthSize: 'sm', disableClose: true }
    );
  }

  public rejectVendor(vendor: Vendor): void {
    this.messageService.openDialog<VendorReasonDialogComponent, string>(
      VendorReasonDialogComponent,
      {
        title: 'Reject Vendor',
        message: `Reject application for "${vendor.store_name}"?`,
        confirmText: 'Reject',
        reasonLabel: 'Rejection Reason',
      },
      (reason) => {
        this.vendorService.reject(vendor.id, { rejection_reason: reason.trim() || null }).subscribe({
          next: () => this.loadHttpData(),
          error: () => this.messageService.error('Failed to reject vendor.'),
        });
      },
      { widthSize: 'sm', disableClose: true }
    );
  }

  public openDeleteDialog(vendor: Vendor): void {
    if (vendor.is_platform) {
      return;
    }
    this.sub.add(
      this.messageService
        .prompt(
          'Delete Vendor?',
          `Delete "${vendor.store_name}"? Vendors with existing products can't be deleted — remove or reassign their products first.`,
          'Delete',
          'Cancel'
        )
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.vendorService.delete(vendor.id).subscribe({
              next: () => this.loadHttpData(),
              error: () => this.messageService.error('Failed to delete vendor.'),
            });
          }
        })
    );
  }
}
