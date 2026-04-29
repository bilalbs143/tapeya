import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { forkJoin, Subscription } from 'rxjs';

import { MessageService } from 'src/app/services/message.service';
import { TournamentTeamsService, type TournamentTeamRow } from 'src/app/services/tournament-teams.service';
import { TournamentsService, type Tournament } from 'src/app/services/tournaments.service';
import { TableWrapperComponent } from 'src/app/shared/components/table-wrapper/table-wrapper.component';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';

import { AttachTournamentTeamsDialogComponent } from './attach-tournament-teams-dialog/attach-tournament-teams-dialog.component';
import { EditTournamentTeamGroupDialogComponent } from './edit-tournament-team-group-dialog/edit-tournament-team-group-dialog.component';

@Component({
  selector: 'app-tournament-teams-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TablerIconsModule,
    RouterLink,
    TableWrapperComponent,
  ],
  templateUrl: './tournament-teams-tab.component.html',
})
export class TournamentTeamsTabComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly teamsService = inject(TournamentTeamsService);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly messageService = inject(MessageService);
  private readonly sub = new Subscription();

  public teams: TournamentTeamRow[] = [];
  public tournament: Tournament | null = null;
  public isLoading = true;
  public readonly emptyCell = EMPTY_CELL;
  public readonly columns = ['name', 'sponsor', 'group', 'actions'] as const;

  public tournamentId = 0;

  public get numberOfGroups(): number {
    return this.tournament?.number_of_groups != null && this.tournament.number_of_groups > 0
      ? this.tournament.number_of_groups
      : 1;
  }

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
    forkJoin({
      tournament: this.tournamentsService.getById(this.tournamentId),
      teams: this.teamsService.listTeams(this.tournamentId),
    }).subscribe({
      next: ({ tournament, teams }) => {
        this.tournament = tournament.data ?? null;
        this.teams = teams.data ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Could not load tournament teams.');
      },
    });
  }

  public openAttachTeams(): void {
    this.messageService.openDialog<AttachTournamentTeamsDialogComponent, boolean>(
      AttachTournamentTeamsDialogComponent,
      {
        tournamentId: this.tournamentId,
        numberOfGroups: this.numberOfGroups,
        attachedTeamIds: this.teams.map((t) => t.id),
      },
      (saved) => saved && this.load(),
      { widthSize: 'sm', disableClose: true }
    );
  }

  public openEditGroup(team: TournamentTeamRow): void {
    this.messageService.openDialog<EditTournamentTeamGroupDialogComponent, boolean>(
      EditTournamentTeamGroupDialogComponent,
      {
        tournamentId: this.tournamentId,
        teamId: team.id,
        teamName: team.name,
        numberOfGroups: this.numberOfGroups,
        currentGroup: team.group_index ?? null,
      },
      (saved) => saved && this.load(),
      { widthSize: 'sm', disableClose: true }
    );
  }

  public confirmDetachTeam(team: TournamentTeamRow): void {
    this.sub.add(
      this.messageService
        .prompt(
          'Remove team from tournament?',
          `Detach "${team.name}" from this tournament? Scheduled or started matches involving this team must be cleared first.`,
          'Remove',
          'Cancel'
        )
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.teamsService.detachTeam(this.tournamentId, team.id).subscribe({
              next: () => {
                this.messageService.success('Team removed from tournament.');
                this.load();
              },
              error: () =>
                this.messageService.error('Could not remove team. Check matches and toss status.'),
            });
          }
        })
    );
  }
}
