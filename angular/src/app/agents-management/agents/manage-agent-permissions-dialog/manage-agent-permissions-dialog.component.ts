import { HttpParams } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';

import { MessageService } from '../../../shared/services/message.service';
import { PermissionsManagementService } from '../../../shared/services/permissions-management.service';

@Component({
  selector: 'app-manage-agent-permissions-dialog',
  templateUrl: './manage-agent-permissions-dialog.component.html',
  standalone: false,
})
export class ManageAgentPermissionsDialogComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  private permissionsManagementService = inject(PermissionsManagementService);
  private messageService = inject(MessageService);
  private dialogRef = inject<MatDialogRef<ManageAgentPermissionsDialogComponent>>(MatDialogRef);

  public isLoading: boolean = true;
  public isSubmitting: boolean = false;
  public permissions: any = [];
  public selectedPermissions: Set<string> = new Set();
  public agentId: number;

  public ngOnInit(): void {
    this.agentId = this.data.record.id;
    this.loadHttpData();
  }

  private loadHttpData(): void {
    this.isLoading = true;
    const requestParams = new HttpParams().set('all', true);
    this.permissionsManagementService
      .get(requestParams)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.permissions = response.data || [];
          this.initializeSelectedPermissions();
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }

  private initializeSelectedPermissions(): void {
    const grantedPermissions = new Set(this.data.record.permissions.map((permission: any) => permission));

    this.permissions.forEach((permission: any) => {
      if (grantedPermissions.has(permission.key)) {
        this.selectedPermissions.add(permission.key);
      }
    });
  }

  public togglePermission(permissionKey: string): void {
    if (this.selectedPermissions.has(permissionKey)) {
      this.selectedPermissions.delete(permissionKey);
    } else {
      this.selectedPermissions.add(permissionKey);
    }
  }

  public isSelected(permissionKey: string): boolean {
    return this.selectedPermissions.has(permissionKey);
  }

  public onSubmit(): void {
    const selectedPermissions = Array.from(this.selectedPermissions);

    this.isSubmitting = true;
    this.permissionsManagementService
      .sync({ permissions: selectedPermissions }, this.agentId)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.messageService.snackBar(response.message);
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.messageService.snackBar(error.error.message);
        },
      });
  }
}
