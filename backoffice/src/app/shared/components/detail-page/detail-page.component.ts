import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

/**
 * Single-card detail chrome shared by tournament / campaign / live-stream / player-stats.
 *
 * Bands (list-page rhythm):
 *   [detailHeader] → divider → [detailTabs] → [detailBody]
 *
 * Parent owns `mat-tab-nav-bar` + `#tabPanel` (Material needs the local template ref).
 */
@Component({
  selector: 'app-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatDividerModule],
  template: `
    <mat-card class="cardWithShadow detail-page overflow-hidden">
      <mat-card-content class="p-6">
        <ng-content select="[detailHeader]"></ng-content>
      </mat-card-content>
      <mat-divider></mat-divider>
      <ng-content select="[detailTabs]"></ng-content>
      <div class="detail-page__body">
        <ng-content select="[detailBody]"></ng-content>
      </div>
    </mat-card>
  `,
})
export class DetailPageComponent {}
