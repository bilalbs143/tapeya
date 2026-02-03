import { HttpParams } from '@angular/common/http';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';
import { finalize, Observable } from 'rxjs';

import { NGX_EDITOR_TOOLBAR } from '../../../shared/constants/constants';
import { titleToSnakeCase } from '../../../shared/functions/core.function';
import { AnnouncementsManagementService } from '../../../shared/services/announcements-management.service';
import { MessageService } from '../../../shared/services/message.service';
import { TemplatesManagementService } from '../../../shared/services/templates-management.service';

@Component({
  selector: 'app-prompt-dialog',
  templateUrl: './manage-announcements-dialog.component.html',
  standalone: false,
})
export class ManageAnnouncementsDialogComponent implements OnInit, OnDestroy {
  data = inject(MAT_DIALOG_DATA);
  private announcementsManagementService = inject(AnnouncementsManagementService);
  private templatesManagementService = inject(TemplatesManagementService);
  private messageService = inject(MessageService);
  private dialogRef = inject<MatDialogRef<ManageAnnouncementsDialogComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);

  public editor: Editor;
  public toolbar: Toolbar = NGX_EDITOR_TOOLBAR;
  public form: FormGroup;
  public isSubmitting: boolean = false;
  public categories: Array<any> = [];
  public templates: Array<any> = [];

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.editor = new Editor();
    this.getAllCategories();
    this.getTemplates();
    this.initializeForm();

    this.form.get('template')?.valueChanges.subscribe((templateId) => {
      if (templateId) {
        const selectedTemplate = this.templates.find((template) => template.id === templateId);
        if (selectedTemplate) {
          this.form.patchValue({
            title: selectedTemplate.title,
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
      category: [titleToSnakeCase(this.data.record.category), [Validators.required]],
      template: [''],
      title: [this.data.record.title, [Validators.required]],
      content: [this.data.record.content || ' ', [Validators.required]],
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
        ? (): Observable<any> => this.announcementsManagementService.update(formValue, this.data.record.id)
        : (): Observable<any> => this.announcementsManagementService.create(formValue);

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

  private getAllCategories(): void {
    this.announcementsManagementService.categories().subscribe({
      next: (response) => {
        this.categories =
          Object.entries(response.data).map(([key, value]) => ({
            key,
            value,
          })) || [];
      },
      error: (error) => {
        console.error('Error:', error);
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
