import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';

import { MaterialModule } from 'src/app/material.module';
import { EnumsService } from 'src/app/services/enums.service';
import { MessageService } from 'src/app/services/message.service';
import { SystemSettingService, type SystemSetting } from 'src/app/services/system-setting.service';
import { LoaderBlockComponent } from 'src/app/shared/components/loader/loader-block.component';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [FormsModule, MaterialModule, TablerIconsModule, LoaderBlockComponent],
  templateUrl: './system-settings.component.html',
})
export class SystemSettingsComponent implements OnInit {
  private readonly systemSettingService = inject(SystemSettingService);
  private readonly enumsService = inject(EnumsService);
  private readonly messageService = inject(MessageService);

  private groupOrder: string[] = [];
  private groupLabelByValue: Record<string, string> = {};

  public isLoading = false;

  public settings: SystemSetting[] = [];
  public drafts: Record<string, string | number | null> = {};
  public originals: Record<string, string> = {};
  public saving: Record<string, boolean> = {};

  protected secretShown: Record<string, boolean> = {};

  protected readonly dropdownPlaceholder = 'Select an Option';

  public ngOnInit(): void {
    this.load();
  }

  public load(): void {
    this.isLoading = true;
    this.enumsService.getOptions('system_setting_group').subscribe({
      next: (opts) => {
        this.groupOrder = opts.map((o) => o.value);
        this.groupLabelByValue = Object.fromEntries(opts.map((o) => [o.value, o.label] as const));
        this.fetchSettings();
      },
      error: () => {
        this.groupOrder = [];
        this.groupLabelByValue = {};
        this.fetchSettings();
      },
    });
  }

  private fetchSettings(): void {
    this.systemSettingService.getAll().subscribe({
      next: (res) => {
        this.settings = [...(res.data ?? [])].sort((a, b) => {
          const ga = this.groupOrder.indexOf(a.group);
          const gb = this.groupOrder.indexOf(b.group);
          const oa = ga === -1 ? 999 : ga;
          const ob = gb === -1 ? 999 : gb;
          if (oa !== ob) {
            return oa - ob;
          }
          return a.label.localeCompare(b.label);
        });
        this.drafts = {};
        this.originals = {};
        this.secretShown = {};
        for (const s of this.settings) {
          const v = s.value;
          const asStr = v === null || v === undefined ? '' : String(v);
          if (s.field_type === 'dropdown') {
            this.drafts[s.key] = v === null || v === undefined || v === '' ? null : v;
          } else {
            this.drafts[s.key] = v === null || v === undefined ? '' : v;
          }
          this.originals[s.key] = asStr;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load system settings.');
      },
    });
  }

  public groupsInOrder(): string[] {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const g of this.groupOrder) {
      if (this.settings.some((s) => s.group === g)) {
        ordered.push(g);
        seen.add(g);
      }
    }
    for (const s of this.settings) {
      if (!seen.has(s.group)) {
        ordered.push(s.group);
        seen.add(s.group);
      }
    }
    return ordered;
  }

  public settingsForGroup(group: string): SystemSetting[] {
    return this.settings.filter((s) => s.group === group);
  }

  public groupTitle(group: string): string {
    return this.groupLabelByValue[group] ?? group;
  }

  public inputType(s: SystemSetting): 'text' | 'password' {
    if (s.key.includes('token') || s.key.includes('secret')) {
      return 'password';
    }
    return 'text';
  }

  public isSecretField(s: SystemSetting): boolean {
    return this.inputType(s) === 'password';
  }

  public secretInputType(s: SystemSetting): 'text' | 'password' {
    return this.secretShown[s.key] ? 'text' : 'password';
  }

  public toggleSecretVisibility(key: string): void {
    if (this.secretShown[key]) {
      delete this.secretShown[key];
    } else {
      this.secretShown[key] = true;
    }
  }

  public isDirty(s: SystemSetting): boolean {
    return this.serializeDraft(s) !== this.originals[s.key];
  }

  public save(s: SystemSetting): void {
    const payload = this.coercePayload(s);
    this.saving[s.key] = true;
    this.systemSettingService.patch(s.key, payload).subscribe({
      next: (res) => {
        const updated = res.data;
        const idx = this.settings.findIndex((x) => x.key === s.key);
        if (idx >= 0) {
          this.settings[idx] = updated;
        }
        const v = updated.value;
        const asStr = v === null || v === undefined ? '' : String(v);
        if (updated.field_type === 'dropdown') {
          this.drafts[s.key] = v === null || v === undefined || v === '' ? null : v;
        } else {
          this.drafts[s.key] = v === null || v === undefined ? '' : v;
        }
        this.originals[s.key] = asStr;
        this.saving[s.key] = false;
        if (this.isSecretField(s)) {
          delete this.secretShown[s.key];
        }
      },
      error: () => {
        this.saving[s.key] = false;
        this.messageService.error('Failed to save setting.');
      },
    });
  }

  private serializeDraft(s: SystemSetting): string {
    const raw = this.drafts[s.key];
    if (raw === null || raw === undefined) {
      return '';
    }
    if (s.field_type === 'number') {
      if (raw === '') {
        return '';
      }
      return String(Number(raw));
    }
    return String(raw).trimEnd();
  }

  private coercePayload(s: SystemSetting): string | number | null {
    const raw = this.drafts[s.key];
    if (s.field_type === 'number') {
      if (raw === '' || raw === null || raw === undefined) {
        return null;
      }
      const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
      return Number.isFinite(n) ? n : null;
    }
    if (s.field_type === 'dropdown') {
      if (raw === null || raw === undefined || raw === '') {
        return null;
      }
      const str = String(raw).trim();
      return str === '' ? null : str;
    }
    if (raw === null || raw === undefined) {
      return null;
    }
    const str = String(raw).trim();
    return str === '' ? null : str;
  }
}
