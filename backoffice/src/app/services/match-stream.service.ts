import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export type MatchStreamStatus = 'idle' | 'starting' | 'live' | 'ended' | 'error';

export interface MatchStreamRow {
  id: number;
  match_id: number;
  provider: string;
  status: MatchStreamStatus;
  provider_stream_id: string | null;
  provider_playback_id: string | null;
  embed_url: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string | null;
}

export interface StreamIngestCredentials {
  rtmp_url: string;
  stream_key: string;
  backup_rtmp_url: string | null;
}

export interface MatchStreamPayload {
  stream: MatchStreamRow | null;
  ingest: StreamIngestCredentials | null;
  thumbnail_url: string | null;
  has_custom_thumbnail: boolean;
}

export interface CreateMatchStreamBody {
  title?: string;
  privacy?: 'public' | 'unlisted';
}

@Injectable({ providedIn: 'root' })
export class MatchStreamService {
  private readonly http = inject(HttpClient);

  public getStream(matchId: number): Observable<MatchStreamPayload> {
    return this.http.get<{ data: MatchStreamPayload }>(`v1/admin/matches/${matchId}/stream`).pipe(map((res) => res.data));
  }

  public createStream(matchId: number, body: CreateMatchStreamBody = {}): Observable<MatchStreamPayload> {
    return this.http.post<{ data: MatchStreamPayload }>(`v1/admin/matches/${matchId}/stream`, body).pipe(map((res) => res.data));
  }

  public endStream(matchId: number): Observable<{ status: string }> {
    return this.http
      .post<{ data: { status: string } }>(`v1/admin/matches/${matchId}/stream/end`, {})
      .pipe(map((res) => res.data));
  }

  public deleteStream(matchId: number): Observable<void> {
    return this.http.delete<void>(`v1/admin/matches/${matchId}/stream`);
  }

  public syncStream(matchId: number): Observable<{ status: MatchStreamStatus }> {
    return this.http
      .post<{ data: { status: MatchStreamStatus } }>(`v1/admin/matches/${matchId}/stream/sync`, {})
      .pipe(map((res) => res.data));
  }
}
