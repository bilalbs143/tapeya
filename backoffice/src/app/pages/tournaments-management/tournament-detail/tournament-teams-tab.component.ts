import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
import { EmptyDataMessageComponent } from 'src/app/shared/components/empty-data-message/empty-data-message.component';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';

import { AttachTournamentTeamsDialogComponent } from './attach-tournament-teams-dialog/attach-tournament-teams-dialog.component';
import { EditTournamentTeamGroupDialogComponent } from './edit-tournament-team-group-dialog/edit-tournament-team-group-dialog.component';

const DEFAULT_FILTERS = {
  search: '',
} as const;

@Component({
  selector: 'app-tournament-teams-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    TablerIconsModule,
    CommonSharedModule,
    EmptyDataMessageComponent,
  ],
  templateUrl: './tournament-teams-tab.component.html',
})
export class TournamentTeamsTabComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly teamsService = inject(TournamentTeamsService);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly messageService = inject(MessageService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
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

  public searchForm: FormGroup;
  public dataSource = new MatTableDataSource<TournamentTeamRow>([]);
  public tournament: Tournament | null = null;
  public isLoading = true;
  /** True when the last load used a non-empty search (for empty-state copy). */
  public searchActive = false;
  public readonly emptyCell = EMPTY_CELL;
  public readonly columns = ['name', 'code', 'sponsor', 'group', 'actions'] as const;
  public readonly pageSizeOptions = this.paginatorConfig.pageSizeOptions;
  public pageSize = this.paginatorConfig.pageSize;
  public pageIndex = 0;

  public tournamentId = 0;

  constructor() {
    this.searchForm = this.fb.group({
      search: [DEFAULT_FILTERS.search],
    });
    this.dataSource.sortingDataAccessor = (row, column) => {
      switch (column) {
        case 'name':
          return row.name ?? '';
        case 'code':
          return row.code ?? '';
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

  public get hasNoTeams(): boolean {
    return !this.isLoading && !this.searchActive && this.dataSource.data.length === 0;
  }

  public get hasFilterEmpty(): boolean {
    return !this.isLoading && this.searchActive && this.dataSource.data.length === 0;
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
              teams: this.teamsService.listTeams(id, this.listParams()),
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
          this.applyTeamsResponse(teams.data ?? []);
          this.isLoading = false;
        })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public resetSearchForm(): void {
    this.searchForm.reset({ ...DEFAULT_FILTERS });
    this.pageIndex = 0;
    this.loadHttpData();
  }

  public loadHttpData(): void {
    this.load();
  }

  private listParams(): Record<string, unknown> {
    const search = String(this.searchForm.value.search ?? '').trim();
    this.searchActive = search.length > 0;
    const params: Record<string, unknown> = {};
    if (search) {
      params['filter[search]'] = search;
    }
    return params;
  }

  private applyTeamsResponse(rows: TournamentTeamRow[]): void {
    this.dataSource.data = rows;
    this.pageIndex = 0;
    this.dataSource.paginator?.firstPage();
  }

  private load(): void {
    this.isLoading = true;
    forkJoin({
      tournament: this.tournamentsService.getById(this.tournamentId),
      teams: this.teamsService.listTeams(this.tournamentId, this.listParams()),
    }).subscribe({
      next: ({ tournament, teams }) => {
        this.tournament = tournament.data ?? null;
        this.applyTeamsResponse(teams.data ?? []);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  public openAttachTeams(): void {
    // Unfiltered list so attach dialog knows every already-linked team, even when search is active.
    this.teamsService.listTeams(this.tournamentId).subscribe({
      next: (res) => {
        this.messageService.openDialog<AttachTournamentTeamsDialogComponent, boolean>(
          AttachTournamentTeamsDialogComponent,
          {
            tournamentId: this.tournamentId,
            numberOfGroups: this.numberOfGroups,
            numberOfTeams: this.tournament?.number_of_teams ?? null,
            attachedTeamIds: (res.data ?? []).map((t) => t.id),
          },
          (saved) => saved && this.load(),
          { widthSize: 'sm', disableClose: true }
        );
      },
      error: () => this.messageService.error('Could not load attached teams.'),
    });
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
