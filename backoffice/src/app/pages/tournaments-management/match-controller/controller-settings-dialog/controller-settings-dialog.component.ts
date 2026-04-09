import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import type { GraphicTheme, MatchGraphicSession } from 'src/app/services/match-graphic.service';
import { MatchGraphicService } from 'src/app/services/match-graphic.service';
import { MessageService } from 'src/app/services/message.service';

export interface ControllerSettingsDialogData {
  matchId: number;
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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './controller-settings-dialog.component.html',
})
export class ControllerSettingsDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ControllerSettingsDialogComponent, boolean>);
  private readonly matchGraphicService = inject(MatchGraphicService);
  private readonly messageService = inject(MessageService);
  public readonly data = inject<ControllerSettingsDialogData>(MAT_DIALOG_DATA);

  public saving = false;

  public readonly form = this.fb.nonNullable.group({
    graphic_theme_id: [this.data.session.graphic_theme_id, Validators.required],
    home_text: ['#ffffff'],
    home_bg: ['#0d3320'],
    away_text: ['#ffffff'],
    away_bg: ['#4a0e0e'],
    enable_images: [false],
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

  public cancel(): void {
    this.dialogRef.close(false);
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
