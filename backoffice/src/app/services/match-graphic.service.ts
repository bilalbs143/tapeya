import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { MessageService } from './message.service';

export interface GraphicTheme {
  id: number;
  slug: string;
  name: string;
  config_schema: unknown;
  default_config: Record<string, unknown> | null;
  graphics_url_template: string | null;
  is_active: boolean;
}

export interface GraphicCatalogAction {
  command_type: string;
  command_key: string;
  label: string;
  display_mode: string;
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
