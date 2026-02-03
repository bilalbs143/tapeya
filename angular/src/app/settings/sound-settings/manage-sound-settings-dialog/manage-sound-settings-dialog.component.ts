import { HttpParams } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize, Observable } from 'rxjs';

import { MessageService } from '../../../shared/services/message.service';
import { SoundSettingsService } from '../../../shared/services/sound-settings.service';
import { SoundsManagementService } from '../../../shared/services/sounds-management.service';

@Component({
  selector: 'app-prompt-dialog',
  templateUrl: './manage-sound-settings-dialog.component.html',
  standalone: false,
})
export class ManageSoundSettingsDialogComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  private soundSettingsService = inject(SoundSettingsService);
  private soundsManagementService = inject(SoundsManagementService);
  private messageService = inject(MessageService);
  private dialogRef = inject<MatDialogRef<ManageSoundSettingsDialogComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);

  public types: Array<any> = [];
  public form: FormGroup;
  public isSubmitting: boolean = false;
  public sounds: Array<any>;

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.getAllTypes();
    this.getAllSounds();
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      type: [Object.keys(this.types).find((key: any) => this.types[key] === this.data.record.type), [Validators.required]],
      sound_id: [this.data.record.sound_id, [Validators.required]],
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.form.value;
    const action = this.data.action;

    const serviceMethod =
      action === 'UPDATE'
        ? (): Observable<any> => this.soundSettingsService.update(formData, this.data.record.id)
        : (): Observable<any> => this.soundSettingsService.create(formData);

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

  private getAllTypes(): void {
    this.soundSettingsService.types().subscribe({
      next: (response) => {
        this.types =
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

  private getAllSounds(): void {
    const requestParams = new HttpParams().set('all', true);
    this.soundsManagementService.get(requestParams).subscribe({
      next: (response) => {
        this.sounds = response.data || [];
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }
}
