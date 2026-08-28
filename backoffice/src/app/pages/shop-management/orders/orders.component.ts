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
import { buildListParams } from 'src/app/shared/functions/list-params.function';

import { OrderDetailDialogComponent } from './order-detail-dialog/order-detail-dialog.component';

const DEFAULT_FILTERS = { order_number: '', status: '', payment_status: '', phone: '' } as const;

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
    MatButtonModule,
    MatDialogModule,
    TablerIconsModule,
    CommonSharedModule,
  ],
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly orderService = inject(OrderService);
  private readonly messageService = inject(MessageService);
  private readonly enumsService = inject(EnumsService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  @ViewChild(MatSort) public sort!: MatSort;

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
      order_number: [DEFAULT_FILTERS.order_number],
      status: [DEFAULT_FILTERS.status],
      payment_status: [DEFAULT_FILTERS.payment_status],
      phone: [DEFAULT_FILTERS.phone],
    });
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
    let params = { ...buildListParams(page, perPage, this.sort ?? null, { status: filters.status ?? '' }) } as Record<
      string,
      unknown
    >;
    if ((filters.payment_status ?? '') !== '') {
      params = { ...params, 'filter[payment_status]': filters.payment_status };
    }
    if ((filters.order_number ?? '').trim() !== '') {
      params = { ...params, 'filter[order_number]': (filters.order_number as string).trim() };
    }
    if ((filters.phone ?? '').trim() !== '') {
      params = { ...params, 'filter[phone]': (filters.phone as string).trim() };
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
