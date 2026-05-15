import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, DestroyRef, ElementRef, NgZone, OnInit, inject, signal, viewChild } from '@angular/core';
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
import { forkJoin } from 'rxjs';

import { BackofficeReverbService } from 'src/app/services/backoffice-reverb.service';
import {
  MatchGraphicService,
  type GraphicCatalogAction,
  type GraphicCatalogGroup,
  type GraphicTheme,
  type MatchGraphicCaption,
  type MatchGraphicCommand,
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
import { LiveMatchStateComponent } from './live-match-state/live-match-state.component';

export interface MatchGraphicPlayerPick {
  team_id: number;
  user_id: number;
}

/** Batter row from graphic session `context.batters` (ids for command payloads). */
export interface LiveBatterContextRow {
  id: number;
  team_id?: number;
  name: string;
  runs: number;
  balls: number;
  on_strike?: boolean;
}

export interface BatterCommandCardView {
  roleLabel: string;
  batter: LiveBatterContextRow | null;
  pick: MatchGraphicPlayerPick | null;
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
    LiveMatchStateComponent,
  ],
  templateUrl: './match-controller-dashboard.component.html',
  styleUrl: './match-controller-dashboard.component.scss',
})
export class MatchControllerDashboardComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly doc = inject(DOCUMENT);
  private readonly matchRows = inject(TournamentMatchesService);
  private readonly graphicService = inject(MatchGraphicService);
  private readonly reverbService = inject(BackofficeReverbService);
  private readonly messageService = inject(MessageService);
  private readonly ngZone = inject(NgZone);

  /** Root element for browser Fullscreen API (controller page only). */
  private readonly fullscreenHost = viewChild<ElementRef<HTMLElement>>('fullscreenHost');

  public readonly isFullscreen = signal(false);

  private readonly onFullscreenChanged = (): void => {
    this.ngZone.run(() => {
      const host = this.fullscreenHost()?.nativeElement ?? null;
      this.isFullscreen.set(!!host && this.doc.fullscreenElement === host);
    });
  };

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
  /** Tracks whether this is the first data load so we auto-open settings once. */
  private firstLoad = true;
  /** Sent with every graphic command payload and stored in session `context`. */
  public selectedInnings: 1 | 2 = 1;
  /** Cleanup function returned by BackofficeReverbService.listenMatchGraphics. */
  private graphicsChannelCleanup: (() => void) | null = null;

  public readonly comparePlayerPick = (a: MatchGraphicPlayerPick | null, b: MatchGraphicPlayerPick | null): boolean =>
    !!a && !!b && a.team_id === b.team_id && a.user_id === b.user_id;

  /** At most one caption per match; API enforces the same. */
  public get caption(): MatchGraphicCaption | null {
    return this.captions[0] ?? null;
  }

  /**
   * Match row or merged graphics context — used to swap live score for a
   * compact result callout after the game ends.
   */
  public get isMatchCompleted(): boolean {
    if (this.match?.status === 'completed') {
      return true;
    }
    const slice = this.session?.context?.['match'] as Record<string, unknown> | undefined;
    return slice?.['is_completed'] === true;
  }

  /** Plain-language result for the description-style callout. */
  public get matchResultDescription(): string {
    const fromRow = this.match?.result_summary?.trim();
    if (fromRow) {
      return fromRow;
    }
    const slice = this.session?.context?.['match'] as Record<string, unknown> | undefined;
    const fromCtx =
      typeof slice?.['result_summary'] === 'string' ? String(slice['result_summary']).trim() : '';
    if (fromCtx) {
      return fromCtx;
    }
    return 'This match is complete.';
  }

  public ngOnInit(): void {
    this.doc.defaultView?.addEventListener('fullscreenchange', this.onFullscreenChanged);

    // Leave the graphics channel when this component is destroyed.
    this.destroyRef.onDestroy(() => {
      this.doc.defaultView?.removeEventListener('fullscreenchange', this.onFullscreenChanged);
      this.graphicsChannelCleanup?.();
      this.graphicsChannelCleanup = null;
      if (this.doc.fullscreenElement) {
        void this.doc.exitFullscreen().catch(() => undefined);
      }
    });

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
        this.subscribeToGraphicsChannel();

        // Auto-open settings on first page load so the operator picks a theme
        // and copies the signed OBS overlay URL before starting to send commands.
        if (this.firstLoad) {
          this.firstLoad = false;
          this.openSettings();
        }
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
    if (!this.session || !this.match) {
      return;
    }
    const data: ControllerSettingsDialogData = {
      matchId: this.matchId,
      match: this.match,
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

    // Include the saved caption text in the payload so the overlay can render
    // it directly from the broadcast event without a separate HTTP fetch.
    if (action.command_key === 'CUSTOM') {
      if (!this.caption) {
        return;
      }
      this.dispatchGraphicCommand(action, {
        title: this.caption.title,
        description: this.caption.description,
      });
      return;
    }

    // Playing XI — attach both teams' player name lists from the fetched roster.
    if (
      action.command_key === 'PLAYING_11' ||
      action.command_key === 'PLAYING_ELEVEN_HOME' ||
      action.command_key === 'PLAYING_ELEVEN_AWAY'
    ) {
      this.dispatchGraphicCommand(action, this.buildPlayingElevenPayload());
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

  /** Build the Playing XI payload from the already-loaded player roster. */
  private buildPlayingElevenPayload(): Record<string, unknown> {
    const home = this.playerLists?.home_team;
    const away = this.playerLists?.away_team;
    const mapRow = (p: {
      name: string;
      playing_role: string | null;
      batting_style?: string | null;
      bowling_style?: string | null;
    }) => ({
      name: p.name,
      playing_role: p.playing_role ?? null,
      batting_style: p.batting_style ?? null,
      bowling_style: p.bowling_style ?? null,
    });
    return {
      home_team: {
        name: home?.name ?? '',
        players: (home?.players ?? []).map(mapRow),
      },
      away_team: {
        name: away?.name ?? '',
        players: (away?.players ?? []).map(mapRow),
      },
    };
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
        next: (res) => {
          this.sendingKey = null;
          this.messageService.success(`Sent: ${action.label}`);
          if (this.session) {
            const cmd = res.data;
            const prev = this.session.recent_commands ?? [];
            this.session = {
              ...this.session,
              active_command: cmd,
              active_command_id: cmd.id,
              recent_commands: [cmd, ...prev.filter((c) => c.id !== cmd.id)].slice(0, 30),
            };
          }
        },
        error: (err: unknown) => {
          this.sendingKey = null;
          this.messageService.httpError(err);
        },
      });
  }

  /**
   * Subscribe to the public match graphics Reverb channel so this page stays
   * in sync when another operator (or another tab) fires a command or edits a
   * caption.  Called after every successful loadAll() to reconnect if the matchId
   * changes (rare but possible via route params).
   */
  private subscribeToGraphicsChannel(): void {
    // Leave any previously subscribed channel first.
    this.graphicsChannelCleanup?.();

    this.graphicsChannelCleanup = this.reverbService.listenMatchGraphics(
      this.matchId,
      (event) => {
        // Another operator activated a command — update the active graphic chip.
        if (this.session) {
          const ctx = event['context'] as Record<string, unknown> | null | undefined;
          this.session = {
            ...this.session,
            ...(ctx != null ? { context: ctx } : {}),
            active_command: this.commandFromGraphicActivatedEvent(event),
            active_command_id: this.commandIdFromGraphicActivatedEvent(event),
          };
        }
      },
      () => {
        // Caption was saved or deleted by another operator — refresh the list.
        this.refreshCaptions();
      }
    );
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

  public async toggleFullscreen(): Promise<void> {
    const root = this.fullscreenHost()?.nativeElement;
    if (!root) {
      return;
    }
    try {
      if (this.doc.fullscreenElement === root) {
        const d = this.doc as Document & { webkitExitFullscreen?: () => Promise<void> | void };
        if (typeof this.doc.exitFullscreen === 'function') {
          await this.doc.exitFullscreen();
        } else if (typeof d.webkitExitFullscreen === 'function') {
          await Promise.resolve(d.webkitExitFullscreen());
        }
      } else {
        const el = root as HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void> | void;
        };
        if (typeof el.requestFullscreen === 'function') {
          await el.requestFullscreen();
        } else if (typeof el.webkitRequestFullscreen === 'function') {
          await Promise.resolve(el.webkitRequestFullscreen());
        } else {
          this.messageService.error('Full screen is not supported in this browser.');
        }
      }
    } catch {
      this.messageService.error('Could not enter or exit full screen.');
    }
  }

  public fullscreenToggleLabel(): string {
    return this.isFullscreen() ? 'Exit Full Screen' : 'Full Screen';
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

  /**
   * Public Reverb payload uses `command_id`; admin API resources use `id`.
   * Payload shape is not fully typed at the Echo layer — use `any` here only.
   */
  private commandIdFromGraphicActivatedEvent(event: any): number | null {
    const raw = event['command_id'] ?? event['id'];
    return typeof raw === 'number' ? raw : Number(raw) || null;
  }

  private commandFromGraphicActivatedEvent(event: any): MatchGraphicCommand {
    const id = this.commandIdFromGraphicActivatedEvent(event);
    const sidRaw = event['session_id'] ?? event['match_graphic_session_id'];
    const sessionId = typeof sidRaw === 'number' ? sidRaw : Number(sidRaw) || 0;
    return {
      id: id ?? 0,
      match_graphic_session_id: sessionId,
      command_type: String(event['command_type'] ?? ''),
      command_key: String(event['command_key'] ?? ''),
      payload: (event['payload'] as Record<string, unknown> | null) ?? null,
      display_mode: (event['display_mode'] as string | null) ?? null,
      created_at: null,
    };
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

  /** Firing a graphic command for a player-controller card with an explicit pick. */
  public sendWithPick(action: GraphicCatalogAction, pick: MatchGraphicPlayerPick | null): void {
    if (!pick) {
      this.messageService.warning('No player in this slot yet — wait for live line-up or pick pending players in scoring.');
      return;
    }
    this.dispatchGraphicCommand(action, { user_id: pick.user_id, team_id: pick.team_id });
  }

  /** Convenience getter — PLAYER_BATSMAN catalog group for the player cards. */
  public get playerBatsmanGroup(): GraphicCatalogGroup | null {
    return this.catalogGroups.find((g) => g.id === 'PLAYER_BATSMAN') ?? null;
  }

  /** Convenience getter — PLAYER_BOWLER catalog group for the player cards. */
  public get playerBowlerGroup(): GraphicCatalogGroup | null {
    return this.catalogGroups.find((g) => g.id === 'PLAYER_BOWLER') ?? null;
  }

  /** Live batter array straight from the graphic session context. */
  public get liveBatters(): LiveBatterContextRow[] {
    const raw = this.session?.context?.['batters'];
    return Array.isArray(raw) ? (raw as LiveBatterContextRow[]) : [];
  }

  /** Live bowler straight from the graphic session context. */
  public get liveBowler(): {
    name: string;
    figures: string;
    overs: string;
    user_id?: number;
    team_id?: number;
  } | null {
    return (this.session?.context?.['bowler'] as {
      name: string;
      figures: string;
      overs: string;
      user_id?: number;
      team_id?: number;
    } | null) ?? null;
  }

  /**
   * Striker / non-striker quick-action cards: each row uses the live crease batter
   * (from session context), not the manual catalog dropdown.
   */
  public batterCommandCards(): BatterCommandCardView[] {
    const rows = this.liveBatters;
    const striker = rows.find((b) => b.on_strike) ?? rows[0] ?? null;
    const nonStriker =
      rows.length < 2 ? null : (rows.find((b) => striker == null || Number(b.id) !== Number(striker.id)) ?? null);
    return [
      {
        roleLabel: 'Striker',
        batter: striker,
        pick: this.pickFromLiveBatter(striker),
      },
      {
        roleLabel: 'Non-Striker',
        batter: nonStriker,
        pick: this.pickFromLiveBatter(nonStriker),
      },
    ];
  }

  /** Payload pick for the live bowler card (falls back to manual bowler pick). */
  public liveBowlerCommandPick(): MatchGraphicPlayerPick | null {
    const b = this.liveBowler;
    // JSON may stringify ids — `typeof x === 'number'` was too strict for the card buttons.
    const uid = Number(b?.user_id);
    const tid = Number(b?.team_id);
    if (uid > 0 && tid > 0) {
      return { user_id: uid, team_id: tid };
    }
    return this.selectedBowler;
  }

  public playerBatsmanCardTooltip(action: GraphicCatalogAction, card: BatterCommandCardView): string {
    const who = card.batter?.name?.trim() ? ` — ${card.batter.name}` : '';
    return `${action.label}${who}`;
  }

  public playerBowlerCardTooltip(action: GraphicCatalogAction): string {
    const nm = this.liveBowler?.name?.trim();
    const who = nm ? ` — ${nm}` : '';
    return `${action.label}${who}`;
  }

  private pickFromLiveBatter(b: LiveBatterContextRow | null): MatchGraphicPlayerPick | null {
    if (!b) {
      return null;
    }
    const id = Number(b.id);
    if (!Number.isFinite(id) || id <= 0) {
      return null;
    }
    const tid = Number(b.team_id);
    if (Number.isFinite(tid) && tid > 0) {
      return { user_id: id, team_id: tid };
    }
    return this.resolvePickFromRoster(id);
  }

  private resolvePickFromRoster(userId: number): MatchGraphicPlayerPick | null {
    if (!this.playerLists) {
      return null;
    }
    for (const side of [this.playerLists.home_team, this.playerLists.away_team]) {
      if (side.players.some((p) => Number(p.user_id) === userId)) {
        return { user_id: userId, team_id: side.id };
      }
    }
    return null;
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

  // ── Live match state (read from session.context, updated via Reverb) ──────
  // Logic lives in LiveMatchStateComponent; parent only passes session.context.
}
