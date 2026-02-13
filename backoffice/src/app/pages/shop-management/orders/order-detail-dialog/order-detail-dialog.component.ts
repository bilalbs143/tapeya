import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { EnumsService } from 'src/app/services/enums.service';
import type { EnumOption } from 'src/app/services/enums.service';
import type { Order, OrderItem } from 'src/app/services/shop/order.service';
import { OrderService } from 'src/app/services/shop/order.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { getStatusClass } from 'src/app/utils/status-class.util';

export interface OrderDetailDialogData {
  order: Order;
}

@Component({
  selector: 'app-order-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
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
  private readonly dialogRef = inject<MatDialogRef<OrderDetailDialogComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);

  public order: Order | null = null;
  public form!: FormGroup;
  public isSubmitting = false;
  public isLoading = true;
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusClass = getStatusClass;
  public statusOptions$: Observable<EnumOption[]> = this.enumsService.getOptions('order_status');
  public displayedColumns: string[] = ['product', 'quantity', 'unit_price', 'total_price'];

  public ngOnInit(): void {
    this.form = this.fb.group({
      status: [this.data.order.status, [Validators.required]],
    });
    this.orderService.getById(this.data.order.id).subscribe({
      next: (res) => {
        this.order = res.data;
        this.form.patchValue({ status: this.order?.status ?? this.data.order.status });
        this.isLoading = false;
      },
      error: () => {
        this.order = this.data.order;
        this.isLoading = false;
      },
    });
  }

  public get items(): OrderItem[] {
    return this.order?.items ?? [];
  }

  public productName(item: OrderItem): string {
    const snap = item.product_snapshot as { name?: string };
    return snap?.name ?? this.emptyCell;
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
          console.log('Order status update failed', err);
        },
      });
  }
}
