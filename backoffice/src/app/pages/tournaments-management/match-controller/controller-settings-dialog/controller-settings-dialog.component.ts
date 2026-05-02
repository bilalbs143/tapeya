import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import type { GraphicTheme, MatchGraphicSession } from 'src/app/services/match-graphic.service';
import { MatchGraphicService } from 'src/app/services/match-graphic.service';
import { MessageService } from 'src/app/services/message.service';
import type { TournamentMatchRow } from 'src/app/services/tournament-matches.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { environment } from 'src/environments/environment';

export interface ControllerSettingsDialogData {
  matchId: number;
  match: TournamentMatchRow;
  session: MatchGraphicSession;
  themes: GraphicTheme[];
}

@Component({
  selector: 'app-controller-settings-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
    DialogWrapperComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './controller-settings-dialog.component.html',
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

  public readonly form = this.fb.nonNullable.group({
    graphic_theme_id: [this.data.session.graphic_theme_id, Validators.required],
    home_text: ['#ffffff'],
    home_bg: ['#0d3320'],
    away_text: ['#ffffff'],
    away_bg: ['#4a0e0e'],
    enable_images: [false],
  });

  /** Reactive theme-id value for computing the overlay URL. */
  private readonly selectedThemeId = toSignal(
    this.form.controls.graphic_theme_id.valueChanges,
    { initialValue: this.data.session.graphic_theme_id },
  );

  /** Overlay URL — updates live as the theme selection changes. */
  public readonly overlayUrl = computed(() => {
    const themeId = this.selectedThemeId();
    const theme = this.data.themes.find((t) => t.id === themeId);
    if (!theme) {
      return null;
    }
    const base = environment.appUrl.replace(/\/$/, '');
    return `${base}/overlay/${this.data.matchId}?theme=${theme.slug}`;
  });

  constructor() {
    const cfg = (this.data.session.config ?? {}) as {
      teams?: {
        home?: { text_color?: string; bg_color?: string };
        away?: { text_color?: string; bg_color?: string };
      };
      enable_images?: boolean;
    };
    this.form.patchValue({
      home_text: cfg.teams?.home?.text_color ?? '#ffffff',
      home_bg: cfg.teams?.home?.bg_color ?? '#0d3320',
      away_text: cfg.teams?.away?.text_color ?? '#ffffff',
      away_bg: cfg.teams?.away?.bg_color ?? '#4a0e0e',
      enable_images: Boolean(cfg.enable_images),
    });
  }

  public copyOverlayUrl(): void {
    const url = this.overlayUrl();
    if (!url) {
      return;
    }
    void navigator.clipboard.writeText(url).then(() => {
      this.urlCopied = true;
      this.snackBar.open('Overlay URL Copied', undefined, { duration: 2000 });
      setTimeout(() => (this.urlCopied = false), 2500);
    });
  }

  public save(): void {
    if (this.form.invalid || this.saving) {
      return;
    }
    const v = this.form.getRawValue();
    const config: Record<string, unknown> = {
      teams: {
        home: { text_color: v.home_text, bg_color: v.home_bg },
        away: { text_color: v.away_text, bg_color: v.away_bg },
      },
      enable_images: v.enable_images,
    };

    this.saving = true;
    this.matchGraphicService
      .updateSession(this.data.matchId, {
        graphic_theme_id: v.graphic_theme_id,
        config,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.dialogRef.close(true);
        },
        error: (err: unknown) => {
          this.saving = false;
          this.messageService.httpError(err);
        },
      });
  }
}
