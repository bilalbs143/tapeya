import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { format } from 'date-fns';
import { Observable, Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import type { EnumOption } from 'src/app/services/enums.service';
import { EnumsService } from 'src/app/services/enums.service';
import { MessageService } from 'src/app/services/message.service';
import type { Order } from 'src/app/services/shop/order.service';
import { OrderService } from 'src/app/services/shop/order.service';
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

import { OrderDetailDialogComponent } from './order-detail-dialog/order-detail-dialog.component';

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  payment_status: '',
  created_after: null as Date | null,
  created_before: null as Date | null,
} as const;

@Component({
  selector: 'app-orders',
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
    MatDatepickerModule,
    MatDialogModule,
    TablerIconsModule,
    CommonSharedModule,
  ],
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit, OnDestroy {
  private readonly orderService = inject(OrderService);
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
    'order_number',
    'user',
    'phone',
    'total',
    'currency',
    'status',
    'payment_status',
    'address',
    'created_at',
    'actions',
  ];
  public dataSource = new MatTableDataSource<Order>([]);
  public readonly emptyCell = EMPTY_CELL;
  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;
  public statusOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('order_status');
  public paymentStatusOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('payment_status');

  constructor() {
    this.searchForm = this.fb.group({
      search: [DEFAULT_FILTERS.search],
      status: [DEFAULT_FILTERS.status],
      payment_status: [DEFAULT_FILTERS.payment_status],
      created_after: [DEFAULT_FILTERS.created_after],
      created_before: [DEFAULT_FILTERS.created_before],
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
    let params = {
      ...buildListParams(page, perPage, this.sort ?? null, {
        status: filters.status ?? '',
        search: (filters.search ?? '').trim(),
        created_after: filters.created_after ? format(filters.created_after, 'yyyy-MM-dd') : undefined,
        created_before: filters.created_before ? format(filters.created_before, 'yyyy-MM-dd') : undefined,
      }),
    } as Record<string, unknown>;
    if ((filters.payment_status ?? '') !== '') {
      params = { ...params, 'filter[payment_status]': filters.payment_status };
    }
    this.isLoading = true;
    this.orderService.getList(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load orders.');
      },
    });
  }

  public openDetailDialog(order: Order): void {
    this.messageService.openDialog<OrderDetailDialogComponent, boolean>(
      OrderDetailDialogComponent,
      { order },
      (result) => result && this.loadHttpData(),
      { widthSize: 'md', disableClose: true }
    );
  }
}
