# Rename `match_streams` → `live_streams`

**Status:** Done on production — 2026-08-18  
**Related:** [LIVE_STREAM_INDEPENDENT_STREAMS.md](./LIVE_STREAM_INDEPENDENT_STREAMS.md), [LIVE_STREAM_MOBILE_BROADCAST.md](./LIVE_STREAM_MOBILE_BROADCAST.md), [LIVE_STREAM_YOUTUBE_FINAL.md](./LIVE_STREAM_YOUTUBE_FINAL.md)

Target name: **`live_streams`** (not `live_steams`).

---

## What ran on production

No new alter migration. The live table was renamed with SQL, and the **original create migration** was rewritten so `migrate:fresh` creates `live_streams` from the start.

| Step | Result |
|------|--------|
| Backup | `exports/tapeya-pre-live-streams-rename-20260818-022250.dump` |
| Maintenance | `php artisan down`, supervisor stopped |
| SQL | `api/database/scripts/rename_match_streams_to_live_streams.sql` |
| Create migration | `2026_05_18_100000_create_match_streams_table.php` → `2026_05_18_100000_create_live_streams_table.php` (same timestamp, new filename + contents) |
| `migrations` row | id 63, batch 1, now `2026_05_18_100000_create_live_streams_table` |
| Model | `MatchStream::$table = 'live_streams'` (class name unchanged) |
| Tests | `assertDatabaseHas/Missing` table strings updated |
| Cutover | `artisan migrate:status` — create file **Ran**, nothing pending; app brought back up; workers restarted; `php8.3-fpm` reloaded |

Verified after cutover:

- `match_streams` gone; `live_streams` present with the same columns, FKs, and partial unique index (renamed objects).
- Sequence `live_streams_id_seq`; Eloquent `getTable()` = `live_streams`.
- Stream row count still **0** (REFRESH table; IDs not reset as a wipe — table was already empty).
- Public `GET /api/v1/live/matches` returns **401** unauthenticated (route works; not a missing-table 500).

Media disk `match-stream-thumbnails`, API paths, and Reverb channel names were **not** changed.

---

## Why this shape (not a new alter migration)

Production already ran the consolidated create file. A second “rename table” migration would:

- leave `migrate:fresh` creating `match_streams` then renaming it (noise), or
- drift if someone rewrote only the create file without updating the `migrations` table.

Updating the create file **and** the `migrations.migration` value keeps:

- this database matching the files on disk
- a future `migrate:fresh` creating `live_streams` only
- `php artisan migrate` with nothing pending

---

## Files

| Path | Role |
|------|------|
| `api/database/scripts/rename_match_streams_to_live_streams.sql` | One-shot production rename (do not re-run) |
| `api/database/migrations/2026_05_18_100000_create_live_streams_table.php` | Canonical create for fresh installs |
| `api/app/Models/MatchStream.php` | `$table = 'live_streams'` |
| `exports/tapeya-pre-live-streams-rename-20260818-022250.dump` | Rollback dump |

Historical copies under `api/database/migrations-backup/` and `migrations copy/` still say `match_streams` — those folders are not used by artisan.

---

## Rollback

Restore the dump (preferred):

```bash
sudo -u postgres pg_restore --clean --if-exists -d tapeya /var/www/tapeya/exports/tapeya-pre-live-streams-rename-20260818-022250.dump
```

That restores the old table **and** the old `migrations` filename. Also revert the git changes (create file name, model `$table`, tests).

SQL-only undo (if the dump is not used):

```sql
ALTER TABLE live_streams RENAME TO match_streams;
-- then rename sequence, indexes, FKs, and set migrations.migration back
-- to 2026_05_18_100000_create_match_streams_table
```

Then restore the old create migration file and remove `$table` (or set it to `match_streams`).

---

## Why the old name was misleading

Product language is already “live stream”:

| Layer | Name |
|-------|------|
| Public API | `/api/v1/live/matches`, `/api/v1/live/streams/{stream}`, `/api/v1/admin/live-streams` |
| Reverb | `live-stream.{streamId}.chat`, `live-stream.{streamId}.presence` |
| Backoffice | Live Streams management |
| PHP services | `LiveStreamService`, `LiveStreamController` |
| DB (now) | `live_streams` |
| Eloquent class | `MatchStream` (unchanged) |

The table started as 1:1 with `matches`. `match_id` is nullable. Standalone and self-serve broadcasts live in the same table.

---

## What was left alone (by design)

| Item | Why |
|------|-----|
| `MatchStream` class name | Large PHP rename; collides with `LiveStreamService` |
| Media disk `match-stream-thumbnails` | Object storage / CDN keys |
| API and Reverb names | Clients already use live-stream URLs |
| `migrate:fresh` | Not used for this cutover |
| Historical docs (`LIVE_STREAM_YOUTUBE_FINAL.md`, etc.) | Still describe the former table name |

---

## Decision checklist

- [x] Confirm we mean `live_streams`, not `live_steams`
- [x] Confirm no inbound FKs into the table
- [x] No new alter migration
- [x] Create migration filename + contents updated
- [x] `migrations` row updated to the new filename
- [x] `MatchStream::$table = 'live_streams'` + tests
- [x] Short `artisan down` + workers stopped
- [x] Model / media disk / API paths not renamed beyond `$table`
- [x] Smoke after `artisan up`
