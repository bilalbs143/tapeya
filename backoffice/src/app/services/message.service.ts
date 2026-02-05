import { ComponentType } from '@angular/cdk/portal';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy, inject } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Observable, Subject, takeUntil } from 'rxjs';

import { PromptDialogComponent } from 'src/app/shared/components/prompt-dialog/prompt-dialog.component';
import type { PromptDialogData } from 'src/app/shared/components/prompt-dialog/prompt-dialog.component';

type MessageType = 'success' | 'error' | 'info' | 'warning';

export interface MessageOptions {
  durationMs?: number;
}

export type DialogWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface DialogConfig extends MatDialogConfig {
  widthSize?: DialogWidth;
}

export interface DialogData {
  [key: string]: unknown;
}

export interface OpenDialogOptions {
  disableClose?: boolean;
  widthSize?: DialogWidth;
}

@Injectable({ providedIn: 'root' })
export class MessageService implements OnDestroy {
  private readonly snackBar = inject(MatSnackBar);
  private readonly matDialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  private readonly dialogWidths: Record<DialogWidth, string> = {
    xs: '400px',
    sm: '500px',
    md: '850px',
    lg: '1150px',
    xl: '1300px',
  };

  /**
   * Opens a dialog with consistent width options and optional after-close callback.
   * Uses widthSize (sm/md/lg/xl) and subscribes to afterClosed with cleanup.
   */
  public openDialog<T, R = unknown>(
    dialogComponent: ComponentType<T>,
    dialogData?: DialogData,
    afterCloseCallback?: (response: R) => void,
    options?: OpenDialogOptions
  ): MatDialogRef<T, R> {
    const { disableClose = true, widthSize = 'md' } = options ?? {};
    const width = this.dialogWidths[widthSize];

    const config: MatDialogConfig = {
      disableClose,
      width,
      minWidth: width,
      maxWidth: width,
      height: 'auto',
      data: dialogData ?? {},
    };

    const dialogRef = this.matDialog.open(dialogComponent, config);

    if (afterCloseCallback) {
      dialogRef
        .afterClosed()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response !== undefined && response !== null) {
              afterCloseCallback(response as R);
            }
          },
          error: (err) => {
            console.error('MessageService.openDialog afterClosed error:', err);
          },
        });
    }

    return dialogRef;
  }

  /**
   * Opens a prompt/confirmation dialog with title, message, and optional accept/reject buttons.
   * Returns the dialog ref; subscribe to afterClosed() for the result (true = accept, false/undefined = cancel).
   */
  public prompt(
    title: string,
    message: string,
    acceptBtnText = 'Yes',
    rejectBtnText = 'No',
    onlyCancel = false,
    rejectBtn = true,
    widthSize: DialogWidth = 'xs'
  ): MatDialogRef<PromptDialogComponent, boolean> {
    const width = this.dialogWidths[widthSize];
    const data: PromptDialogData = {
      title,
      message,
      acceptBtnText,
      rejectBtnText,
      onlyCancel,
      rejectBtn,
    };
    const config: MatDialogConfig = {
      data,
      height: 'auto',
      width,
      minWidth: width,
      maxWidth: width,
      disableClose: true,
    };
    return this.matDialog.open(PromptDialogComponent, config);
  }

  /**
   * Opens a prompt dialog and runs an action if the user confirms.
   * On confirm: calls actionToExecute(rowData), shows success/error toast, then optional postActionCallback.
   */
  public openPromptDialog(
    title: string,
    message: string,
    confirmButtonText: string,
    cancelButtonText: string,
    actionToExecute: (rowData: unknown) => Observable<{ message?: string }>,
    rowData: unknown,
    postActionCallback?: () => void
  ): void {
    this.prompt(title, message, confirmButtonText, cancelButtonText, false, true, 'sm')
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          actionToExecute(rowData).subscribe({
            next: (response) => {
              this.success(response?.message ?? 'Done.');
              postActionCallback?.();
            },
            error: (err: unknown) => {
              this.httpError(err);
            },
          });
        }
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private open(message: string, type: MessageType, options?: MessageOptions) {
    const config: MatSnackBarConfig = {
      duration: options?.durationMs ?? 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`toast-${type}`],
    };

    this.snackBar.open(message, 'Close', config);
  }

  public success(message: string, options?: MessageOptions) {
    this.open(message, 'success', options);
  }

  public error(message: string, options?: MessageOptions) {
    this.open(message, 'error', options);
  }

  public info(message: string, options?: MessageOptions) {
    this.open(message, 'info', options);
  }

  public warning(message: string, options?: MessageOptions) {
    this.open(message, 'warning', options);
  }

  /**
   * Smart helper to display a message from an HttpErrorResponse.
   * Looks for common Laravel-style fields: message, error, errors[*].
   */
  public httpError(error: unknown, fallbackMessage = 'Something went wrong. Please try again.') {
    if (!(error instanceof HttpErrorResponse)) {
      this.error(fallbackMessage);
      return;
    }

    const data = error.error;

    const messageFromBackend =
      data?.message ??
      data?.error ??
      (typeof data === 'string' ? data : null) ??
      this.extractFirstValidationError(data?.errors);

    this.error(messageFromBackend || fallbackMessage);
  }

  private extractFirstValidationError(errors: any): string | null {
    if (!errors || typeof errors !== 'object') {
      return null;
    }

    const firstKey = Object.keys(errors)[0];
    if (!firstKey) return null;

    const firstError = errors[firstKey];
    if (Array.isArray(firstError)) {
      return firstError[0] as string;
    }

    if (typeof firstError === 'string') {
      return firstError;
    }

    return null;
  }
}
