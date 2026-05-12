import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { InterestCampaignsListComponent } from '../interest-campaigns/interest-campaigns-list.component';

import { TournamentsService } from 'src/app/services/tournaments.service';

@Component({
  selector: 'app-tournament-interest-campaigns-tab',
  standalone: true,
  imports: [CommonModule, InterestCampaignsListComponent],
  template: `
    @if (tournamentId !== null) {
      <app-interest-campaigns-list [tournamentId]="tournamentId" [tournamentName]="tournamentName" />
    }
  `,
})
export class TournamentInterestCampaignsTabComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly sub = new Subscription();

  public tournamentId: number | null = null;
  public tournamentName: string | null = null;

  @ViewChild(InterestCampaignsListComponent)
  public listComponent?: InterestCampaignsListComponent;

  public ngOnInit(): void {
    this.sub.add(
      this.route.parent!.paramMap.subscribe((params) => {
        const id = params.get('tournamentId');
        if (!id) return;
        this.tournamentId = Number(id);
        this.fetchTournamentName(this.tournamentId);
      })
    );
  }

  private fetchTournamentName(id: number): void {
    this.sub.add(
      this.tournamentsService.getById(id).subscribe({
        next: (res) => (this.tournamentName = res.data?.tournament_name ?? null),
        error: () => (this.tournamentName = null),
      })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
