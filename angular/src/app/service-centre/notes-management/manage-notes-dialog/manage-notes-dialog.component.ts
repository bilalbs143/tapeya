import { HttpParams } from '@angular/common/http';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';
import { finalize } from 'rxjs';

import { NGX_EDITOR_TOOLBAR } from '../../../shared/constants/constants';
import { titleToSnakeCase } from '../../../shared/functions/core.function';
import { AgentsManagementService } from '../../../shared/services/agents-management.service';
import { MessageService } from '../../../shared/services/message.service';
import { NotesManagementService } from '../../../shared/services/notes-management.service';
import { TemplatesManagementService } from '../../../shared/services/templates-management.service';

@Component({
  selector: 'app-manage-notes-dialog',
  templateUrl: './manage-notes-dialog.component.html',
  standalone: false,
})
export class ManageNotesDialogComponent implements OnInit, OnDestroy {
  data = inject(MAT_DIALOG_DATA);
  private notesManagementService = inject(NotesManagementService);
  private templatesManagementService = inject(TemplatesManagementService);
  private agentsManagementService = inject(AgentsManagementService);
  private messageService = inject(MessageService);
  private dialogRef = inject<MatDialogRef<ManageNotesDialogComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);

  public editor: Editor;
  public toolbar: Toolbar = NGX_EDITOR_TOOLBAR;
  public form: FormGroup;
  public isSubmitting: boolean = false;
  public categories: Array<any> = [];
  public templates: Array<any> = [];
  public agents: Array<any> = [];

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.editor = new Editor();
    this.initializeForm();
    this.getAllCategories();
    this.getAllAgents();
    this.getTemplates();

    console.log('Notes Dialog - Initial data:', this.data);
    console.log('Notes Dialog - Form initialized:', this.form.value);

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
      agent_id: [this.data.record?.agent_id || '', [Validators.required]],
      category: [this.data.record?.category ? titleToSnakeCase(this.data.record.category) : '', [Validators.required]],
      template: [''],
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
    this.notesManagementService
      .create(this.form.value)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Notes Dialog - Success response:', response);
          this.messageService.snackBar(response.message);
          this.form.reset();
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Notes Dialog - Error:', error);
          this.messageService.snackBar(error.error.message);
        },
      });
  }

  private getAllCategories(): void {
    this.notesManagementService.categories().subscribe({
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

  public getAllAgents(): void {
    const requestParams = new HttpParams().set('all', true);
    this.agentsManagementService.get(requestParams).subscribe({
      next: (response) => {
        this.agents = response.data || [];
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }

  private getTemplates(): void {
    const requestParams = new HttpParams().set('filter[type]', 'notes').set('all', true);
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
