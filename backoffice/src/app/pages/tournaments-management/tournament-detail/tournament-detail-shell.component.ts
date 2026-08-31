import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EMPTY, Subscription, filter, merge, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { TournamentMatchesComponent } from '../tournament-matches/tournament-matches.component';

import { MessageService } from 'src/app/services/message.service';
import { TournamentTeamsService } from 'src/app/services/tournament-teams.service';
import { TournamentsService, type Tournament } from 'src/app/services/tournaments.service';
import { CommonSharedModule } from 'src/app/shared/common.module';

import { TournamentInterestCampaignsTabComponent } from './tournament-interest-campaigns-tab.component';
import { TournamentTeamSquadPageComponent } from './tournament-team-squad-page.component';
import { TournamentTeamsTabComponent } from './tournament-teams-tab.component';

@Component({
  selector: 'app-tournament-detail-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatTabsModule, CommonSharedModule],
  providers: [DatePipe],
  templateUrl: './tournament-detail-shell.component.html',
})
export class TournamentDetailShellComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly tournamentTeamsService = inject(TournamentTeamsService);
  private readonly messageService = inject(MessageService);
  private readonly datePipe = inject(DatePipe);
  private readonly sub = new Subscription();

  public tournament: Tournament | null = null;
  public activeTeamName: string | null = null;
  public isLoading = true;
  public activeChild: unknown = null;

  public get headerTitle(): string {
    if (!this.tournament) return '';
    return this.activeTeamName ? `${this.tournament.tournament_name} · ${this.activeTeamName}` : this.tournament.tournament_name;
  }

  public get headerSubtitle(): string {
    if (!this.tournament) return '';
    const { venue_name, start_date, end_date } = this.tournament;
    if (!start_date && !end_date) return venue_name ?? '';
    const start = start_date ? this.datePipe.transform(start_date, 'mediumDate') : '—';
    const end = end_date ? this.datePipe.transform(end_date, 'mediumDate') : '—';
    return venue_name ? `${venue_name} · ${start} — ${end}` : `${start} — ${end}`;
  }

  public get showAttachTeams(): boolean {
    return this.activeChild instanceof TournamentTeamsTabComponent;
  }

  public get showScheduleMatch(): boolean {
    return this.activeChild instanceof TournamentMatchesComponent;
  }

  public get showAddCampaign(): boolean {
    return this.activeChild instanceof TournamentInterestCampaignsTabComponent;
  }

  public get showCreatePlayer(): boolean {
    return this.activeChild instanceof TournamentTeamSquadPageComponent;
  }

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

  public onOutletActivate(component: unknown): void {
    this.activeChild = component;
  }

  public onOutletDeactivate(): void {
    this.activeChild = null;
  }

  public runAttachTeams(): void {
    if (this.activeChild instanceof TournamentTeamsTabComponent) {
      this.activeChild.openAttachTeams();
    }
  }

  public runClearTeamSearch(): void {
    if (this.activeChild instanceof TournamentTeamsTabComponent) {
      this.activeChild.resetSearchForm();
    }
  }

  public runScheduleMatch(): void {
    if (this.activeChild instanceof TournamentMatchesComponent) {
      this.activeChild.openScheduleDialog();
    }
  }

  public runClearMatchSearch(): void {
    if (this.activeChild instanceof TournamentMatchesComponent) {
      this.activeChild.resetSearchForm();
    }
  }

  public runAddCampaign(): void {
    if (this.activeChild instanceof TournamentInterestCampaignsTabComponent) {
      this.activeChild.openCreateCampaign();
    }
  }

  public runClearCampaignSearch(): void {
    if (this.activeChild instanceof TournamentInterestCampaignsTabComponent) {
      this.activeChild.clearSearch();
    }
  }

  public runCreatePlayer(): void {
    if (this.activeChild instanceof TournamentTeamSquadPageComponent) {
      this.activeChild.openCreatePlayer();
    }
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
