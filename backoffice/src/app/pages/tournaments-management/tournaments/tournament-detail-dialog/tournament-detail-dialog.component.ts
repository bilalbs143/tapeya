import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/list';
import { TablerIconsModule } from 'angular-tabler-icons';

import type { Tournament } from 'src/app/services/tournaments.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { getStatusClass } from 'src/app/utils/status-class.util';

export interface TournamentDetailDialogData {
  tournament: Tournament;
}

@Component({
  selector: 'app-tournament-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatDivider, TablerIconsModule, DialogWrapperComponent],
  templateUrl: './tournament-detail-dialog.component.html',
})
export class TournamentDetailDialogComponent {
  public readonly data = inject<TournamentDetailDialogData>(MAT_DIALOG_DATA);

  public readonly tournament = this.data.tournament;
  public readonly emptyCell = EMPTY_CELL;
  public readonly statusClass = getStatusClass;
}
