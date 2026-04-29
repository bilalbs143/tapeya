import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { TournamentsService, type Tournament } from 'src/app/services/tournaments.service';
import { MessageService } from 'src/app/services/message.service';
import { getStatusClass } from 'src/app/utils/status-class.util';

@Component({
  selector: 'app-tournament-detail-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './tournament-detail-shell.component.html',
})
export class TournamentDetailShellComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly messageService = inject(MessageService);
  private readonly sub = new Subscription();

  public tournament: Tournament | null = null;
  public isLoading = true;
  public readonly statusClass = getStatusClass;

  public ngOnInit(): void {
    this.sub.add(
      this.route.paramMap.subscribe((params) => {
        const id = params.get('tournamentId');
        if (!id) {
          void this.router.navigate(['/tournaments-management/tournaments']);
          return;
        }
        this.loadTournament(Number(id));
      })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private loadTournament(id: number): void {
    this.isLoading = true;
    this.tournament = null;
    this.tournamentsService.getById(id).subscribe({
      next: (res) => {
        this.tournament = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Could not load tournament.');
        void this.router.navigate(['/tournaments-management/tournaments']);
      },
    });
  }
}
