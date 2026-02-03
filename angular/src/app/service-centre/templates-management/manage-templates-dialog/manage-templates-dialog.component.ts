import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';
import { finalize, Observable } from 'rxjs';

import { NGX_EDITOR_TOOLBAR } from '../../../shared/constants/constants';
import { titleToSnakeCase } from '../../../shared/functions/core.function';
import { MessageService } from '../../../shared/services/message.service';
import { TemplatesManagementService } from '../../../shared/services/templates-management.service';

@Component({
  selector: 'app-manage-templates-dialog',
  templateUrl: './manage-templates-dialog.component.html',
  standalone: false,
})
export class ManageTemplatesDialogComponent implements OnInit, OnDestroy {
  data = inject(MAT_DIALOG_DATA);
  private templatesManagementService = inject(TemplatesManagementService);
  private messageService = inject(MessageService);
  private dialogRef = inject<MatDialogRef<ManageTemplatesDialogComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);

  public editor: Editor;
  public toolbar: Toolbar = NGX_EDITOR_TOOLBAR;
  public form: FormGroup;
  public isSubmitting: boolean = false;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.editor = new Editor();
    this.initializeForm();
  }

  public ngOnDestroy(): void {
    this.editor.destroy();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      type: [this.data.record?.type ? titleToSnakeCase(this.data.record.type) : '', [Validators.required]],
      title: [this.data.record?.title || '', [Validators.required]],
      content: [this.data.record?.content || ' ', [Validators.required]],
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const action = this.data.action;
    const formValue = this.form.value;

    const serviceMethod =
      action === 'UPDATE'
        ? (): Observable<any> => this.templatesManagementService.update(formValue, this.data.record.id)
        : (): Observable<any> => this.templatesManagementService.create(formValue);

    serviceMethod()
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.messageService.snackBar(response.message);
          this.form.reset();
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.messageService.snackBar(error.error.message);
        },
      });
  }
}
