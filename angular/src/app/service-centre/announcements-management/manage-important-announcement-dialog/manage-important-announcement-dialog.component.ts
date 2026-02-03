import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize, Observable } from 'rxjs';

import { AnnouncementsManagementService } from '../../../shared/services/announcements-management.service';
import { MessageService } from '../../../shared/services/message.service';

@Component({
  selector: 'app-manage-important-announcement-dialog',
  templateUrl: './manage-important-announcement-dialog.component.html',
  standalone: false,
})
export class ManageImportantAnnouncementDialogComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  private announcementsManagementService = inject(AnnouncementsManagementService);
  private messageService = inject(MessageService);
  private dialogRef = inject<MatDialogRef<ManageImportantAnnouncementDialogComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);

  public form: FormGroup;
  public isSubmitting: boolean = false;
  public isLoading: boolean = false;
  public currentImportantAnnouncement: any = null;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.initializeForm();
    this.loadImportantAnnouncement();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      content: ['', [Validators.required]],
    });
  }

  private loadImportantAnnouncement(): void {
    this.isLoading = true;
    this.announcementsManagementService
      .getImportantAnnouncement()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.currentImportantAnnouncement = response.data;
          if (this.currentImportantAnnouncement) {
            this.form.patchValue({
              content: this.currentImportantAnnouncement.content || '',
            });
          }
        },
        error: (error) => {
          console.error('Error loading important announcement:', error);
        },
      });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.form.value;

    // Prepare the data for the API
    const announcementData = {
      is_important: true,
      content: formValue.content,
      is_active: true,
    };

    // If we have an existing important announcement, update it; otherwise create new
    const serviceMethod = this.currentImportantAnnouncement
      ? (): Observable<any> => this.announcementsManagementService.update(announcementData, this.currentImportantAnnouncement.id)
      : (): Observable<any> => this.announcementsManagementService.create(announcementData);

    serviceMethod()
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.messageService.snackBar(response.message || 'Important announcement saved successfully');
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.messageService.snackBar(error.error?.message || 'Error saving important announcement');
        },
      });
  }
}
