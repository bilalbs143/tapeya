import { HttpParams } from '@angular/common/http';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';
import { finalize } from 'rxjs';

import { NGX_EDITOR_TOOLBAR } from '../../../shared/constants/constants';
import { CustomerInquiriesService } from '../../../shared/services/customer-inquiries.service';
import { MessageService } from '../../../shared/services/message.service';
import { TemplatesManagementService } from '../../../shared/services/templates-management.service';

@Component({
  selector: 'app-manage-customer-inquiries-dialog',
  templateUrl: './manage-customer-inquiries-dialog.component.html',
  standalone: false,
})
export class ManageCustomerInquiriesDialogComponent implements OnInit, OnDestroy {
  data = inject(MAT_DIALOG_DATA);
  private customerInquiriesService = inject(CustomerInquiriesService);
  private templatesManagementService = inject(TemplatesManagementService);
  private messageService = inject(MessageService);
  private dialogRef = inject<MatDialogRef<ManageCustomerInquiriesDialogComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);

  public editor: Editor;
  public toolbar: Toolbar = NGX_EDITOR_TOOLBAR;
  public form: FormGroup;
  public isSubmitting: boolean = false;
  public templates: Array<any> = [];

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.editor = new Editor();
    this.getTemplates();
    this.initializeForm();

    this.form.get('template')?.valueChanges.subscribe((templateId) => {
      if (templateId) {
        const selectedTemplate = this.templates.find((template) => template.id === templateId);
        if (selectedTemplate) {
          this.form.patchValue({
            content: selectedTemplate.content,
          });
        }
      }
    });
  }

  public ngOnDestroy(): void {
    this.editor.destroy();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      template: [''],
      content: [' ', [Validators.required]],
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.customerInquiriesService
      .reply(this.form.value, this.data.record.id)
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

  private getTemplates(): void {
    const requestParams = new HttpParams().set('filter[type]', 'announcements').set('all', true);
    this.templatesManagementService.get(requestParams).subscribe({
      next: (response) => {
        this.templates = response.data || [];
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }
}
