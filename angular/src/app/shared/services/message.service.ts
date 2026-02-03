import { ComponentType } from '@angular/cdk/portal';
import { Injectable, NgModuleRef, OnDestroy, TemplateRef, inject } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DialogComponent } from '../components/dialog/dialog.component';
import { PromptDialogComponent } from '../components/prompt-dialog/prompt-dialog.component';

export interface DialogConfig extends MatDialogConfig {
  widthSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface DialogData {
  action?: string;
  record?: any;
}
export type DialogWidth = 'sm' | 'md' | 'lg' | 'xl';

@Injectable({
  providedIn: 'root',
})
export class MessageService implements OnDestroy {
  private readonly matDialog = inject(MatDialog);
  private readonly matSnackbar = inject(MatSnackBar);
  private readonly moduleRef = inject<NgModuleRef<any>>(NgModuleRef);
  private readonly translate = inject(TranslateService);

  private readonly matDialogWidths: { [key in DialogWidth]: string } = {
    sm: '500px',
    md: '850px',
    lg: '1150px',
    xl: '1300px',
  };

  private destroy$ = new Subject<void>();

  private readonly snackBarSubscription: Subscription = new Subscription();

  public dialog<T>(
    component: ComponentType<T> | TemplateRef<T>,
    moduleRef: NgModuleRef<any>,
    data: DialogData = {},
    _config: DialogConfig = {}
  ): MatDialogRef<DialogComponent, any> {
    const width = this.matDialogWidths[(_config.widthSize as DialogWidth) || 'md'];

    const config: MatDialogConfig = {
      disableClose: true,
      height: 'auto',
      width,
      ..._config,
      data: { component, moduleRef, data },
    };

    return this.matDialog.open(DialogComponent, config);
  }

  public openDialog(
    dialogComponent: any,
    dialogData?: DialogData,
    afterCloseCallback?: (response: any) => void,
    dialogOptions?: { disableClose?: boolean; widthSize?: 'sm' | 'md' | 'lg' | 'xl' }
  ): void {
    const defaultOptions: DialogConfig = {
      disableClose: true,
      widthSize: 'md',
    };

    const finalOptions: DialogConfig = { ...defaultOptions, ...dialogOptions };

    const width = this.matDialogWidths[finalOptions.widthSize as DialogWidth] || this.matDialogWidths['md'];

    const dialogConfig: MatDialogConfig = {
      disableClose: finalOptions.disableClose,
      width: width,
      height: 'auto',
      data: dialogData || {},
    };

    const dialogRef: MatDialogRef<any> = this.matDialog.open(dialogComponent, dialogConfig);

    if (afterCloseCallback) {
      dialogRef
        .afterClosed()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              afterCloseCallback(response);
            }
          },
          error: (err) => {
            console.error('Error:', err);
          },
        });
    }
  }

  public prompt(
    title: string,
    message: string,
    acceptBtnText = 'Yes',
    rejectBtnText = 'No',
    onlyCancel = false,
    rejectBtn = false,
    _width = 'sm'
  ): MatDialogRef<PromptDialogComponent> {
    const config: MatDialogConfig = {
      data: {
        title,
        message,
        acceptBtnText,
        rejectBtnText,
        onlyCancel,
        rejectBtn,
      },
      height: 'auto',
      width: _width ? _width : this.matDialogWidths['md'],
    };

    return this.matDialog.open(PromptDialogComponent, config);
  }

  public openPromptDialog(
    promptTitleKey: string,
    promptMessageKey: string,
    confirmButtonTextKey: string,
    cancelButtonTextKey: string,
    actionToExecute: (data: any) => Observable<any>,
    rowData: any,
    postActionCallback?: () => void
  ): void {
    this.prompt(promptTitleKey, promptMessageKey, confirmButtonTextKey, cancelButtonTextKey, false, true)
      .afterClosed()
      .subscribe((result: any) => {
        if (result) {
          actionToExecute(rowData)
            .pipe()
            .subscribe({
              next: (response) => {
                this.snackBar(response.message);
                if (postActionCallback) {
                  postActionCallback();
                }
              },
              error: (error) => {
                this.snackBar(error.error.message);
              },
            });
        }
      });
  }

  public snackBar(
    message: string,
    duration: number = environment.SNACKBAR_MESSAGE_DURATION || 5000,
    action: string = '',
    callback: any = null,
    horizontalPosition: MatSnackBarHorizontalPosition = 'center',
    verticalPosition: MatSnackBarVerticalPosition = 'top'
  ): void {
    this.snackBarSubscription.add(
      this.translate.get(message).subscribe((values) => {
        const snackBarRef = this.matSnackbar.open(values, action, {
          duration,
          horizontalPosition,
          verticalPosition,
          panelClass: ['multiline-snackbar'],
        });
        if (callback) {
          callback(snackBarRef);
        }
      })
    );
  }

  public ngOnDestroy(): void {
    this.snackBarSubscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  public unknownError(): void {
    this.snackBar('ERROR_OCCURRED_TRY_AGAIN');
  }

  public snackBarMessage(entity: string, action: string): void {
    this.snackBar(`${entity} ${action} successfully.`);
  }
}
