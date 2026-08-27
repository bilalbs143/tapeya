# cdn-tapeya

Cloudflare Worker that signs private Backblaze B2 reads for `https://cdn.tapeya.com/*`.

Based on [backblaze-b2-samples/cloudflare-b2](https://github.com/backblaze-b2-samples/cloudflare-b2).

## What it does

- Private bucket `tapeya` stays closed; only this Worker holds a **read-only** B2 key
- Clients never see B2 credentials or raw `*.backblazeb2.com` URLs
- Workers Cache enabled (`wrangler.toml` `[cache]`); TTL from object/bucket `Cache-Control`
- `cross_version_cache = false` so header/CORS changes apply on deploy (purge `cdn.tapeya.com` if an edge still serves a pre-change HIT)
- Public CORS for `GET` / `HEAD` / `OPTIONS` (Range + video / canvas clients)
- Non-GET methods → `405`; empty path / list-bucket → `404`

## Deploy

```bash
cd infra/cdn-tapeya
npm install
# first time / key rotation:
echo "<B2_APPLICATION_KEY>" | npx wrangler secret put B2_APPLICATION_KEY
npx wrangler deploy
```

Local secrets: copy `.dev.vars.template` → `.dev.vars` (gitignored).

## App wiring

- `AWS_URL=https://cdn.tapeya.com`
- Admin → Media & CDN → `cdn_public_base_url=https://cdn.tapeya.com`
- API writes use a separate read/write B2 key (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`)

See `docs/MEDIA_CDN_MIGRATION.md`.

## Smoke

```bash
curl -I "https://cdn.tapeya.com/<existing-object-key>"
# expect: 200, cf-cache-status HIT|MISS|DYNAMIC, Cache-Control present
curl -I -H 'Range: bytes=0-1023' "https://cdn.tapeya.com/<existing-object-key>"
# expect: 206 + Content-Range
```
