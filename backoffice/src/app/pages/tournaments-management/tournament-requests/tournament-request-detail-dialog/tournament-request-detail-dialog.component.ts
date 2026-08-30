import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TablerIconsModule } from 'angular-tabler-icons';

import { MaterialModule } from 'src/app/material.module';
import type { EnumOption } from 'src/app/services/enums.service';
import { EnumsService } from 'src/app/services/enums.service';
import type { TournamentRequest } from 'src/app/services/tournament-request.service';
import { TournamentRequestService } from 'src/app/services/tournament-request.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';

export interface TournamentRequestDetailDialogData {
  tournamentRequest: TournamentRequest;
}

@Component({
  selector: 'app-tournament-request-detail-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, CommonSharedModule, TablerIconsModule],
  templateUrl: './tournament-request-detail-dialog.component.html',
})
export class TournamentRequestDetailDialogComponent implements OnInit {
  public readonly data = inject<TournamentRequestDetailDialogData>(MAT_DIALOG_DATA);
  private readonly tournamentRequestService = inject(TournamentRequestService);
  private readonly enumsService = inject(EnumsService);

  public tournamentRequest: TournamentRequest | null = null;
  public isLoading = true;
  public readonly emptyCell = EMPTY_CELL;
  public groupModeOptions: EnumOption[] = [];

  public get groupModeLabel(): string {
    const n = this.tournamentRequest?.number_of_groups ?? 1;
    const value = n === 1 ? 'open' : 'group_wise';
    const opt = this.groupModeOptions.find((o) => o.value === value);
    return opt?.label ?? (n === 1 ? 'Open Group' : 'Group Wise');
  }

  public ngOnInit(): void {
    this.enumsService.getOptions('group_mode').subscribe((opts) => (this.groupModeOptions = opts));
    this.tournamentRequestService.getById(this.data.tournamentRequest.id).subscribe({
      next: (res) => {
        this.tournamentRequest = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.tournamentRequest = this.data.tournamentRequest;
        this.isLoading = false;
      },
    });
  }
}
