import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';

import { BackofficeUser, UsersService } from 'src/app/services/users.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';

export interface ManageUserDialogData {
  mode: 'create' | 'edit';
  user?: BackofficeUser;
}

@Component({
  selector: 'app-manage-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TablerIconsModule,
    DialogWrapperComponent,
  ],
  templateUrl: './manage-user-dialog.component.html',
})
export class ManageUserDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly users = inject(UsersService);
  private readonly dialogRef = inject<MatDialogRef<ManageUserDialogComponent>>(MatDialogRef);

  public readonly data = inject<ManageUserDialogData>(MAT_DIALOG_DATA);

  public form: FormGroup = this.fb.group({
    id: [this.data.user?.id ?? null],
    name: [this.data.user?.name ?? '', [Validators.required]],
    email: [this.data.user?.email ?? '', [Validators.required, Validators.email]],
    role: [this.data.user?.role ?? 'Viewer', [Validators.required]],
    status: [this.data.user?.status ?? 'active', [Validators.required]],
  });

  public get title(): string {
    return this.data.mode === 'edit' ? 'Edit User' : 'Create User';
  }

  public save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.users.upsert(this.form.value);
    this.dialogRef.close(true);
  }

  public delete(): void {
    const id = this.data.user?.id;
    if (!id) return;
    this.users.remove(id);
    this.dialogRef.close(true);
  }
}
