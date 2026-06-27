import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { toHttpParams } from 'src/app/shared/functions/http-params.function';
import type { ListParams } from 'src/app/shared/functions/list-params.function';

import { MessageService } from './message.service';
import type { User, UsersListResponse } from './users.service';

export type CreatePlayerPayload = {
  name: string;
  nickname: string;
  email?: string | null;
  phone: string;
  date_of_birth?: string | null;
  playing_role?: string | null;
  bowling_style?: string | null;
  batting_style?: string | null;
  country?: string | null;
  city?: string | null;
};

export type UpdatePlayerPayload = Partial<CreatePlayerPayload>;

/** Response from POST v1/admin/players/import-csv */
export interface PlayerCsvImportResult {
  rows_imported: number;
  rows_skipped: number;
  errors: string[];
  dry_run?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PlayersService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  private readonly baseUrl = 'v1/admin/players';

  public getList(params: Partial<ListParams> = {}): Observable<UsersListResponse> {
    return this.http.get<UsersListResponse>(this.baseUrl, { params: toHttpParams(params as Record<string, unknown>) });
  }

  public getById(id: number): Observable<{ data: User }> {
    return this.http.get<{ data: User }>(`${this.baseUrl}/${id}`);
  }

  public create(payload: CreatePlayerPayload): Observable<{ data: User }> {
    return this.http.post<{ data: User }>(this.baseUrl, payload).pipe(
      tap(() => {
        this.messageService.success('Player Created Successfully.');
      })
    );
  }

  public update(id: number, payload: UpdatePlayerPayload): Observable<{ data: User }> {
    return this.http.patch<{ data: User }>(`${this.baseUrl}/${id}`, payload).pipe(
      tap(() => {
        this.messageService.success('Player Updated Successfully.');
      })
    );
  }

  public importPlayersCsv(file: File, dryRun: boolean): Observable<{ data: PlayerCsvImportResult }> {
    const formData = new FormData();
    formData.append('file', file);
    if (dryRun) {
      formData.append('dry_run', '1');
    }
    return this.http.post<{ data: PlayerCsvImportResult }>(`${this.baseUrl}/import-csv`, formData);
  }

  public getStats(
    playerId: number,
    params: { tournament_type?: string; cricket_format?: string } = {}
  ): Observable<{ data: PlayerStatsResponse }> {
    return this.http.get<{ data: PlayerStatsResponse }>(`v1/users/${playerId}/stats`, {
      params: toHttpParams(params as Record<string, unknown>),
    });
  }
}

export interface PlayerBattingStats {
  matches: number;
  innings: number;
  not_outs: number;
  runs: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  dots: number;
  highest_score: string;
  hundreds: number;
  fifties: number;
  average: number | null;
  strike_rate: number | null;
}

export interface PlayerBowlingStats {
  matches: number;
  innings: number;
  overs: number;
  maidens: number;
  runs_conceded: number;
  wickets: number;
  no_balls: number;
  wides: number;
  best_bowling_innings: string;
  best_bowling_match: string;
  five_wickets: number;
  ten_wickets: number;
  average: number | null;
  economy: number | null;
  strike_rate: number | null;
}

export interface PlayerFieldingStats {
  matches: number;
  catches: number;
  run_outs: number;
  stumpings: number;
}

export interface PlayerStatsResponse {
  player_id: number;
  tournament_type: string;
  cricket_format: string;
  batting: PlayerBattingStats;
  bowling: PlayerBowlingStats;
  fielding: PlayerFieldingStats;
}
