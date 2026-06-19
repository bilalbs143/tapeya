import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, DestroyRef, ElementRef, NgZone, OnInit, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin, switchMap } from 'rxjs';

import { BackofficeReverbService } from 'src/app/services/backoffice-reverb.service';
import {
  type GraphicDispatchContext,
  type MatchGraphicPlayerPick,
  formatCommandToken,
  graphicActionKey,
  graphicActionTooltip,
  groupPlayerPickKind,
  hasPlayerPickRoster,
  isGraphicActionDisabled,
  isGraphicActionHidden,
  isPlayerPickGroup as catalogIsPlayerPickGroup,
  playerOfMatchUserIdFromContext,
  resolveGraphicDispatch,
} from 'src/app/services/graphic-command-dispatcher';
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
import { LiveMatchStateComponent } from './live-match-state/live-match-state.component';
import { MatchCaptionDialogComponent, type MatchCaptionDialogData } from './match-caption-dialog/match-caption-dialog.component';
import { MatchStreamDialogComponent, type MatchStreamDialogData } from './match-stream-dialog/match-stream-dialog.component';
import { MatchStreamHeaderStatusComponent } from './match-stream-header-status/match-stream-header-status.component';

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
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    LiveMatchStateComponent,
    MatchStreamHeaderStatusComponent,
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

  /** Serializes context_hash refetches so stale responses cannot overwrite fresher session data. */
  private readonly sessionContextRefresh$ = new Subject<void>();

  /** Root element for browser Fullscreen API (controller page only). */
  private readonly fullscreenHost = viewChild<ElementRef<HTMLElement>>('fullscreenHost');

  public readonly isFullscreen = signal(false);
  /** Bumped when stream config dialog mutates setup so header status reloads. */
  public readonly streamRefreshToken = signal(0);

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
    const fromCtx = typeof slice?.['result_summary'] === 'string' ? String(slice['result_summary']).trim() : '';
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

    this.sessionContextRefresh$
      .pipe(
        switchMap(() => this.graphicService.getSession(this.matchId)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (fresh) => {
          const prevInnings = this.session?.context?.['innings_number'];
          this.session = fresh.data;
          const newInnings = fresh.data.context?.['innings_number'];
          if (prevInnings !== newInnings) {
            this.selectedBatsman = null;
            this.selectedBowler = null;
          }
        },
        error: (err: unknown) => this.messageService.httpError(err),
      });
  }

  public loadAll(): void {
    this.loading = true;
    forkJoin({
      match: this.matchRows.getById(this.matchId),
      session: this.graphicService.getSessionOptional(this.matchId),
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
        this.loading = false;
        if (this.session) {
          this.subscribeToGraphicsChannel();
        } else {
          this.graphicsChannelCleanup?.();
          this.graphicsChannelCleanup = null;
        }
      },
      error: (err: unknown) => {
        this.loading = false;
        this.messageService.httpError(err);
      },
    });
  }

  public openCaptionDialog(): void {
    const data: MatchCaptionDialogData = {
      matchId: this.matchId,
      caption: this.caption ?? undefined,
    };
    const ref = this.dialog.open(MatchCaptionDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data,
    });
    ref.afterClosed().subscribe((mutated) => {
      if (mutated) {
        this.refreshCaptions();
      }
    });
  }

  public captionManageTooltip(): string {
    if (!this.caption) {
      return 'Add a match caption for Custom overlay commands';
    }
    return `${this.caption.title} — ${this.caption.description}`;
  }

  public openSettings(): void {
    if (!this.match) {
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

  public openStreamDialog(): void {
    if (!this.match) {
      return;
    }
    const data: MatchStreamDialogData = {
      matchId: this.matchId,
      homeTeamName: this.match.home_team?.name ?? 'Home',
      awayTeamName: this.match.away_team?.name ?? 'Away',
      onStreamMutated: () => this.streamRefreshToken.update((n) => n + 1),
    };
    const ref = this.dialog.open(MatchStreamDialogComponent, {
      width: '720px',
      maxWidth: '95vw',
      data,
    });
    ref.afterClosed().subscribe((mutated) => {
      if (mutated) {
        this.streamRefreshToken.update((n) => n + 1);
      }
    });
  }

  public send(action: GraphicCatalogAction): void {
    const result = resolveGraphicDispatch(action, this.dispatchContext());
    switch (result.kind) {
      case 'backoffice_only':
        if (result.handler === 'open_caption_dialog') {
          this.openCaptionDialog();
        }
        return;
      case 'blocked':
        if (result.message) {
          this.messageService.warning(result.message);
        }
        return;
      case 'send':
        this.dispatchGraphicCommand(action, result.payload);
    }
  }

  /** Only the command in-flight is disabled; avoids dimming the whole catalog. */
  public isActionSending(a: GraphicCatalogAction): boolean {
    return this.sendingKey === graphicActionKey(a);
  }

  /** Live innings from session context (scoring / Reverb). */
  private liveInningsNumber(): 1 | 2 {
    const inn = this.session?.context?.['innings_number'];
    return inn === 2 ? 2 : 1;
  }

  private dispatchContext(): GraphicDispatchContext {
    const matchSlice = this.session?.context?.['match'] as Record<string, unknown> | undefined;

    return {
      caption: this.caption,
      captionsCount: this.captions.length,
      playerLists: this.playerLists,
      selectedBatsman: this.selectedBatsman,
      selectedBowler: this.selectedBowler,
      playerOfMatchUserId: playerOfMatchUserIdFromContext(matchSlice),
      batsmanPickOptionsCount: this.batsmanPickOptions().length,
      bowlerPickOptionsCount: this.bowlerPickOptions().length,
    };
  }

  private buildCommandPayloadWithInnings(base: Record<string, unknown> | null): Record<string, unknown> {
    return {
      innings_number: this.liveInningsNumber(),
      ...(base ?? {}),
    };
  }

  private dispatchGraphicCommand(action: GraphicCatalogAction, payload: Record<string, unknown> | null): void {
    const key = graphicActionKey(action);
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

    // Ensure Echo exists (normally created from the shell header). Match controller
    // can load before the header runs ngOnInit, or operators may deep-link here.
    this.reverbService.connect();

    this.graphicsChannelCleanup = this.reverbService.listenMatchGraphics(
      this.matchId,
      (event) => {
        // Another operator activated a command — update the active graphic chip.
        if (this.session) {
          const prevHash = this.session.context_hash ?? null;
          const nextHash = (event['context_hash'] as string | null | undefined) ?? null;
          const graphicThemeId = event['graphic_theme_id'] as number | null | undefined;
          const config = event['config'] as Record<string, unknown> | null | undefined;
          const pendingPlayers = event['pending_players'] as Record<string, unknown> | null | undefined;
          this.session = {
            ...this.session,
            ...(nextHash != null ? { context_hash: nextHash } : {}),
            ...(graphicThemeId != null ? { graphic_theme_id: graphicThemeId } : {}),
            ...('config' in event ? { config: config ?? null } : {}),
            ...('pending_players' in event ? { pending_players: pendingPlayers ?? null } : {}),
            active_command: this.commandFromGraphicActivatedEvent(event),
            active_command_id: this.commandIdFromGraphicActivatedEvent(event),
          };

          // Full context is not sent on WebSocket (Pusher payload limit).
          if (nextHash != null && nextHash !== prevHash) {
            this.sessionContextRefresh$.next();
          }
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
            } else {
              this.graphicService.getSession(this.matchId).subscribe({
                next: (s) => {
                  this.session = s.data;
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
   */
  private commandIdFromGraphicActivatedEvent(event: Record<string, unknown>): number | null {
    const raw = event['command_id'] ?? event['id'];
    return typeof raw === 'number' ? raw : Number(raw) || null;
  }

  private commandFromGraphicActivatedEvent(event: Record<string, unknown>): MatchGraphicCommand {
    const id = this.commandIdFromGraphicActivatedEvent(event);
    const sidRaw = event['session_id'] ?? event['match_graphic_session_id'];
    const sessionId = typeof sidRaw === 'number' ? sidRaw : Number(sidRaw) || 0;
    return {
      id: id ?? 0,
      match_graphic_session_id: sessionId,
      command_type: typeof event['command_type'] === 'string' ? event['command_type'] : '',
      command_key: typeof event['command_key'] === 'string' ? event['command_key'] : '',
      payload: (event['payload'] as Record<string, unknown> | null) ?? null,
      display_mode: (event['display_mode'] as string | null) ?? null,
      created_at: null,
    };
  }

  /** Hide backoffice-only caption slot when a caption already exists. */
  public hideCatalogAction(a: GraphicCatalogAction): boolean {
    return isGraphicActionHidden(a, this.dispatchContext());
  }

  public catalogActionTooltip(a: GraphicCatalogAction): string {
    return graphicActionTooltip(a, this.dispatchContext());
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

  /** Convenience getter — catalog group whose actions require a batsman pick. */
  public get playerBatsmanGroup(): GraphicCatalogGroup | null {
    return this.catalogGroups.find((g) => groupPlayerPickKind(g) === 'batsman') ?? null;
  }

  /** Convenience getter — catalog group whose actions require a bowler pick. */
  public get playerBowlerGroup(): GraphicCatalogGroup | null {
    return this.catalogGroups.find((g) => groupPlayerPickKind(g) === 'bowler') ?? null;
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
    return (
      (this.session?.context?.['bowler'] as {
        name: string;
        figures: string;
        overs: string;
        user_id?: number;
        team_id?: number;
      } | null) ?? null
    );
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
    return catalogIsPlayerPickGroup(group);
  }

  public onPlayerPickChange(group: GraphicCatalogGroup, value: MatchGraphicPlayerPick | null): void {
    const kind = groupPlayerPickKind(group);
    if (kind === 'batsman') {
      this.selectedBatsman = value;
    } else if (kind === 'bowler') {
      this.selectedBowler = value;
    }
  }

  public playerPickLabel(group: GraphicCatalogGroup): string {
    const kind = groupPlayerPickKind(group);
    if (kind === 'batsman') {
      return 'Batsman';
    }
    if (kind === 'bowler') {
      return 'Bowler';
    }
    return 'Player';
  }

  public playerPickValue(group: GraphicCatalogGroup): MatchGraphicPlayerPick | null {
    const kind = groupPlayerPickKind(group);
    if (kind === 'batsman') {
      return this.selectedBatsman;
    }
    if (kind === 'bowler') {
      return this.selectedBowler;
    }
    return null;
  }

  /** Batting side for the live innings; bowlers are excluded from this list. */
  public batsmanPickOptions(): { value: MatchGraphicPlayerPick; label: string }[] {
    const side = this.inningsSideForSelection();
    if (!side) {
      return this.allPlayerPickOptions();
    }
    return this.playersOptionsForTeam(side.batting_team_id);
  }

  /** Bowling side for the live innings. */
  public bowlerPickOptions(): { value: MatchGraphicPlayerPick; label: string }[] {
    const side = this.inningsSideForSelection();
    if (!side) {
      return this.allPlayerPickOptions();
    }
    return this.playersOptionsForTeam(side.bowling_team_id);
  }

  public pickOptionsForGroup(group: GraphicCatalogGroup): { value: MatchGraphicPlayerPick; label: string }[] {
    const kind = groupPlayerPickKind(group);
    if (kind === 'batsman') {
      return this.batsmanPickOptions();
    }
    if (kind === 'bowler') {
      return this.bowlerPickOptions();
    }
    return [];
  }

  private inningsSideForSelection(): MatchGraphicInningsSide | null {
    const rows = this.playerLists?.innings_sides;
    if (!rows?.length) {
      return null;
    }
    return rows.find((r) => r.innings_number === this.liveInningsNumber()) ?? null;
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
    return hasPlayerPickRoster(this.playerLists);
  }

  public playerPickActionDisabled(_group: GraphicCatalogGroup, action: GraphicCatalogAction): boolean {
    return isGraphicActionDisabled(action, this.dispatchContext());
  }

  /** Title-case a SNAKE_UPPER API token for display (e.g. `LAST_WICKET` → Last Wicket). */
  public formatCommandToken(token: string): string {
    return formatCommandToken(token);
  }

  // ── Live match state (read from session.context, updated via Reverb) ──────
  // Logic lives in LiveMatchStateComponent; parent only passes session.context.
}
