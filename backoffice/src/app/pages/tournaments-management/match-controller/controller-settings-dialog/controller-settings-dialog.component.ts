import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MaterialModule } from 'src/app/material.module';
import type { GraphicTheme, MatchGraphicSession, ThemeConfigProperty } from 'src/app/services/match-graphic.service';
import { MatchGraphicService } from 'src/app/services/match-graphic.service';
import { MessageService } from 'src/app/services/message.service';
import type { TournamentMatchRow } from 'src/app/services/tournament-matches.service';
import { CommonSharedModule } from 'src/app/shared/common.module';

export interface ControllerSettingsDialogData {
  matchId: number;
  match: TournamentMatchRow;
  session: MatchGraphicSession | null;
  themes: GraphicTheme[];
}

@Component({
  selector: 'app-controller-settings-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule],
  templateUrl: './controller-settings-dialog.component.html',
  styleUrl: './controller-settings-dialog.component.scss',
})
export class ControllerSettingsDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ControllerSettingsDialogComponent, boolean>);
  private readonly matchGraphicService = inject(MatchGraphicService);
  private readonly messageService = inject(MessageService);
  private readonly snackBar = inject(MatSnackBar);
  public readonly data = inject<ControllerSettingsDialogData>(MAT_DIALOG_DATA);

  public saving = false;
  public urlCopied = false;
  private mutated = false;

  /** False until a graphic session exists (on open or after first save). */
  public readonly sessionReady = signal(this.data.session !== null);

  private readonly defaultTheme = this.data.themes.find((t) => t.is_active) ?? this.data.themes[0] ?? null;
  private readonly initialThemeId = this.data.session?.graphic_theme_id ?? this.defaultTheme?.id ?? null;

  public readonly signedGraphicsUrl = signal<string | null>(null);
  public readonly signedLinkLoading = signal(false);
  public readonly signedLinkError = signal(false);

  /** Properties driven by the currently selected theme's config_schema. */
  public readonly schemaProperties = signal<ThemeConfigProperty[]>([]);

  /** Dynamic config form — rebuilt when the selected theme changes. */
  public configForm: FormGroup = this.fb.group({});

  public readonly form = this.fb.nonNullable.group({
    graphic_theme_id: [this.initialThemeId, Validators.required],
  });

  public readonly saveButtonLabel = computed(() => 'Save');
  public readonly dialogTitle = computed(() => 'Graphics Settings');
  public readonly dismissLabel = computed(() => (this.sessionReady() && this.data.session === null ? 'Done' : 'Cancel'));

  constructor() {
    this.rebuildConfigFormForTheme(this.initialThemeId);

    // When the broadcaster switches theme, rebuild the config form for the new schema.
    this.form.controls.graphic_theme_id.valueChanges.subscribe((id) => {
      this.rebuildConfigFormForTheme(id);
    });

    if (this.sessionReady()) {
      this.loadSignedGraphicsUrl();
    }
  }

  /** Show persisted URL without calling the API (each API call rotates the active link). */
  private loadSignedGraphicsUrl(): void {
    const cachedUrl = this.data.session?.signed_overlay_url?.trim();
    if (cachedUrl) {
      this.signedGraphicsUrl.set(cachedUrl);
      return;
    }

    this.fetchSignedGraphicsUrl();
  }

  /** Issue a new signed URL (invalidates any previous link). */
  public refreshSignedGraphicsUrl(autoCopy = false): void {
    this.fetchSignedGraphicsUrl(autoCopy);
  }

  private fetchSignedGraphicsUrl(autoCopy = false): void {
    if (!this.sessionReady()) {
      return;
    }

    this.signedLinkLoading.set(true);
    this.signedLinkError.set(false);
    this.matchGraphicService.getSignedGraphicsUrl(this.data.matchId).subscribe({
      next: (res) => {
        this.signedGraphicsUrl.set(res.data.url);
        this.signedLinkLoading.set(false);
        this.mutated = true;
        this.patchSessionGraphicsUrl(res.data.url, res.data.expires_at);
        if (autoCopy) {
          this.copyUrlToClipboard(res.data.url);
        }
      },
      error: (err: unknown) => {
        this.signedLinkLoading.set(false);
        this.signedLinkError.set(true);
        this.messageService.httpError(err);
      },
    });
  }

  private patchSessionGraphicsUrl(url: string, expiresAt: string): void {
    if (!this.data.session) {
      return;
    }
    this.data.session.signed_overlay_url = url;
    this.data.session.signed_overlay_expires_at = expiresAt;
  }

  /** Resolve a human-readable label for a config property.
   *  Color keys that contain 'home' / 'away' swap in the actual team names. */
  public propertyLabel(prop: ThemeConfigProperty): string {
    const home = this.data.match.home_team?.name ?? 'Home';
    const away = this.data.match.away_team?.name ?? 'Away';

    return prop.label.replace(/\bhome\b/gi, home).replace(/\baway\b/gi, away);
  }

  public closeDialog(): void {
    this.dialogRef.close(this.mutated);
  }

  public copyGraphicsUrl(): void {
    const url = this.signedGraphicsUrl();
    if (!url) {
      return;
    }
    this.copyUrlToClipboard(url);
  }

  private copyUrlToClipboard(url: string): void {
    void navigator.clipboard.writeText(url).then(() => {
      this.urlCopied = true;
      this.snackBar.open('Graphics URL copied', undefined, { duration: 2000 });
      setTimeout(() => (this.urlCopied = false), 2500);
    });
  }

  public save(): void {
    if (this.form.invalid || this.configForm.invalid || this.saving) {
      return;
    }

    const themeId = this.form.getRawValue().graphic_theme_id;
    const configValues = this.configForm.getRawValue() as Record<string, unknown>;

    const body = {
      graphic_theme_id: themeId,
      config: configValues,
    };

    this.saving = true;
    const isFirstSave = !this.sessionReady();
    const request$ = isFirstSave
      ? this.matchGraphicService.createSession(this.data.matchId, body)
      : this.matchGraphicService.updateSession(this.data.matchId, body);

    request$.subscribe({
      next: (res) => {
        this.saving = false;
        this.mutated = true;
        if (isFirstSave) {
          this.data.session = res.data;
          this.sessionReady.set(true);
          const url = res.data.signed_overlay_url?.trim();
          if (url) {
            this.signedGraphicsUrl.set(url);
            this.copyUrlToClipboard(url);
            return;
          }
          this.refreshSignedGraphicsUrl(true);
          return;
        }
        this.dialogRef.close(true);
      },
      error: (err: unknown) => {
        this.saving = false;
        this.messageService.httpError(err);
      },
    });
  }

  // ---------------------------------------------------------------------------

  private rebuildConfigFormForTheme(themeId: number | null): void {
    const theme = this.data.themes.find((t) => t.id === themeId) ?? this.defaultTheme;
    const properties = theme?.config_schema?.properties ?? [];

    const sessionConfig = this.data.session?.config ?? {};
    const themeDefaults = theme?.default_config ?? {};
    // Preserve any values the broadcaster already edited in the current session (before saving).
    const currentValues = this.configForm.getRawValue() as Record<string, unknown>;

    // Build a new FormGroup with one control per schema property
    const controls: Record<string, ReturnType<FormBuilder['control']>> = {};
    for (const prop of properties) {
      // Priority: in-flight unsaved edit → saved session value → theme default → schema default
      const savedValue = currentValues[prop.key] ?? sessionConfig[prop.key] ?? themeDefaults[prop.key] ?? prop.default;
      const validators = prop.type === 'color' ? [Validators.pattern(/^#[0-9a-fA-F]{6}$/)] : [];
      controls[prop.key] = this.fb.control(savedValue, validators);
    }

    this.configForm = this.fb.group(controls);
    this.schemaProperties.set(properties);
  }
}
