import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type { UserSearchRow } from './users.service';

export interface TournamentTeamRow {
  id: number;
  name: string;
  logo?: string | null;
  code?: string | null;
  country?: string | null;
  city?: string | null;
  group_index?: number | null;
  sponsor?: { id: number; name: string; nickname: string | null; email: string | null; phone: string | null } | null;
}

/** Player row on a tournament team squad (same minimal fields as admin user search). */
export type SquadUser = UserSearchRow;

@Injectable({ providedIn: 'root' })
export class TournamentTeamsService {
  private readonly http = inject(HttpClient);

  public listTeams(tournamentId: number): Observable<{ data: TournamentTeamRow[] }> {
    return this.http.get<{ data: TournamentTeamRow[] }>(`v1/admin/tournaments/${tournamentId}/teams`);
  }

  public getTeamSquad(tournamentId: number, teamId: number): Observable<{ data: SquadUser[] }> {
    return this.http.get<{ data: SquadUser[] }>(`v1/admin/tournaments/${tournamentId}/teams/${teamId}/squad`);
  }

  public saveTeamSquad(tournamentId: number, teamId: number, playerIds: number[]): Observable<unknown> {
    return this.http.post(`v1/admin/tournaments/${tournamentId}/teams/${teamId}/squad`, { player_ids: playerIds });
  }

  public attachTeams(
    tournamentId: number,
    body: { team_ids: number[]; group_index?: number | null }
  ): Observable<unknown> {
    return this.http.post(`v1/admin/tournaments/${tournamentId}/teams`, body);
  }

  public updateTeamGroup(tournamentId: number, teamId: number, group_index: number): Observable<unknown> {
    return this.http.patch(`v1/admin/tournaments/${tournamentId}/teams/${teamId}`, { group_index });
  }

  public detachTeam(tournamentId: number, teamId: number): Observable<unknown> {
    return this.http.delete(`v1/admin/tournaments/${tournamentId}/teams/${teamId}`);
  }
}
