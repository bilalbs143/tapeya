import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Subscription } from 'rxjs';

import { MessageService } from 'src/app/services/message.service';
import { TournamentTeamsService, type TournamentTeamRow } from 'src/app/services/tournament-teams.service';
import { TableWrapperComponent } from 'src/app/shared/components/table-wrapper/table-wrapper.component';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';

import { ManageTeamSquadDialogComponent } from './manage-team-squad-dialog/manage-team-squad-dialog.component';

@Component({
  selector: 'app-tournament-squads-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TablerIconsModule,
    RouterLink,
    TableWrapperComponent,
  ],
  templateUrl: './tournament-squads-tab.component.html',
})
export class TournamentSquadsTabComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly teamsService = inject(TournamentTeamsService);
  private readonly messageService = inject(MessageService);
  private readonly sub = new Subscription();

  public teams: TournamentTeamRow[] = [];
  public isLoading = true;
  public readonly emptyCell = EMPTY_CELL;
  public readonly columns = ['name', 'sponsor', 'group', 'actions'] as const;

  public tournamentId = 0;

  public ngOnInit(): void {
    this.sub.add(
      this.route.parent!.paramMap.subscribe((params) => {
        const id = params.get('tournamentId');
        if (!id) {
          return;
        }
        this.tournamentId = Number(id);
        this.load();
      })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private load(): void {
    this.isLoading = true;
    this.teamsService.listTeams(this.tournamentId).subscribe({
      next: (teams) => {
        this.teams = teams.data ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Could not load teams.');
      },
    });
  }

  public openTeamSquad(team: TournamentTeamRow): void {
    this.messageService.openDialog<ManageTeamSquadDialogComponent, boolean>(
      ManageTeamSquadDialogComponent,
      { tournamentId: this.tournamentId, team },
      (saved) => saved && this.load(),
      { widthSize: 'sm', disableClose: true }
    );
  }
}
