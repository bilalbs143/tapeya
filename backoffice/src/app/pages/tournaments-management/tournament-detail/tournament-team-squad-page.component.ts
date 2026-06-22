import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { EMPTY, Subscription, combineLatest, forkJoin, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';

import {
  ManagePlayerDialogComponent,
  type ManagePlayerDialogResult,
} from 'src/app/pages/players-management/players/manage-player-dialog/manage-player-dialog.component';
import { MessageService } from 'src/app/services/message.service';
import { PlayersService } from 'src/app/services/players.service';
import {
  type SquadOccupancyRow,
  type SquadUser,
  type TournamentTeamRow,
  TournamentTeamsService,
} from 'src/app/services/tournament-teams.service';
import { UsersService } from 'src/app/services/users.service';
import type { User } from 'src/app/services/users.service';
import { TableWrapperComponent } from 'src/app/shared/components/table-wrapper/table-wrapper.component';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';

@Component({
  selector: 'app-tournament-team-squad-page',

  standalone: true,

  imports: [
    CommonModule,

    ReactiveFormsModule,

    MatCardModule,

    MatButtonModule,

    MatFormFieldModule,

    MatInputModule,

    MatAutocompleteModule,

    MatTableModule,

    MatSortModule,

    MatProgressSpinnerModule,

    MatTooltipModule,

    TablerIconsModule,

    TableWrapperComponent,
  ],

  templateUrl: './tournament-team-squad-page.component.html',
})
export class TournamentTeamSquadPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly teamsService = inject(TournamentTeamsService);

  private readonly usersService = inject(UsersService);

  private readonly playersService = inject(PlayersService);

  private readonly messageService = inject(MessageService);

  private readonly sub = new Subscription();

  @ViewChild(MatSort)
  public set matSort(sort: MatSort | undefined) {
    if (sort) {
      this.dataSource.sort = sort;

      this.dataSource.data = [...this.dataSource.data];
    }
  }

  public tournamentId = 0;

  public teamId = 0;

  public team: TournamentTeamRow | null = null;

  public selected: SquadUser[] = [];

  public dataSource = new MatTableDataSource<SquadUser>([]);

  public readonly searchControl = new FormControl('', { nonNullable: true });

  public candidates: SquadUser[] = [];

  public isLoading = true;

  public isSaving = false;

  public readonly emptyCell = EMPTY_CELL;

  public readonly columns = ['name', 'nickname', 'email', 'phone', 'actions'] as const;

  private occupiedByPlayerId = new Map<number, SquadOccupancyRow>();

  private saveQueued = false;

  constructor() {
    this.dataSource.sortingDataAccessor = (row, column) => {
      switch (column) {
        case 'name':
          return row.name ?? '';

        case 'nickname':
          return row.nickname ?? '';

        case 'email':
          return row.email ?? '';

        case 'phone':
          return row.phone ?? '';

        default:
          return '';
      }
    };
  }

  public get visibleCandidates(): SquadUser[] {
    return this.candidates.filter(
      (candidate) => !this.selected.some((player) => player.id === candidate.id) && !this.occupiedByPlayerId.has(candidate.id)
    );
  }

  public ngOnInit(): void {
    const parentRoute = this.route.parent;

    if (!parentRoute) {
      this.isLoading = false;

      this.navigateToTeams();

      return;
    }

    this.sub.add(
      combineLatest([parentRoute.paramMap, this.route.paramMap])
        .pipe(
          switchMap(([parentParams, params]) => {
            const tournamentIdRaw = parentParams.get('tournamentId');

            const teamIdRaw = params.get('teamId');

            if (!tournamentIdRaw || !teamIdRaw) {
              this.isLoading = false;

              this.navigateToTeams();

              return EMPTY;
            }

            const tournamentId = Number(tournamentIdRaw);

            const teamId = Number(teamIdRaw);

            if (!Number.isFinite(tournamentId) || tournamentId <= 0 || !Number.isFinite(teamId) || teamId <= 0) {
              this.isLoading = false;

              this.navigateToTeams();

              return EMPTY;
            }

            this.tournamentId = tournamentId;

            this.teamId = teamId;

            this.isLoading = true;

            this.team = null;

            return forkJoin({
              teams: this.teamsService.listTeams(tournamentId),

              squad: this.teamsService.getTeamSquad(tournamentId, teamId),

              occupancy: this.teamsService

                .getSquadOccupancy(tournamentId, teamId)

                .pipe(catchError(() => of({ data: [] as SquadOccupancyRow[] }))),
            }).pipe(
              catchError(() => {
                this.isLoading = false;

                this.navigateToTeams();

                return EMPTY;
              })
            );
          })
        )

        .subscribe(({ teams, squad, occupancy }) => {
          this.team = (teams.data ?? []).find((row) => row.id === this.teamId) ?? null;

          if (!this.team) {
            this.isLoading = false;

            this.messageService.error('Team not found on this tournament.');

            this.navigateToTeams();

            return;
          }

          this.setSquadPlayers(squad.data ?? []);

          this.occupiedByPlayerId = new Map((occupancy.data ?? []).map((row) => [row.player_id, row]));

          this.isLoading = false;
        })
    );

    this.sub.add(
      this.searchControl.valueChanges

        .pipe(
          debounceTime(250),

          distinctUntilChanged(),

          switchMap((term) =>
            this.usersService

              .adminUserSearch(term ?? '', { for_squad: true })

              .pipe(catchError(() => of({ data: [] as SquadUser[] })))
          )
        )

        .subscribe((res) => {
          this.candidates = res.data ?? [];
        })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private syncFromServer(): void {
    this.sub.add(
      forkJoin({
        squad: this.teamsService.getTeamSquad(this.tournamentId, this.teamId),

        occupancy: this.teamsService

          .getSquadOccupancy(this.tournamentId, this.teamId)

          .pipe(catchError(() => of({ data: [] as SquadOccupancyRow[] }))),
      }).subscribe({
        next: ({ squad, occupancy }) => {
          this.setSquadPlayers(squad.data ?? []);

          this.occupiedByPlayerId = new Map((occupancy.data ?? []).map((row) => [row.player_id, row]));
        },
      })
    );
  }

  private setSquadPlayers(players: SquadUser[]): void {
    this.selected = [...players];

    this.dataSource.data = this.selected;
  }

  private saveSquad(): void {
    if (this.isSaving) {
      this.saveQueued = true;

      return;
    }

    this.runSaveSquad();
  }

  private runSaveSquad(): void {
    this.isSaving = true;

    this.teamsService

      .saveTeamSquad(
        this.tournamentId,

        this.teamId,

        this.selected.map((u) => u.id)
      )

      .pipe(
        finalize(() => {
          this.isSaving = false;

          if (this.saveQueued) {
            this.saveQueued = false;

            this.runSaveSquad();
          }
        })
      )

      .subscribe({
        next: () => this.syncFromServer(),

        error: () => this.syncFromServer(),
      });
  }

  public navigateToTeams(): void {
    const tournamentId = this.tournamentId || Number(this.route.parent?.snapshot.paramMap.get('tournamentId') ?? 0);

    if (tournamentId) {
      void this.router.navigate(['/tournaments-management/tournaments', tournamentId, 'teams']);

      return;
    }

    void this.router.navigate(['/tournaments-management/tournaments']);
  }

  public confirmRemovePlayer(user: SquadUser): void {
    if (this.isSaving) {
      return;
    }

    const playerName = user.name || user.nickname || `Player #${user.id}`;

    const teamName = this.team?.name ?? 'this team';

    this.sub.add(
      this.messageService

        .prompt(
          'Remove from squad?',

          `Remove "${playerName}" from ${teamName}'s squad?`,

          'Remove',

          'Cancel'
        )

        .afterClosed()

        .subscribe((confirmed) => {
          if (!confirmed || this.isSaving) {
            return;
          }

          this.setSquadPlayers(this.selected.filter((u) => u.id !== user.id));

          this.saveSquad();
        })
    );
  }

  private toSquadUser(user: User): SquadUser {
    return {
      id: user.id,

      name: user.name,

      nickname: user.nickname,

      email: user.email,

      phone: user.phone,
    };
  }

  private addPlayerToSquad(user: SquadUser): boolean {
    if (this.isSaving) {
      return false;
    }

    if (!user?.id || this.selected.some((u) => u.id === user.id)) {
      return false;
    }

    const occupied = this.occupiedByPlayerId.get(user.id);

    if (occupied) {
      const playerName = user.name || user.nickname || occupied.player_name;

      this.messageService.error(
        `${playerName} is already on ${occupied.team_name} in this tournament. A player can only be on one team per tournament.`
      );

      return false;
    }

    this.setSquadPlayers([...this.selected, user]);

    this.saveSquad();

    return true;
  }

  public onCandidateSelected(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value as SquadUser;

    const added = this.addPlayerToSquad(user);

    if (added || this.occupiedByPlayerId.has(user.id)) {
      this.searchControl.setValue('', { emitEvent: false });

      this.candidates = [];
    }
  }

  public openCreatePlayer(): void {
    if (this.isSaving) {
      return;
    }

    this.messageService.openDialog<ManagePlayerDialogComponent, ManagePlayerDialogResult>(
      ManagePlayerDialogComponent,

      { mode: 'create' },

      (player) => {
        if (!player) {
          return;
        }

        this.addPlayerToSquad(this.toSquadUser(player));
      },

      { widthSize: 'md', disableClose: true }
    );
  }

  public openEditPlayer(player: SquadUser): void {
    if (this.isSaving) {
      return;
    }

    this.sub.add(
      this.playersService.getById(player.id).subscribe({
        next: (res) => {
          if (!res.data) {
            this.messageService.error('Could not load player details.');

            return;
          }

          this.messageService.openDialog<ManagePlayerDialogComponent, ManagePlayerDialogResult>(
            ManagePlayerDialogComponent,

            { mode: 'edit', user: res.data },

            (saved) => saved && this.syncFromServer(),

            { widthSize: 'md', disableClose: true }
          );
        },
      })
    );
  }
}
