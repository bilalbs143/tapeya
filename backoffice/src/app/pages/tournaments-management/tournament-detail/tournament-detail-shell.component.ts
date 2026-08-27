import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EMPTY, Subscription, filter, merge, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { MessageService } from 'src/app/services/message.service';
import { TournamentTeamsService } from 'src/app/services/tournament-teams.service';
import { TournamentsService, type Tournament } from 'src/app/services/tournaments.service';
import { LoaderBlockComponent } from 'src/app/shared/components/loader/loader-block.component';
import { getStatusClass } from 'src/app/utils/status-class.util';

@Component({
  selector: 'app-tournament-detail-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatCardModule, MatTabsModule, LoaderBlockComponent],
  templateUrl: './tournament-detail-shell.component.html',
})
export class TournamentDetailShellComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly tournamentTeamsService = inject(TournamentTeamsService);
  private readonly messageService = inject(MessageService);
  private readonly sub = new Subscription();

  public tournament: Tournament | null = null;
  public activeTeamName: string | null = null;
  public isLoading = true;
  public readonly statusClass = getStatusClass;

  public ngOnInit(): void {
    this.sub.add(
      this.route.paramMap
        .pipe(
          switchMap((params) => {
            const idRaw = params.get('tournamentId');
            if (!idRaw) {
              void this.router.navigate(['/tournaments-management/tournaments']);
              return EMPTY;
            }

            const id = Number(idRaw);
            if (!Number.isFinite(id) || id <= 0) {
              void this.router.navigate(['/tournaments-management/tournaments']);
              return EMPTY;
            }

            this.isLoading = true;
            this.tournament = null;
            this.activeTeamName = null;

            return this.tournamentsService.getById(id).pipe(
              catchError(() => {
                this.isLoading = false;
                this.messageService.error('Could not load tournament.');
                void this.router.navigate(['/tournaments-management/tournaments']);
                return EMPTY;
              })
            );
          })
        )
        .subscribe((res) => {
          this.tournament = res.data;
          this.isLoading = false;
        })
    );

    this.sub.add(
      merge(this.route.paramMap, this.router.events.pipe(filter((event) => event instanceof NavigationEnd)))
        .pipe(
          switchMap(() => {
            const tournamentId = Number(this.route.snapshot.paramMap.get('tournamentId') ?? 0);
            const teamId = this.findTeamIdInRoute(this.route);

            if (!Number.isFinite(tournamentId) || tournamentId <= 0 || !teamId || !Number.isFinite(teamId)) {
              this.activeTeamName = null;
              return of(null);
            }

            return this.tournamentTeamsService.listTeams(tournamentId).pipe(
              map((res) => (res.data ?? []).find((team) => team.id === teamId)?.name ?? null),
              catchError(() => of(null))
            );
          })
        )
        .subscribe((name) => {
          this.activeTeamName = name;
        })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private findTeamIdInRoute(route: ActivatedRoute): number | null {
    let current: ActivatedRoute | null = route;

    while (current) {
      const teamIdRaw = current.snapshot.paramMap.get('teamId');
      if (teamIdRaw) {
        const teamId = Number(teamIdRaw);
        return Number.isFinite(teamId) && teamId > 0 ? teamId : null;
      }
      current = current.firstChild;
    }

    return null;
  }
}
