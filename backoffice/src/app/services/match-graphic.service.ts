import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';

import { MessageService } from './message.service';

export interface ThemeConfigProperty {
  key: string;
  label: string;
  type: 'color' | 'boolean';
  default: string | boolean;
}

export interface ThemeConfigSchema {
  properties: ThemeConfigProperty[];
}

export interface GraphicTheme {
  id: number;
  slug: string;
  name: string;
  config_schema: ThemeConfigSchema | null;
  default_config: Record<string, unknown> | null;
  is_active: boolean;
}

export interface GraphicCatalogRequires {
  caption?: boolean;
  playing_eleven_payload?: boolean;
  player_pick?: 'batsman' | 'bowler';
  player_of_match?: boolean;
}

export interface GraphicCatalogAction {
  command_type: string;
  command_key: string;
  label: string;
  display_mode: string;
  category: 'data' | 'animation' | 'clear' | 'backoffice_only';
  status: 'active' | 'pending_frontend' | 'pending_full_stack' | 'placeholder';
  requires: GraphicCatalogRequires;
}

export interface GraphicCatalogGroup {
  id: string;
  title: string;
  actions: GraphicCatalogAction[];
}

export interface MatchGraphicCommand {
  id: number;
  match_graphic_session_id: number;
  command_type: string;
  command_key: string;
  payload: Record<string, unknown> | null;
  display_mode: string | null;
  created_at: string | null;
}

export interface MatchGraphicSession {
  id: number;
  match_id: number;
  graphic_theme_id: number;
  config: Record<string, unknown> | null;
  context: Record<string, unknown> | null;
  context_hash?: string | null;
  signed_overlay_url?: string | null;
  signed_overlay_expires_at?: string | null;
  pending_players?: Record<string, unknown> | null;
  active_command_id: number | null;
  theme?: GraphicTheme;
  active_command?: MatchGraphicCommand | null;
  recent_commands?: MatchGraphicCommand[];
}

export interface MatchGraphicCaption {
  id: number;
  match_graphic_session_id: number;
  title: string;
  description: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface StoreGraphicCommandBody {
  command_type: string;
  command_key: string;
  payload?: Record<string, unknown> | null;
  display_mode?: string | null;
  activate?: boolean;
}

export interface MatchGraphicPlayerListRow {
  user_id: number;
  name: string;
  playing_role: string | null;
  batting_style?: string | null;
  bowling_style?: string | null;
}

export interface MatchGraphicTeamPlayerList {
  id: number;
  name: string | null;
  players: MatchGraphicPlayerListRow[];
}

export interface MatchGraphicInningsSide {
  innings_number: number;
  batting_team_id: number;
  bowling_team_id: number;
}

export interface MatchGraphicPlayerListsPayload {
  home_team: MatchGraphicTeamPlayerList;
  away_team: MatchGraphicTeamPlayerList;
  /** When empty (e.g. toss not done), UI falls back to all players in both dropdowns. */
  innings_sides?: MatchGraphicInningsSide[];
}

export interface SignedOverlayUrlPayload {
  url: string;
  expires_at: string;
  theme_slug: string;
}

export interface StoreMatchGraphicSessionBody {
  graphic_theme_id: number;
  config: Record<string, unknown>;
}

/** True when the API reports graphics are not configured for this match yet. */
export function isGraphicSessionNotConfigured(err: unknown): boolean {
  if (!err || typeof err !== 'object') {
    return false;
  }
  const status = (err as { status?: number }).status;
  return status === 404;
}

@Injectable({ providedIn: 'root' })
export class MatchGraphicService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  public getCommandCatalog(): Observable<{ data: { groups: GraphicCatalogGroup[] } }> {
    return this.http.get<{ data: { groups: GraphicCatalogGroup[] } }>('v1/admin/graphic-command-catalog');
  }

  public listThemes(): Observable<{ data: GraphicTheme[] }> {
    return this.http.get<{ data: GraphicTheme[] }>('v1/admin/graphic-themes');
  }

