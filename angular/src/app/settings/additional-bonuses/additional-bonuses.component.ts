import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import { MessageService } from '../../shared/services/message.service';
import { SystemSettingsService } from '../../shared/services/system-settings.service';

interface SystemSetting {
  group: string;
  key: string;
  value: any;
  type: string;
  field_type: string;
  values?: string[];
}

@Component({
  selector: 'app-additional-bonuses',
  templateUrl: './additional-bonuses.component.html',
  standalone: false,
})
export class AdditionalBonusesComponent implements OnInit {
  private systemSettingsService = inject(SystemSettingsService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  public form: FormGroup;
  public isLoading: boolean = true;
  public isSubmitting: boolean = false;
  public submittingSettings: { [key: string]: boolean } = {};
  public settings: SystemSetting[] = [];
  public groupedSettings: { [group: string]: SystemSetting[] } = {};

  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.createForm();
    this.loadSettings();
  }

  private createForm(): void {
    this.form = this.fb.group({});
  }

  private loadSettings(): void {
    this.isLoading = true;
    this.systemSettingsService
      .getAll()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          // Exclude: bank_info_for_quick_inquiry, default_currency, auto_approval_enabled, tracking_html_code, live_chat_html_code
          this.settings = (response.data || []).filter(
            (setting: SystemSetting) =>
              setting.key !== 'bank_info_for_quick_inquiry' && 
              setting.key !== 'default_currency' && 
              setting.key !== 'auto_approval_enabled' &&
              setting.key !== 'tracking_html_code' &&
              setting.key !== 'live_chat_html_code'
          );
          this.groupSettings();
          this.buildForm();
        },
        error: (error) => {
          this.messageService.snackBar(error.error?.message || 'Failed to load settings');
        },
      });
  }

  private groupSettings(): void {
    this.groupedSettings = {};
    this.settings.forEach((setting) => {
      if (!this.groupedSettings[setting.group]) {
        this.groupedSettings[setting.group] = [];
      }
      this.groupedSettings[setting.group].push(setting);
    });
  }

  private buildForm(): void {
    this.settings.forEach((setting) => {
      const validators = [];
      // Boolean settings don't need validators, they always have a value (true/false)
      if (setting.type !== 'boolean') {
        if (setting.field_type === 'number') {
          validators.push(Validators.required);
        } else {
          validators.push(Validators.required);
        }
      }
      this.form.addControl(setting.key, this.fb.control(setting.value, validators));
    });
  }

  public getGroupKeys(): string[] {
    return Object.keys(this.groupedSettings);
  }

  public getSettingsByGroup(group: string): SystemSetting[] {
    return this.groupedSettings[group] || [];
  }

  public isDropdown(setting: SystemSetting): boolean {
    return setting.field_type === 'dropdown';
  }

  public isNumber(setting: SystemSetting): boolean {
    return setting.field_type === 'number';
  }

  public isBoolean(setting: SystemSetting): boolean {
    return setting.type === 'boolean';
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    // Exclude boolean settings as they auto-save on toggle
    const nonBooleanSettings = this.settings.filter((setting) => !this.isBoolean(setting));
    const updateObservables = nonBooleanSettings.map((setting) => {
      const formValue = this.form.value[setting.key];
      return this.systemSettingsService.update({ value: formValue }, setting.key);
    });

    if (updateObservables.length === 0) {
      this.isSubmitting = false;
      return;
    }

    forkJoin(updateObservables)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: () => {
          this.messageService.snackBar('Settings updated successfully');
          this.loadSettings();
        },
        error: (error) => {
          this.messageService.snackBar(error.error?.message || 'Failed to update settings');
        },
      });
  }

  public onSubmitSetting(setting: SystemSetting): void {
    if (this.form.controls[setting.key].invalid) {
      this.form.controls[setting.key].markAsTouched();
      return;
    }

    this.submittingSettings[setting.key] = true;
    const formValue = this.form.value[setting.key];

    this.systemSettingsService
      .update({ value: formValue }, setting.key)
      .pipe(
        finalize(() => {
          this.submittingSettings[setting.key] = false;
        })
      )
      .subscribe({
        next: () => {
          this.messageService.snackBar('Setting updated successfully');
        },
        error: (error) => {
          this.messageService.snackBar(error.error?.message || 'Failed to update setting');
        },
      });
  }

  public onToggleBoolean(setting: SystemSetting, event: any): void {
    const newValue = event.checked;
    this.form.controls[setting.key].setValue(newValue);

    this.submittingSettings[setting.key] = true;
    this.systemSettingsService
      .update({ value: newValue }, setting.key)
      .pipe(
        finalize(() => {
          this.submittingSettings[setting.key] = false;
        })
      )
      .subscribe({
        next: () => {
          this.messageService.snackBar('Setting updated successfully');
        },
        error: (error) => {
          // Revert the toggle on error
          this.form.controls[setting.key].setValue(!newValue);
          this.messageService.snackBar(error.error?.message || 'Failed to update setting');
        },
      });
  }
}
