import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { EnumsService } from 'src/app/services/enums.service';
import type { EnumOption } from 'src/app/services/enums.service';
import { MessageService } from 'src/app/services/message.service';
import type { Order, OrderItem, VendorOrderSummary } from 'src/app/services/shop/order.service';
import { OrderService } from 'src/app/services/shop/order.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { getStatusClass } from 'src/app/utils/status-class.util';

export interface OrderDetailDialogData {
  order: Order;
}

const PAYMENT_STATUS_VALUES = ['unpaid', 'advance', 'paid'] as const;
const REFUND_STATUS_VALUES = [{ value: 'refunded', label: 'Refunded' }] as const;

@Component({
  selector: 'app-order-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatDivider,
    TablerIconsModule,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './order-detail-dialog.component.html',
})
export class OrderDetailDialogComponent implements OnInit {
  public readonly data = inject<OrderDetailDialogData>(MAT_DIALOG_DATA);
  private readonly orderService = inject(OrderService);
  private readonly enumsService = inject(EnumsService);
  private readonly messageService = inject(MessageService);
  private readonly dialogRef = inject<MatDialogRef<OrderDetailDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);

  public order: Order | null = null;
  public form!: FormGroup;
  public paymentForm!: FormGroup;
  public refundForm!: FormGroup;
  public isSubmitting = false;
  public isSubmittingPayment = false;
  public isSubmittingRefund = false;
  public readonly refundStatusOptions = REFUND_STATUS_VALUES;
  public isLoading = true;
  public paymentUpdated = false;
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusClass = getStatusClass;
  public statusOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('order_status');
  public paymentStatusOptions$: Observable<EnumOption[]> = this.enumsService
    .getOptions('payment_status')
    .pipe(map((opts) => opts.filter((o) => (PAYMENT_STATUS_VALUES as readonly string[]).includes(o.value))));
  public displayedColumns: string[] = ['product', 'quantity', 'unit_price', 'total_price'];

  public ngOnInit(): void {
    this.form = this.fb.group({
      status: [this.data.order.status, [Validators.required]],
    });
    this.paymentForm = this.fb.group({
      payment_status: [this.data.order.payment_status ?? 'unpaid', [Validators.required]],
      amount_received: [this.data.order.amount_received ?? null],
    });
    this.refundForm = this.fb.group({
      payment_status: ['refunded', [Validators.required]],
      notes: [''],
    });
    this.orderService.getById(this.data.order.id).subscribe({
      next: (res) => {
        this.order = res.data;
        this.form.patchValue({ status: this.order?.status ?? this.data.order.status });
        this.patchPaymentForm(this.order);
        this.isLoading = false;
      },
      error: () => {
        this.order = this.data.order;
        this.patchPaymentForm(this.order);
        this.isLoading = false;
      },
    });
  }

  public get items(): OrderItem[] {
    return this.order?.items ?? [];
  }

  public get vendorOrders(): VendorOrderSummary[] {
    return this.order?.vendor_orders ?? [];
  }

  public productName(item: OrderItem): string {
    const snap = item.product_snapshot as { name?: string };
    return snap?.name ?? this.emptyCell;
  }

  public onSubmitPayment(): void {
    if (this.paymentForm.invalid || !this.order) return;
    this.isSubmittingPayment = true;
    const { payment_status, amount_received } = this.paymentForm.value;
    const payload = {
      payment_status: payment_status as string,
      amount_received:
        amount_received === null || amount_received === undefined || amount_received === '' ? null : Number(amount_received),
    };
    this.orderService
      .updatePayment(this.order.id, payload)
      .pipe(finalize(() => (this.isSubmittingPayment = false)))
      .subscribe({
        next: (res) => {
          this.order = res.data;
          this.paymentUpdated = true;
          this.patchPaymentForm(this.order);
        },
        error: (err) => {
          this.messageService.httpError(err);
        },
      });
  }

  public onSubmit(): void {
    if (this.form.invalid || !this.order) return;
    this.isSubmitting = true;
    this.orderService
      .updateStatus(this.order.id, this.form.value.status)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res) => {
          this.order = res.data;
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.messageService.httpError(err);
        },
      });
  }

  public get canRefund(): boolean {
    const status = this.order?.payment_status;
    return status === 'paid' || status === 'advance';
  }

  public onSubmitRefund(): void {
    if (this.refundForm.invalid || !this.order || !this.canRefund) return;
    this.isSubmittingRefund = true;
    const { payment_status, notes } = this.refundForm.value;
    const payload = {
      payment_status: payment_status as 'refunded',
      amount_received: 0,
      notes: (notes as string)?.trim() || null,
    };
    this.orderService
      .refund(this.order.id, payload)
      .pipe(finalize(() => (this.isSubmittingRefund = false)))
      .subscribe({
        next: (res) => {
          this.order = res.data;
          this.paymentUpdated = true;
          this.patchPaymentForm(this.order);
          this.refundForm.patchValue({
            payment_status: 'refunded',
            notes: '',
          });
        },
        error: (err) => {
          this.messageService.httpError(err);
        },
      });
  }

  private patchPaymentForm(order: Order | null): void {
    if (!order) return;
    this.paymentForm.patchValue({
      payment_status: order.payment_status ?? 'unpaid',
      amount_received: order.amount_received ?? null,
    });
  }
}
