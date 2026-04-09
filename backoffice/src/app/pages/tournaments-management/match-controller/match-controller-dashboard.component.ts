import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { forkJoin } from 'rxjs';

import {
  MatchGraphicService,
  type GraphicCatalogAction,
  type GraphicCatalogGroup,
  type GraphicTheme,
  type MatchGraphicCaption,
  type MatchGraphicInningsSide,
  type MatchGraphicPlayerListsPayload,
  type MatchGraphicSession,
} from 'src/app/services/match-graphic.service';
import { MessageService } from 'src/app/services/message.service';
import { TournamentMatchesService, type TournamentMatchRow } from 'src/app/services/tournament-matches.service';

import {
  ControllerSettingsDialogComponent,
  type ControllerSettingsDialogData,
} from './controller-settings-dialog/controller-settings-dialog.component';
import {
  MatchCaptionDialogComponent,
  type MatchCaptionDialogData,
} from './match-caption-dialog/match-caption-dialog.component';

export interface MatchGraphicPlayerPick {
  team_id: number;
  user_id: number;
}

@Component({
  selector: 'app-match-controller-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TablerIconsModule,
  ],
  templateUrl: './match-controller-dashboard.component.html',
  styleUrl: './match-controller-dashboard.component.scss',
})
export class MatchControllerDashboardComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly matchRows = inject(TournamentMatchesService);
  private readonly graphicService = inject(MatchGraphicService);
  private readonly messageService = inject(MessageService);

  public matchId!: number;
  public match: TournamentMatchRow | null = null;
  public session: MatchGraphicSession | null = null;
  public themesList: GraphicTheme[] = [];
  public catalogGroups: GraphicCatalogGroup[] = [];
  public captions: MatchGraphicCaption[] = [];
  public playerLists: MatchGraphicPlayerListsPayload | null = null;
  public selectedBatsman: MatchGraphicPlayerPick | null = null;
  public selectedBowler: MatchGraphicPlayerPick | null = null;
  public loading = true;
  public sendingKey: string | null = null;
  public clearingRecent = false;
  /** Sent with every graphic command payload and stored in session `context`. */
  public selectedInnings: 1 | 2 = 1;

  public readonly comparePlayerPick = (a: MatchGraphicPlayerPick | null, b: MatchGraphicPlayerPick | null): boolean =>
    !!a && !!b && a.team_id === b.team_id && a.user_id === b.user_id;

  /** At most one caption per match; API enforces the same. */
  public get caption(): MatchGraphicCaption | null {
    return this.captions[0] ?? null;
  }

  public ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('matchId');
      if (!id) {
        void this.router.navigate(['/tournaments-management/tournaments']);
        return;
      }
      this.matchId = Number(id);
      this.loadAll();
    });
  }

  public loadAll(): void {
    this.loading = true;
    forkJoin({
      match: this.matchRows.getById(this.matchId),
      session: this.graphicService.getSession(this.matchId),
      themes: this.graphicService.listThemes(),
      catalog: this.graphicService.getCommandCatalog(),
      captions: this.graphicService.listCaptions(this.matchId),
      playerLists: this.graphicService.getGraphicPlayerLists(this.matchId),
    }).subscribe({
      next: ({ match, session, themes, catalog, captions, playerLists }) => {
        this.match = match.data;
        this.session = session.data;
        this.themesList = themes.data ?? [];
        this.catalogGroups = catalog.data?.groups ?? [];
        this.captions = captions.data ?? [];
        this.playerLists = playerLists.data ?? null;
        this.selectedBatsman = null;
        this.selectedBowler = null;
        this.syncInningsFromSession(session.data);
        this.loading = false;
      },
      error: (err: unknown) => {
        this.loading = false;
        this.messageService.httpError(err);
      },
    });
  }

  public openCaptionDialog(caption: MatchGraphicCaption | null = null): void {
    const data: MatchCaptionDialogData = {
      matchId: this.matchId,
      caption: caption ?? undefined,
    };
    const ref = this.dialog.open(MatchCaptionDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data,
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshCaptions();
      }
    });
  }

  public deleteCaption(caption: MatchGraphicCaption): void {
    this.messageService
      .prompt('Delete caption', `Remove "${caption.title}"?`, 'Delete', 'Cancel')
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) {
          return;
        }
        this.graphicService.deleteCaption(this.matchId, caption.id).subscribe({
          next: () => this.refreshCaptions(),
          error: (err: unknown) => this.messageService.httpError(err),
        });
      });
  }

  public openSettings(): void {
    if (!this.session) {
      return;
    }
    const data: ControllerSettingsDialogData = {
      matchId: this.matchId,
      session: this.session,
      themes: this.themesList,
    };
    const ref = this.dialog.open(ControllerSettingsDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data,
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.loadAll();
      }
    });
  }

  public send(action: GraphicCatalogAction): void {
    if (action.command_key === 'ADD_CAPTION') {
      this.openCaptionDialog(this.caption);
      return;
    }

    if (action.command_key === 'CUSTOM' && this.captions.length === 0) {
      return;
    }

    if (action.command_type === 'PLAYER_BATSMAN') {
      if (!this.selectedBatsman) {
        this.messageService.warning('Select a batsman first.');
        return;
      }
      this.dispatchGraphicCommand(action, {
        user_id: this.selectedBatsman.user_id,
        team_id: this.selectedBatsman.team_id,
      });
      return;
    }

    if (action.command_type === 'PLAYER_BOWLER') {
      if (!this.selectedBowler) {
        this.messageService.warning('Select a bowler first.');
        return;
      }
      this.dispatchGraphicCommand(action, {
        user_id: this.selectedBowler.user_id,
        team_id: this.selectedBowler.team_id,
      });
      return;
    }

    this.dispatchGraphicCommand(action, null);
  }

  /** Only the command in-flight is disabled; avoids dimming the whole catalog. */
  public isActionSending(a: GraphicCatalogAction): boolean {
    return this.sendingKey === `${a.command_type}:${a.command_key}`;
  }

  private syncInningsFromSession(s: MatchGraphicSession | null): void {
    const inn = s?.context?.['innings_number'];
    this.selectedInnings = inn === 2 ? 2 : 1;
  }

  public onInningsSelectionChange(value: number): void {
    const v: 1 | 2 = value === 2 ? 2 : 1;
    this.selectedInnings = v;
    this.selectedBatsman = null;
    this.selectedBowler = null;
    if (!this.session) {
      return;
    }
    const ctx: Record<string, unknown> = { ...(this.session.context ?? {}), innings_number: v };
    this.graphicService.updateSession(this.matchId, { context: ctx }, { notify: false }).subscribe({
      next: (res) => {
        this.session = res.data;
        this.syncInningsFromSession(res.data);
      },
      error: (err: unknown) => this.messageService.httpError(err),
    });
  }

  private buildCommandPayloadWithInnings(base: Record<string, unknown> | null): Record<string, unknown> {
    return {
      innings_number: this.selectedInnings,
      ...(base ?? {}),
    };
  }

  private dispatchGraphicCommand(action: GraphicCatalogAction, payload: Record<string, unknown> | null): void {
    const key = `${action.command_type}:${action.command_key}`;
    this.sendingKey = key;
    this.graphicService
      .sendCommand(this.matchId, {
        command_type: action.command_type,
        command_key: action.command_key,
        display_mode: action.display_mode,
        activate: true,
        payload: this.buildCommandPayloadWithInnings(payload),
      })
      .subscribe({
        next: () => {
          this.sendingKey = null;
          this.messageService.success(`Sent: ${action.label}`);
          this.graphicService.getSession(this.matchId).subscribe({
            next: (s) => {
              this.session = s.data;
              this.syncInningsFromSession(s.data);
            },
            error: (err: unknown) => this.messageService.httpError(err),
          });
        },
        error: (err: unknown) => {
          this.sendingKey = null;
          this.messageService.httpError(err);
        },
      });
  }

  public usePrimaryButtons(group: GraphicCatalogGroup): boolean {
    return group.id === 'FULL_SCREEN' || group.id === 'FULL_SCREEN_TRANSITION';
  }

  public backLink(): string[] {
    const tid = this.match?.tournament_id;
    return tid
      ? ['/tournaments-management/tournaments', String(tid), 'matches']
      : ['/tournaments-management/tournaments'];
  }

  public confirmClearRecentCommands(): void {
    this.messageService
      .prompt(
        'Clear recent commands',
        'Remove all command history for this match? The active on-air graphic will be cleared.',
        'Clear all',
        'Cancel'
      )
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) {
          return;
        }
        this.clearingRecent = true;
        this.graphicService.clearCommandHistory(this.matchId).subscribe({
          next: (res) => {
            this.clearingRecent = false;
            if (res.message) {
              this.messageService.success(res.message);
            }
            if (res.data) {
              this.session = res.data;
              this.syncInningsFromSession(res.data);
            } else {
              this.graphicService.getSession(this.matchId).subscribe({
                next: (s) => {
                  this.session = s.data;
                  this.syncInningsFromSession(s.data);
                },
                error: (err: unknown) => this.messageService.httpError(err),
              });
            }
          },
          error: (err: unknown) => {
            this.clearingRecent = false;
            this.messageService.httpError(err);
          },
        });
      });
  }

  private refreshCaptions(): void {
    this.graphicService.listCaptions(this.matchId).subscribe({
      next: (res) => (this.captions = res.data ?? []),
      error: (err: unknown) => this.messageService.httpError(err),
    });
  }

  /** Hide catalog “Add Caption” when the single slot is already used (edit via Saved Caption). */
  public hideCatalogAction(a: GraphicCatalogAction): boolean {
    return a.command_key === 'ADD_CAPTION' && this.caption !== null;
  }

  /** “Custom Caption” can only be sent after at least one saved caption exists. */
  public customCaptionActionDisabled(a: GraphicCatalogAction): boolean {
    return a.command_key === 'CUSTOM' && this.captions.length === 0;
  }

  public catalogActionTooltip(a: GraphicCatalogAction): string {
    if (this.customCaptionActionDisabled(a)) {
      return 'Save a caption first';
    }
    return this.formatCommandToken(a.command_key);
  }

  /** Groups with many actions span the full catalog row so buttons use horizontal space. */
  public isWideCatalogGroup(group: GraphicCatalogGroup): boolean {
    return group.actions.length > 12;
  }

  public isPlayerPickGroup(group: GraphicCatalogGroup): boolean {
    return group.id === 'PLAYER_BATSMAN' || group.id === 'PLAYER_BOWLER';
  }

  public onPlayerPickChange(group: GraphicCatalogGroup, value: MatchGraphicPlayerPick | null): void {
    if (group.id === 'PLAYER_BATSMAN') {
      this.selectedBatsman = value;
    } else if (group.id === 'PLAYER_BOWLER') {
      this.selectedBowler = value;
    }
  }

  /** Batting side for the current innings toggle; bowlers are excluded from this list. */
  public batsmanPickOptions(): { value: MatchGraphicPlayerPick; label: string }[] {
    const side = this.inningsSideForSelection();
    if (!side) {
      return this.allPlayerPickOptions();
    }
    return this.playersOptionsForTeam(side.batting_team_id);
  }

  /** Bowling side for the current innings toggle. */
  public bowlerPickOptions(): { value: MatchGraphicPlayerPick; label: string }[] {
    const side = this.inningsSideForSelection();
    if (!side) {
      return this.allPlayerPickOptions();
    }
    return this.playersOptionsForTeam(side.bowling_team_id);
  }

  public pickOptionsForGroup(group: GraphicCatalogGroup): { value: MatchGraphicPlayerPick; label: string }[] {
    if (group.id === 'PLAYER_BATSMAN') {
      return this.batsmanPickOptions();
    }
    if (group.id === 'PLAYER_BOWLER') {
      return this.bowlerPickOptions();
    }
    return [];
  }

  private inningsSideForSelection(): MatchGraphicInningsSide | null {
    const rows = this.playerLists?.innings_sides;
    if (!rows?.length) {
      return null;
    }
    return rows.find((r) => r.innings_number === this.selectedInnings) ?? null;
  }

  private playersOptionsForTeam(teamId: number): { value: MatchGraphicPlayerPick; label: string }[] {
    if (!this.playerLists) {
      return [];
    }
    const side = [this.playerLists.home_team, this.playerLists.away_team].find((t) => t.id === teamId);
    if (!side) {
      return [];
    }
    const teamName = side.name ?? 'Team';
    return side.players.map((p) => {
      const role = p.playing_role ? ` (${p.playing_role})` : '';
      return {
        value: { team_id: side.id, user_id: p.user_id },
        label: `${teamName} — ${p.name}${role}`,
      };
    });
  }

  private allPlayerPickOptions(): { value: MatchGraphicPlayerPick; label: string }[] {
    if (!this.playerLists) {
      return [];
    }
    const out: { value: MatchGraphicPlayerPick; label: string }[] = [];
    for (const side of [this.playerLists.home_team, this.playerLists.away_team]) {
      out.push(...this.playersOptionsForTeam(side.id));
    }
    return out;
  }

  public get hasPlayerPickRoster(): boolean {
    if (!this.playerLists) {
      return false;
    }
    return this.playerLists.home_team.players.length + this.playerLists.away_team.players.length > 0;
  }

  public playerPickActionDisabled(group: GraphicCatalogGroup, action: GraphicCatalogAction): boolean {
    if (!this.isPlayerPickGroup(group)) {
      return this.customCaptionActionDisabled(action);
    }
    if (!this.hasPlayerPickRoster) {
      return true;
    }
    if (group.id === 'PLAYER_BATSMAN') {
      if (this.batsmanPickOptions().length === 0) {
        return true;
      }
      return this.selectedBatsman === null;
    }
    if (group.id === 'PLAYER_BOWLER') {
      if (this.bowlerPickOptions().length === 0) {
        return true;
      }
      return this.selectedBowler === null;
    }
    return true;
  }

  /** Title-case a SNAKE_UPPER API token for display (e.g. `LAST_WICKET` → Last Wicket). */
  public formatCommandToken(token: string): string {
    return token
      .split('_')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
}
