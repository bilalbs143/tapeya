# Tapeya Nginx configuration

Production mirrors of `/etc/nginx/sites-available/*.conf`. HTTP is ACME + HTTPS redirect only; all apps are served over TLS.

| File | Host | Root |
|------|------|------|
| `api.conf` | `api.tapeya.com` | `/var/www/tapeya/api/public` |
| `app.conf` | `tapeya.com` (+ `www` → apex) | `/var/www/tapeya/app/dist` |
| `graphics.conf` | `graphics.tapeya.com` | `/var/www/tapeya/app/dist-graphics` |
| `backoffice.conf` | `backoffice.tapeya.com` | `/var/www/tapeya/backoffice/dist/backoffice/browser` |

`tapeya.conf` only includes the four files above (optional all-in-one include).

## Deploy

```bash
sudo cp /var/www/tapeya/nginx/api.conf /etc/nginx/sites-available/api.conf
sudo cp /var/www/tapeya/nginx/app.conf /etc/nginx/sites-available/app.conf
sudo cp /var/www/tapeya/nginx/graphics.conf /etc/nginx/sites-available/graphics.conf
sudo cp /var/www/tapeya/nginx/backoffice.conf /etc/nginx/sites-available/backoffice.conf

# Enable once (production already has these):
# sudo ln -sfn /etc/nginx/sites-available/api.conf /etc/nginx/sites-enabled/
# sudo ln -sfn /etc/nginx/sites-available/app.conf /etc/nginx/sites-enabled/
# sudo ln -sfn /etc/nginx/sites-available/graphics.conf /etc/nginx/sites-enabled/
# sudo ln -sfn /etc/nginx/sites-available/backoffice.conf /etc/nginx/sites-enabled/

sudo mkdir -p /var/cache/nginx/api && sudo chown www-data:www-data /var/cache/nginx/api
sudo nginx -t && sudo systemctl reload nginx
```

## Certificates

- **Shared:** `api.tapeya.com`, `tapeya.com`, `backoffice.tapeya.com` → `/etc/letsencrypt/live/api.tapeya.com/`
- **Graphics:** `graphics.tapeya.com` → `/etc/letsencrypt/live/graphics.tapeya.com/`

```bash
# Expand shared cert (example)
certbot certonly --cert-name api.tapeya.com --expand --webroot -w /var/www/certbot \
  -d api.tapeya.com -d tapeya.com -d backoffice.tapeya.com

# Dedicated graphics cert
certbot certonly --webroot -w /var/www/certbot -d graphics.tapeya.com --cert-name graphics.tapeya.com
```

## Highlights (production rules)

- **API:** Reverb proxy (`/app/`, `/apps`), FastCGI micro-cache (skips auth / non-GET / embed), embed without `X-Frame-Options`, deny `.env` + `storage/logs`
- **App:** hashed asset long-cache + `gzip_static`, `/embed/youtube` loopback to API, SPA fallback
- **Graphics:** signed-token routes, no-cache shell, long-cache `/assets/`
- **Backoffice:** `X-Robots-Tag: noindex`, hashed asset long-cache

## App / Laravel checklist

- Build app: `cd app && npm run build:production`
- Graphics: `cd app && npm run build:graphics:production`
- Backoffice: `cd backoffice && npm run build`
- `CORS_ALLOWED_ORIGINS` — web hosts; Capacitor covered by `config/cors.php` patterns
- `REVERB_ALLOWED_ORIGINS` must include `localhost` for Capacitor
- Admin → Graphics Frontend URL → `https://graphics.tapeya.com`
