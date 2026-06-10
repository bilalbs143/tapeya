import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import type { FileUploadValue } from '../shared/components/file-upload/file-upload.component';

/**
 * Generic media service — upload or delete a media field on any registered
 * backend model type via POST/DELETE /admin/media/{type}/{id}/{field}.
 *
 * Supported types (defined in the backend MediaRegistry):
 *   brand, category, hero-slider, tournament, team, campaign, match, product
 */
@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly http = inject(HttpClient);

  /** Upload a single file to replace a field value. */
  public uploadField(type: string, id: number, field: string, file: File): Observable<void> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<void>(`v1/admin/media/${type}/${id}/${field}`, fd);
  }

  /** Append one or more files to a multiple-file field (e.g. product images). */
  public uploadMultiple(type: string, id: number, field: string, files: File[]): Observable<void> {
    const fd = new FormData();
    files.forEach((f) => fd.append('files[]', f));
    return this.http.post<void>(`v1/admin/media/${type}/${id}/${field}`, fd);
  }

  /** Null out a single-file field (deletes the stored file). */
  public deleteField(type: string, id: number, field: string): Observable<void> {
    return this.http.delete<void>(`v1/admin/media/${type}/${id}/${field}`);
  }

  /**
   * Delete a specific image from a multiple-file field by its full URL.
   * The backend matches the URL against stored paths using Storage::url().
   */
  public deleteOne(type: string, id: number, field: string, url: string): Observable<void> {
    return this.http.delete<void>(`v1/admin/media/${type}/${id}/${field}`, {
      body: { url },
    });
  }

  /**
   * Resolve and execute the correct action for an optional single-file field:
   *
   * - New file selected          → upload (replaces any existing file on the backend)
   * - Existing cleared, no new   → delete  (only if originalHasFile is true)
   * - No change                  → no-op   (returns of(undefined))
   *
   * @param originalHasFile  Whether the record had a file before the dialog opened.
   */
  public applyField(
    type: string,
    id: number,
    field: string,
    value: FileUploadValue | null,
    originalHasFile: boolean
  ): Observable<void> {
    const hasNewFile = (value?.files?.length ?? 0) > 0;
    const hasExisting = (value?.existingUrls?.length ?? 0) > 0;

    if (hasNewFile) {
      return this.uploadField(type, id, field, value!.files[0]);
    }
    if (!hasExisting && originalHasFile) {
      return this.deleteField(type, id, field);
    }
    return of(undefined);
  }

  /**
   * Resolve and execute all necessary actions for a multiple-file field.
   *
   * - URLs in originalUrls not present in current existingUrls → delete (one call each)
   * - New files in value.files                                 → upload (one batched call)
   * - No changes                                               → no-op
   *
   * @param originalUrls  Full URLs the field had when the dialog opened.
   */
  public applyMultipleField(
    type: string,
    id: number,
    field: string,
    value: FileUploadValue | null,
    originalUrls: string[]
  ): Observable<void> {
    const currentUrls = value?.existingUrls ?? [];
    const newFiles = value?.files ?? [];
    const deletedUrls = originalUrls.filter((u) => !currentUrls.includes(u));

    const ops: Observable<void>[] = [
      ...deletedUrls.map((url) => this.deleteOne(type, id, field, url)),
      ...(newFiles.length > 0 ? [this.uploadMultiple(type, id, field, newFiles)] : []),
    ];

    return ops.length > 0 ? forkJoin(ops).pipe(map(() => undefined)) : of(undefined);
  }
}
