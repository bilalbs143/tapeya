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
import { map, Observable, Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import type { EnumOption } from 'src/app/services/enums.service';
import { EnumsService } from 'src/app/services/enums.service';
import { MessageService } from 'src/app/services/message.service';
import type { Brand } from 'src/app/services/shop/brand.service';
import { BrandService } from 'src/app/services/shop/brand.service';
import type { Category } from 'src/app/services/shop/category.service';
import { CategoryService } from 'src/app/services/shop/category.service';
import type { Product } from 'src/app/services/shop/product.service';
import { ProductService } from 'src/app/services/shop/product.service';
import type { Vendor } from 'src/app/services/shop/vendor.service';
import { VendorService } from 'src/app/services/shop/vendor.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { ALL_YES_NO_FILTER_OPTIONS } from 'src/app/shared/constants/filter-options.constants';
import {
  bindListSearchFormLiveReload,
  SortReloadBinder,
  onListPaginationChange,
  resetListSearchForm,
} from 'src/app/shared/functions/list-page-paging.function';
import { buildListParams } from 'src/app/shared/functions/list-params.function';

import { ManageProductDialogComponent } from './manage-product-dialog/manage-product-dialog.component';

const DEFAULT_FILTERS = {
  search: '',
  is_active: '',
  brand_id: '',
  category_id: '',
  vendor_id: '',
  is_special_offer: '',
  stock_status: '',
} as const;

@Component({
  selector: 'app-products',
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
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly brandService = inject(BrandService);
  private readonly categoryService = inject(CategoryService);
  private readonly vendorService = inject(VendorService);
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
  public readonly displayedColumns: string[] = [
    'sr',
    'name',
    'sku',
    'price',
    'sale_price',
    'sale_percentage',
    'sale_type',
    'vendor',
    'brand',
    'category',
    'stock_quantity',
    'status',
    'created_at',
    'actions',
  ];
  public dataSource = new MatTableDataSource<Product>([]);
  public readonly emptyCell = EMPTY_CELL;
  public readonly yesNoOptions = ALL_YES_NO_FILTER_OPTIONS;
  public readonly string = String;
  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;
  public brands: Brand[] = [];
  public categories: Category[] = [];
  public vendors: Vendor[] = [];

  public activeOptions$: Observable<EnumOption[]> = this.enumsService
    .getOptions('status')
    .pipe(map((opts) => [{ value: '', label: 'All' }, ...opts]));

  constructor() {
    this.searchForm = this.fb.group({
      search: [DEFAULT_FILTERS.search],
      is_active: [DEFAULT_FILTERS.is_active],
      brand_id: [DEFAULT_FILTERS.brand_id],
      category_id: [DEFAULT_FILTERS.category_id],
      vendor_id: [DEFAULT_FILTERS.vendor_id],
      is_special_offer: [DEFAULT_FILTERS.is_special_offer],
      stock_status: [DEFAULT_FILTERS.stock_status],
    });
    this.pageSize = this.paginatorConfig.pageSize;
  }

  public ngOnInit(): void {
    this.sub.add(bindListSearchFormLiveReload(this));
    this.loadBrands();
    this.loadCategories();
    this.loadVendors();
    this.loadHttpData();
  }

  private loadBrands(): void {
    this.brandService.getList({ all: true, sort: 'name' }).subscribe({
      next: (res) => {
        this.brands = res.data ?? [];
      },
    });
  }

  private loadCategories(): void {
    this.categoryService.getList({ all: true, sort: 'sort_order' }).subscribe({
      next: (res) => {
        this.categories = res.data ?? [];
      },
    });
  }

  private loadVendors(): void {
    this.vendorService.getList({ all: true, sort: 'store_name' }).subscribe({
      next: (res) => {
        this.vendors = res.data ?? [];
      },
    });
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.sortBinder.destroy();
  }

  private mapStatusToIsActive(value: string | undefined): string | null {
    if (value === 'active') return '1';
    if (value === 'inactive') return '0';
    return null;
  }

  private mapYesNo(value: string | undefined): string | null {
    if (value === 'yes') return '1';
    if (value === 'no') return '0';
    return null;
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
    const statusFilter = this.mapStatusToIsActive(filters.is_active);
    if (statusFilter !== null) params = { ...params, 'filter[is_active]': statusFilter };
    if ((filters.search ?? '').trim() !== '') params = { ...params, 'filter[search]': (filters.search as string).trim() };
    if ((filters.brand_id ?? '') !== '') params = { ...params, 'filter[brand_id]': filters.brand_id };
    if ((filters.category_id ?? '') !== '') params = { ...params, 'filter[category_id]': filters.category_id };
    if ((filters.vendor_id ?? '') !== '') params = { ...params, 'filter[vendor_id]': filters.vendor_id };
    const onSaleFilter = this.mapYesNo(filters.is_special_offer);
    if (onSaleFilter !== null) params = { ...params, 'filter[is_special_offer]': onSaleFilter };
    if ((filters.stock_status ?? '') !== '') params = { ...params, 'filter[stock_status]': filters.stock_status };
    this.isLoading = true;
    this.productService.getList(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load products.');
      },
    });
  }

  public openCreateDialog(): void {
    this.messageService.openDialog<ManageProductDialogComponent, boolean>(
      ManageProductDialogComponent,
      { mode: 'create' },
      (result) => result && this.loadHttpData(),
      {
        widthSize: 'md',
        disableClose: true,
      }
    );
  }

  public openEditDialog(product: Product): void {
    this.messageService.openDialog<ManageProductDialogComponent, boolean>(
      ManageProductDialogComponent,
      { mode: 'edit', product },
      (result) => result && this.loadHttpData(),
      {
        widthSize: 'md',
        disableClose: true,
      }
    );
  }

  public openDeleteDialog(product: Product): void {
    this.sub.add(
      this.messageService
        .prompt('Delete Product?', `Are you sure you want to delete "${product.name}"?`, 'Delete', 'Cancel')
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.productService.delete(product.id).subscribe({
              next: () => this.loadHttpData(),
              error: () => this.messageService.error('Failed to delete product.'),
            });
          }
        })
    );
  }
}
