import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
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
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { TableImageComponent } from 'src/app/shared/components/table-image/table-image.component';
import { TableWrapperComponent } from 'src/app/shared/components/table-wrapper/table-wrapper.component';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { buildListParams } from 'src/app/shared/functions/list-params.function';
import { getStatusClass } from 'src/app/utils/status-class.util';

import { ManageBrandDialogComponent } from './manage-brand-dialog/manage-brand-dialog.component';

const DEFAULT_FILTERS = { name: '', is_active: '' } as const;

@Component({
  selector: 'app-brands',
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
    MatButtonModule,
    MatDialogModule,
    TablerIconsModule,
    TableImageComponent,
    TableWrapperComponent,
    PaginatorComponent,
  ],
  templateUrl: './brands.component.html',
})
export class BrandsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly brandService = inject(BrandService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  @ViewChild(MatSort) public sort!: MatSort;

  public searchForm: FormGroup;
  public readonly displayedColumns: string[] = [
    'sr',
    'name',
    'slug',
    'logo',
    'sort_order',
    'status',
    'created_at',
    'actions',
  ];
  public dataSource = new MatTableDataSource<Brand>([]);
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusClass = getStatusClass;
  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;

  public statusOptions$: Observable<EnumOption[]> = this.enumsService
    .getOptions('status')
    .pipe(map((opts) => [{ value: '', label: 'All' }, ...opts]));

  constructor() {
    this.searchForm = this.fb.group({ name: [DEFAULT_FILTERS.name], is_active: [DEFAULT_FILTERS.is_active] });
    this.pageSize = this.paginatorConfig.pageSize;
  }

  public ngOnInit(): void {
    this.loadHttpData();
  }

  public ngAfterViewInit(): void {
    this.sub.add(
      this.sort?.sortChange.subscribe(() => {
        this.currentPage = 0;
        this.loadHttpData();
      })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  /** Map enum value (active/inactive) to API filter value (1/0). */
  private mapStatusToIsActive(value: string | undefined): string | null {
    if (value === 'active') return '1';
    if (value === 'inactive') return '0';
    return null;
  }

  public resetSearchForm(): void {
    this.searchForm.reset({ ...DEFAULT_FILTERS });
    this.currentPage = 0;
    this.loadHttpData();
  }

  public onPaginationChange(event: PageEvent): void {
    const { pageIndex, pageSize } = event;
    if (this.currentPage !== pageIndex || this.pageSize !== pageSize) {
      this.currentPage = pageIndex;
      this.pageSize = pageSize;
      this.loadHttpData();
    }
  }

  public loadHttpData(pageOverride?: number, perPageOverride?: number): void {
    const page = pageOverride ?? this.currentPage;
    const perPage = perPageOverride ?? this.pageSize;
    const filters = this.searchForm.value;
    let params = { ...buildListParams(page, perPage, this.sort ?? null, {}) } as Record<string, unknown>;
    const statusFilter = this.mapStatusToIsActive(filters.is_active);
    if (statusFilter !== null) {
      params = { ...params, 'filter[is_active]': statusFilter };
    }
    if ((filters.name ?? '').trim() !== '') {
      params = { ...params, 'filter[name]': (filters.name as string).trim() };
    }
    this.isLoading = true;
    this.brandService.getList(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load brands.');
      },
    });
  }

  public openCreateDialog(): void {
    this.messageService.openDialog<ManageBrandDialogComponent, boolean>(
      ManageBrandDialogComponent,
      { mode: 'create' },
      (result) => result && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }

  public openEditDialog(brand: Brand): void {
    this.messageService.openDialog<ManageBrandDialogComponent, boolean>(
      ManageBrandDialogComponent,
      { mode: 'edit', brand },
      (result) => result && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }

  public openDeleteDialog(brand: Brand): void {
    this.sub.add(
      this.messageService
        .prompt('Delete Brand?', `Are you sure you want to delete "${brand.name}"?`, 'Delete', 'Cancel')
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.brandService.delete(brand.id).subscribe({
              next: () => this.loadHttpData(),
              error: () => this.messageService.error('Failed to delete brand.'),
            });
          }
        })
    );
  }
}
