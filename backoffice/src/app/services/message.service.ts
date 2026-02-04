import { HttpErrorResponse } from '@angular/common/http';
import { ComponentType } from '@angular/cdk/portal';
import { Injectable, OnDestroy, inject } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

type MessageType = 'success' | 'error' | 'info' | 'warning';

export interface MessageOptions {
  durationMs?: number;
}

export type DialogWidth = 'sm' | 'md' | 'lg' | 'xl';

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
      height: 'auto',
      data: dialogData ?? {},
    };

    const dialogRef = this.matDialog.open(dialogComponent, config) as MatDialogRef<T, R>;

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
