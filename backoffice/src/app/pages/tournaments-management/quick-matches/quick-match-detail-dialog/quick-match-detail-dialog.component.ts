import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { TablerIconsModule } from 'angular-tabler-icons';

import { MessageService } from 'src/app/services/message.service';
import {
  QuickMatchesService,
  type QuickMatchPlayer,
  type QuickMatchRow,
  type QuickMatchSide,
} from 'src/app/services/quick-matches.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { LoaderBlockComponent } from 'src/app/shared/components/loader/loader-block.component';
import { SubmitButtonComponent } from 'src/app/shared/components/submit-button/submit-button.component';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { getStatusClass } from 'src/app/utils/status-class.util';
import { environment } from 'src/environments/environment';

export interface QuickMatchDetailDialogData {
  matchId: number;
}

@Component({
  selector: 'app-quick-match-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatDivider,
    TablerIconsModule,
    DialogWrapperComponent,
    SubmitButtonComponent,
    LoaderBlockComponent,
  ],
  templateUrl: './quick-match-detail-dialog.component.html',
})
export class QuickMatchDetailDialogComponent implements OnInit {
  public readonly data = inject<QuickMatchDetailDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<QuickMatchDetailDialogComponent, boolean>);
  private readonly quickMatches = inject(QuickMatchesService);
  private readonly messageService = inject(MessageService);

  public match: QuickMatchRow | null = null;
  public isLoading = true;
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusClass = getStatusClass;

  public ngOnInit(): void {
    this.reload();
  }

  public get scorecardUrl(): string {
    if (!this.match) return '';
    return `${environment.appUrl.replace(/\/$/, '')}/scorecard/match/${this.match.id}`;
  }

  public get canCancel(): boolean {
    const status = this.match?.status;
    return status != null && status !== 'completed' && status !== 'cancelled';
  }

  public openScorecard(): void {
    const url = this.scorecardUrl;
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  public playerLabel(player: QuickMatchPlayer): string {
    return player.name || player.nickname || `Player ${player.id}`;
  }

  public sidePlayers(side: QuickMatchSide | null): QuickMatchPlayer[] {
    return side?.players ?? [];
  }

  public cancelMatch(): void {
    if (!this.match || !this.canCancel) return;
    this.messageService.openPromptDialog(
      'Cancel Quick Match?',
      'This cancels the match for abuse or safety. Teams and players are kept.',
      'Cancel Match',
      'Keep',
      () => this.quickMatches.cancel(this.match!.id),
      this.match,
      () => {
        this.dialogRef.close(true);
      }
    );
  }

  private reload(): void {
    this.isLoading = true;
    this.quickMatches.getById(this.data.matchId).subscribe({
      next: (res) => {
        this.match = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load quick match.');
      },
    });
  }
}
