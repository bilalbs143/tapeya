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

/**
 * Which width tier to pick, by form complexity (see docs/BACKOFFICE_UX_AUDIT.md §9.1):
 *   xs (400px)  — confirmations only
 *   sm (500px)  — single-purpose, 1–3 fields
 *   md (850px)  — standard create/edit forms (the default)
 *   lg (1150px) — rich-text editor, image gallery, or 8+ fields
 *   xl (1300px) — dashboard-in-a-dialog only
 */
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
   * For 422 (validation), shows all field errors. Otherwise uses message/error/errors or fallback.
   */
  public httpError(error: unknown, fallbackMessage = 'Something went wrong. Please try again.') {
    if (!(error instanceof HttpErrorResponse)) {
      this.error(fallbackMessage);
      return;
    }

    const data = error.error as Record<string, unknown> | null | undefined;

    if (error.status === 422) {
      const allMessages = this.collectValidationErrors(data);
      const message = allMessages.length > 0 ? allMessages.join('\n') : ((data?.['message'] as string) ?? fallbackMessage);
      this.error(message, { durationMs: Math.max(4000, allMessages.length * 2000) });
      return;
    }

    const messageFromBackend =
      (data?.['message'] as string) ??
      (data?.['error'] as string) ??
      (typeof data === 'string' ? data : null) ??
      this.extractFirstValidationError((data?.['errors'] as Record<string, unknown>) ?? null);

    this.error(messageFromBackend || fallbackMessage);
  }

  /**
   * Collect all validation error messages from a 422 response.
   * Handles both { errors: { field: ["msg"] } } (Laravel) and { field: ["msg"] } (flat).
   */
  private collectValidationErrors(data: Record<string, unknown> | null | undefined): string[] {
    const errors = (data?.['errors'] ?? data) as Record<string, unknown> | null | undefined;
    if (!errors || typeof errors !== 'object') {
      return [];
    }

    const messages: string[] = [];
    Object.values(errors).forEach((value) => {
      if (Array.isArray(value)) {
        value.forEach((msg) => {
          if (typeof msg === 'string') messages.push(msg);
        });
      } else if (typeof value === 'string') {
        messages.push(value);
      }
    });
    return messages;
  }

  private extractFirstValidationError(errors: Record<string, unknown> | null | undefined): string | null {
    const all = this.collectValidationErrors(errors ?? undefined);
    return all.length > 0 ? all[0] : null;
  }
}