  public getSession(matchId: number): Observable<{ data: MatchGraphicSession }> {
    return this.http.get<{ data: MatchGraphicSession }>(`v1/admin/matches/${matchId}/graphic-session`);
  }

  /**
   * Returns null when graphics are not configured (HTTP 404).
   */
  public getSessionOptional(matchId: number): Observable<{ data: MatchGraphicSession | null }> {
    return this.getSession(matchId).pipe(
      catchError((err: unknown) => {
        if (isGraphicSessionNotConfigured(err)) {
          return of({ data: null });
        }
        return throwError(() => err);
      })
    );
  }

  public createSession(
    matchId: number,
    body: StoreMatchGraphicSessionBody,
    options?: { notify?: boolean }
  ): Observable<{ data: MatchGraphicSession }> {
    const notify = options?.notify !== false;
    return this.http.post<{ data: MatchGraphicSession }>(`v1/admin/matches/${matchId}/graphic-session`, body).pipe(
      tap(() => {
        if (notify) {
          this.messageService.success('Graphics configured.');
        }
      })
    );
  }

  public getSignedOverlayUrl(matchId: number): Observable<{ data: SignedOverlayUrlPayload }> {
    return this.http.get<{ data: SignedOverlayUrlPayload }>(
      `v1/admin/matches/${matchId}/graphic-session/signed-url`,
    );
  }

  public getGraphicPlayerLists(matchId: number): Observable<{ data: MatchGraphicPlayerListsPayload }> {
    return this.http.get<{ data: MatchGraphicPlayerListsPayload }>(`v1/admin/matches/${matchId}/graphic-player-lists`);
  }

  public updateSession(
    matchId: number,
    body: { graphic_theme_id?: number; config?: Record<string, unknown>; context?: Record<string, unknown> },
    options?: { notify?: boolean }
  ): Observable<{ data: MatchGraphicSession }> {
    const notify = options?.notify !== false;
    return this.http.patch<{ data: MatchGraphicSession }>(`v1/admin/matches/${matchId}/graphic-session`, body).pipe(
      tap(() => {
        if (notify) {
          this.messageService.success('Settings saved.');
        }
      })
    );
  }

  public sendCommand(matchId: number, body: StoreGraphicCommandBody): Observable<{ data: MatchGraphicCommand }> {
    return this.http.post<{ data: MatchGraphicCommand }>(`v1/admin/matches/${matchId}/graphic-session/commands`, body);
  }

  public clearCommandHistory(matchId: number): Observable<{ data: MatchGraphicSession | null; message?: string }> {
    return this.http.delete<{ data: MatchGraphicSession | null; message?: string }>(
      `v1/admin/matches/${matchId}/graphic-session/commands`
    );
  }

  public listCaptions(matchId: number): Observable<{ data: MatchGraphicCaption[] }> {
    return this.http.get<{ data: MatchGraphicCaption[] }>(`v1/admin/matches/${matchId}/graphic-session/captions`);
  }

  public createCaption(
    matchId: number,
    body: { title: string; description: string }
  ): Observable<{ data: MatchGraphicCaption; message?: string }> {
    return this.http
      .post<{
        data: MatchGraphicCaption;
        message?: string;
      }>(`v1/admin/matches/${matchId}/graphic-session/captions`, body)
      .pipe(tap(() => this.messageService.success('Caption saved.')));
  }

  public updateCaption(
    matchId: number,
    captionId: number,
    body: { title: string; description: string }
  ): Observable<{ data: MatchGraphicCaption; message?: string }> {
    return this.http
      .patch<{
        data: MatchGraphicCaption;
        message?: string;
      }>(`v1/admin/matches/${matchId}/graphic-session/captions/${captionId}`, body)
      .pipe(tap(() => this.messageService.success('Caption updated.')));
  }

  public deleteCaption(matchId: number, captionId: number): Observable<void> {
    return this.http
      .delete<void>(`v1/admin/matches/${matchId}/graphic-session/captions/${captionId}`)
      .pipe(tap(() => this.messageService.success('Caption deleted.')));
  }
}
