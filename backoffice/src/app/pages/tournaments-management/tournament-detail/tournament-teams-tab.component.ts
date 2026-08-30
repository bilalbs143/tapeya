import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { forkJoin, Subscription, EMPTY } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { ManageTeamDialogComponent } from '../teams/manage-team-dialog/manage-team-dialog.component';

import { MessageService } from 'src/app/services/message.service';
import { type TeamRow } from 'src/app/services/teams.service';
import { TournamentTeamsService, type TournamentTeamRow } from 'src/app/services/tournament-teams.service';
import { TournamentsService, type Tournament } from 'src/app/services/tournaments.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';

import { AttachTournamentTeamsDialogComponent } from './attach-tournament-teams-dialog/attach-tournament-teams-dialog.component';
import { EditTournamentTeamGroupDialogComponent } from './edit-tournament-team-group-dialog/edit-tournament-team-group-dialog.component';

@Component({
  selector: 'app-tournament-teams-tab',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatSortModule, MatTooltipModule, TablerIconsModule, CommonSharedModule],
  templateUrl: './tournament-teams-tab.component.html',
})
export class TournamentTeamsTabComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly teamsService = inject(TournamentTeamsService);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly messageService = inject(MessageService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly sub = new Subscription();

  @ViewChild(MatSort)
  public set matSort(sort: MatSort | undefined) {
    if (sort) {
      this.dataSource.sort = sort;
      this.dataSource.data = [...this.dataSource.data];
    }
  }

  @ViewChild(PaginatorComponent)
  public set appPaginator(paginator: PaginatorComponent | undefined) {
    queueMicrotask(() => {
      const mat = paginator?.matPaginator;
      if (mat && this.dataSource.paginator !== mat) {
        this.dataSource.paginator = mat;
      }
    });
  }

  public dataSource = new MatTableDataSource<TournamentTeamRow>([]);
  public tournament: Tournament | null = null;
  public isLoading = true;
  public readonly emptyCell = EMPTY_CELL;
  public readonly columns = ['name', 'sponsor', 'group', 'actions'] as const;
  public readonly pageSizeOptions = this.paginatorConfig.pageSizeOptions;
  public pageSize = this.paginatorConfig.pageSize;
  public pageIndex = 0;

  public tournamentId = 0;

  constructor() {
    this.dataSource.sortingDataAccessor = (row, column) => {
      switch (column) {
        case 'name':
          return row.name ?? '';
        case 'sponsor':
          return row.sponsor?.nickname || row.sponsor?.name || '';
        case 'group':
          return row.group_index ?? Number.MAX_SAFE_INTEGER;
        default:
          return '';
      }
    };
  }

  public get numberOfGroups(): number {
    return this.tournament?.number_of_groups != null && this.tournament.number_of_groups > 0
      ? this.tournament.number_of_groups
      : 1;
  }

  public ngOnInit(): void {
    this.sub.add(
      this.route
        .parent!.paramMap.pipe(
          switchMap((params) => {
            const idRaw = params.get('tournamentId');
            if (!idRaw) {
              return EMPTY;
            }

            const id = Number(idRaw);
            if (!Number.isFinite(id) || id <= 0) {
              return EMPTY;
            }

            this.tournamentId = id;
            this.isLoading = true;

            return forkJoin({
              tournament: this.tournamentsService.getById(id),
              teams: this.teamsService.listTeams(id),
            }).pipe(
              catchError(() => {
                this.isLoading = false;
                return EMPTY;
              })
            );
          })
        )
        .subscribe(({ tournament, teams }) => {
          this.tournament = tournament.data ?? null;
          this.dataSource.data = teams.data ?? [];
          this.pageIndex = 0;
          this.dataSource.paginator?.firstPage();
          this.isLoading = false;
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
        this.dataSource.data = teams.data ?? [];
        this.pageIndex = 0;
        this.dataSource.paginator?.firstPage();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  public openAttachTeams(): void {
    this.messageService.openDialog<AttachTournamentTeamsDialogComponent, boolean>(
      AttachTournamentTeamsDialogComponent,
      {
        tournamentId: this.tournamentId,
        numberOfGroups: this.numberOfGroups,
        numberOfTeams: this.tournament?.number_of_teams ?? null,
        attachedTeamIds: this.dataSource.data.map((t) => t.id),
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

  public openTeamSquad(team: TournamentTeamRow): void {
    void this.router.navigate(['/tournaments-management/tournaments', this.tournamentId, 'teams', team.id, 'squad']);
  }

  public openEditTeam(team: TournamentTeamRow): void {
    this.messageService.openDialog<ManageTeamDialogComponent, boolean>(
      ManageTeamDialogComponent,
      { mode: 'edit', team: this.toTeamRow(team) },
      (saved) => saved && this.load(),
      { widthSize: 'md', disableClose: true }
    );
  }

  /** Seed for ManageTeamDialog — full row is loaded via TeamsService.getById in the dialog. */
  private toTeamRow(row: TournamentTeamRow): TeamRow {
    return {
      id: row.id,
      name: row.name,
      code: row.code ?? '',
      country: row.country ?? '',
      city: row.city ?? '',
      logo: row.logo,
      sponsor_id: row.sponsor?.id ?? 0,
      sponsor: row.sponsor,
      icon_player_ids: [],
    };
  }

  public confirmDetachTeam(team: TournamentTeamRow): void {
    this.sub.add(
      this.messageService
        .prompt(
          'Remove Team from Tournament?',
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
              error: () => this.messageService.error('Could not remove team. Check matches and toss status.'),
            });
          }
        })
    );
  }

  public onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}
