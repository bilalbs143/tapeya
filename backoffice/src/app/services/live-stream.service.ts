import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export type LiveStreamStatus = 'idle' | 'starting' | 'live' | 'ended' | 'error';

export interface LiveStreamRow {
  id: number;
  match_id: number | null;
  title: string | null;
  description: string | null;
  streaming_url: string | null;
  provider: string;
  status: LiveStreamStatus;
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

export interface LiveStreamPayload {
  stream: LiveStreamRow | null;
  ingest: StreamIngestCredentials | null;
  thumbnail_url: string | null;
  has_custom_thumbnail?: boolean;
}

export type LiveStreamProvider = 'external' | 'youtube';

export interface CreateStandaloneStreamBody {
  provider?: LiveStreamProvider;
  title: string;
  description?: string | null;
  streaming_url?: string | null;
  privacy?: 'public' | 'unlisted';
}

export interface CreateMatchLinkedStreamBody {
  title?: string;
  privacy?: 'public' | 'unlisted';
}

export interface LiveStreamListItem {
  id: number;
  title: string | null;
  description: string | null;
  streaming_url: string | null;
  status: LiveStreamStatus;
  provider: string;
  match_id: number | null;
  started_at: string | null;
  /** Set only for self-serve mobile broadcasts (LIVE_STREAM_MOBILE_BROADCAST.md) — null for admin-created rows. */
  owner_user_id?: number | null;
  /** Authenticated Reverb presence members; populated for live/starting rows. */
  watching_count?: number;
}

export interface PaginatedLiveStreams {
  data: LiveStreamListItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

@Injectable({ providedIn: 'root' })
export class LiveStreamService {
  private readonly http = inject(HttpClient);

  public listStreams(params: Record<string, string | number> = {}): Observable<PaginatedLiveStreams> {
    return this.http.get<PaginatedLiveStreams>('v1/admin/live-streams', { params });
  }

  public createStandaloneStream(body: CreateStandaloneStreamBody): Observable<LiveStreamPayload> {
    return this.http.post<{ data: LiveStreamPayload }>('v1/admin/live-streams', body).pipe(map((res) => res.data));
  }

  public setupYoutubeStream(
    streamId: number,
    body: { title?: string; description?: string | null; privacy?: 'public' | 'unlisted'; streaming_url?: string | null } = {}
  ): Observable<LiveStreamPayload> {
    return this.http
      .post<{ data: LiveStreamPayload }>(`v1/admin/live-streams/${streamId}/setup`, body)
      .pipe(map((res) => res.data));
  }

  public getStreamById(streamId: number): Observable<LiveStreamPayload> {
    return this.http.get<{ data: LiveStreamPayload }>(`v1/admin/live-streams/${streamId}`).pipe(map((res) => res.data));
  }

  public updateStream(
    streamId: number,
    body: Partial<Pick<LiveStreamRow, 'title' | 'description' | 'streaming_url' | 'status'>>
  ): Observable<LiveStreamRow> {
    return this.http.patch<{ data: LiveStreamRow }>(`v1/admin/live-streams/${streamId}`, body).pipe(map((res) => res.data));
  }

  public startStream(streamId: number): Observable<{ status: LiveStreamStatus }> {
    return this.http
      .post<{ data: { status: LiveStreamStatus } }>(`v1/admin/live-streams/${streamId}/start`, {})
      .pipe(map((res) => res.data));
  }

  public endStreamById(streamId: number): Observable<{ status: string }> {
    return this.http.post<{ data: { status: string } }>(`v1/admin/live-streams/${streamId}/end`, {}).pipe(map((res) => res.data));
  }

  public deleteStreamById(streamId: number): Observable<void> {
    return this.http.delete<void>(`v1/admin/live-streams/${streamId}`);
  }

  public syncStreamById(streamId: number): Observable<{ status: LiveStreamStatus }> {
    return this.http
      .post<{ data: { status: LiveStreamStatus } }>(`v1/admin/live-streams/${streamId}/sync`, {})
      .pipe(map((res) => res.data));
  }

  public getStreamForMatch(matchId: number): Observable<LiveStreamPayload> {
    return this.http.get<{ data: LiveStreamPayload }>(`v1/admin/matches/${matchId}/stream`).pipe(map((res) => res.data));
  }

  public getStream(matchId: number): Observable<LiveStreamPayload> {
    return this.getStreamForMatch(matchId);
  }

  public createStreamForMatch(matchId: number, body: CreateMatchLinkedStreamBody = {}): Observable<LiveStreamPayload> {
    return this.http.post<{ data: LiveStreamPayload }>(`v1/admin/matches/${matchId}/stream`, body).pipe(map((res) => res.data));
  }

  public createStream(matchId: number, body: CreateMatchLinkedStreamBody = {}): Observable<LiveStreamPayload> {
    return this.createStreamForMatch(matchId, body);
  }

  public endStreamForMatch(matchId: number): Observable<{ status: string }> {
    return this.http
      .post<{ data: { status: string } }>(`v1/admin/matches/${matchId}/stream/end`, {})
      .pipe(map((res) => res.data));
  }

  public endStream(matchId: number): Observable<{ status: string }> {
    return this.endStreamForMatch(matchId);
  }

  public deleteStreamForMatch(matchId: number): Observable<void> {
    return this.http.delete<void>(`v1/admin/matches/${matchId}/stream`);
  }

  public deleteStream(matchId: number): Observable<void> {
    return this.deleteStreamForMatch(matchId);
  }

  public syncStreamForMatch(matchId: number): Observable<{ status: LiveStreamStatus }> {
    return this.http
      .post<{ data: { status: LiveStreamStatus } }>(`v1/admin/matches/${matchId}/stream/sync`, {})
      .pipe(map((res) => res.data));
  }

  public syncStream(matchId: number): Observable<{ status: LiveStreamStatus }> {
    return this.syncStreamForMatch(matchId);
  }
}
