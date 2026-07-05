# Deployment Guide

## API Deployment (Laravel)

### Server Requirements
- PHP 8.2+
- MySQL 8.0+ or PostgreSQL 13+
- Nginx or Apache
- Composer
- SSL certificate

### Deployment Steps

1. Clone repository to server
2. Install dependencies:
   ```bash
   composer install --optimize-autoloader --no-dev
   ```

3. Set permissions:
   ```bash
   chmod -R 775 storage bootstrap/cache
   ```

4. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with production values
   php artisan key:generate
   ```

5. Run migrations:
   ```bash
   php artisan migrate --force
   ```

6. Optimize:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.tapeya.com;
    root /var/www/tapeya/api/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

## Backoffice Deployment (Angular)

1. Build for production:
   ```bash
   cd backoffice
   ng build --configuration production
   ```

2. Deploy `dist/backoffice/browser` folder to web server or CDN

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name admin.tapeya.com;
    root /var/www/tapeya/backoffice/dist/backoffice/browser;

    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Mobile App Deployment

### Web (PWA)
```bash
cd mobile
ionic build --prod
```

### iOS
```bash
ionic cap build ios
# Then use Xcode to archive and submit to App Store
```

### Android
```bash
ionic cap build android
# Then use Android Studio to build APK/AAB
```

## Graphics Site Deployment (`graphics.tapeya.com`)

Isolated vMix/OBS browser-source build — see [`docs/GRAPHICS_OVERLAY_ISOLATION_PLAN.md`](GRAPHICS_OVERLAY_ISOLATION_PLAN.md).

### Build

```bash
cd app
npm ci
npm run generate:tokens
npm run build:graphics:production   # bakes VITE_API_URL=https://api.tapeya.com/api/v1
npm run check:graphics-output       # no color-mix / dvh in dist-graphics
npm run check:graphics-deps         # no consumer bundles in dist-graphics
```

Artifact: `app/dist-graphics/` (serve at web root on `graphics.tapeya.com`).

Build env is set via `app/package.json` scripts (`build:graphics:production`, `build:graphics:staging`) or inline `VITE_API_URL` / `VITE_REVERB_APP_KEY` when running `npm run build:graphics`.

### Server / Nginx

- Config: inline in [`nginx/tapeya.conf`](../nginx/tapeya.conf) (standalone copy: [`nginx/graphics.conf`](../nginx/graphics.conf))
- **TLS required before go-live:** add the HTTPS server block from [`nginx/tapeya-ssl.conf.sample`](../nginx/tapeya-ssl.conf.sample). Obtain a cert before production graphics traffic.
  ```bash
  certbot certonly --webroot -w /var/www/tapeya/app/dist-graphics -d graphics.tapeya.com
  ```
- Document root: `/var/www/tapeya/app/dist-graphics`
- SPA fallback: `/{sessionId}-{expires}-{signature}` → `index.html`
- Cache: `index.html` and signed token paths → `no-cache`; hashed `/assets/*` → `immutable`, 1 year
- **URL versioning:** graphics URLs intentionally omit `/v1/` (see plan §16 — single canonical URL, deploy discipline instead of parallel version paths)

### API / Reverb (production `.env`)

```env
CORS_ALLOWED_ORIGINS=https://tapeya.com,https://graphics.tapeya.com,https://backoffice.tapeya.com
REVERB_ALLOWED_ORIGINS=tapeya.com,graphics.tapeya.com,backoffice.tapeya.com
```

Set **Graphics Frontend URL** (`https://graphics.tapeya.com`), **Graphics Signing Secret**, and **Graphics Signed URL TTL** in Admin → System Settings (not `.env`).

**Signing secret is required.** If unset, signed URL generation and token verification throw at runtime (no silent empty-string HMAC).

### Go-live runbook (order matters)

1. Deploy **API PHP** (uses `GraphicsSettings`, group `graphics`).
2. Run SQL migration: [`api/database/sql/migrate_overlay_settings_to_graphics.sql`](../api/database/sql/migrate_overlay_settings_to_graphics.sql)  
   `UPDATE settings SET "group" = 'graphics' WHERE "group" = 'overlay'`
3. Confirm **Graphics Signing Secret** and **Graphics Frontend URL** in Admin → System Settings.
4. Restart queue workers / PHP-FPM if settings were cached in long-lived processes.
5. Deploy **`dist-graphics/`** to `graphics.tapeya.com` (rsync swap via `graphics-deploy.yml` or `./scripts/deploy.sh graphics`).
6. Regenerate signed browser-source URLs in Match Graphics Controller (old `/overlay/…` URLs and expired tokens are invalid).

Rename GitHub Actions secrets: `OVERLAY_DEPLOY_*` → `GRAPHICS_DEPLOY_*` before using the deploy workflow.

### CI smoke tests (limitations)

Playwright smoke (`test:e2e:graphics-smoke`, Chrome 86 job) **mock** `GET /graphic-sessions/access/**` via fixtures — they validate the built artifact and vMix-safe CSS, but **do not** hit production API or verify Admin **Graphics Frontend URL**. After deploy, smoke-test one real signed URL in OBS/vMix once.

### CI / manual deploy

- GitHub Actions: `.github/workflows/graphics-deploy.yml` (workflow_dispatch)
- Local script: `./scripts/deploy.sh graphics`
- Optional RSYNC secrets: `GRAPHICS_DEPLOY_HOST`, `GRAPHICS_DEPLOY_USER`, `GRAPHICS_DEPLOY_PATH`, `GRAPHICS_DEPLOY_KEY`, `GRAPHICS_DEPLOY_KNOWN_HOSTS` (output of `ssh-keyscan -H $HOST` — pins server host key; deploy fails if missing or key changes)

## CI/CD Pipeline

Consider using GitHub Actions or GitLab CI for automated deployments.

Example GitHub Actions workflow in `.github/workflows/deploy.yml`
