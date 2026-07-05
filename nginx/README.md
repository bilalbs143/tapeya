# Tapeya Nginx configuration

- **API (PHP/Laravel):** `api.tapeya.com` → `/var/www/tapeya/api/public`
- **App (React):** `tapeya.com` → `/var/www/tapeya/app/dist`
- **Broadcast graphics (vMix/OBS):** `graphics.tapeya.com` → `/var/www/tapeya/app/dist-graphics`
- **Backoffice (Angular):** `backoffice.tapeya.com` → `/var/www/tapeya/backoffice/dist/backoffice/browser`

## Setup

1. **Install and enable:**
   - Copy or symlink into your nginx config directory, e.g.:
     ```bash
     sudo cp /var/www/tapeya/nginx/tapeya.conf /etc/nginx/sites-available/tapeya.conf
     sudo ln -s /etc/nginx/sites-available/tapeya.conf /etc/nginx/sites-enabled/
     ```
   - Or include from `http {}` in your main config:
     ```nginx
     include /var/www/tapeya/nginx/tapeya.conf;
     ```

2. **PHP-FPM:** Ensure PHP-FPM is running and the upstream in `tapeya.conf` matches your setup:
   - Default: `unix:/run/php/php-fpm.sock`
   - Or `server 127.0.0.1:9000;` if using TCP.

3. **Build frontends before serving:**
   - App: `cd /var/www/tapeya/app && npm run build`
   - Graphics site: `cd /var/www/tapeya/app && npm run build:graphics:production` → `dist-graphics/`
   - Backoffice: `cd /var/www/tapeya/backoffice && npm run build`
   - Angular output is `dist/backoffice/browser`. If your Angular version uses `dist/backoffice` only, change the backoffice `root` in `tapeya.conf` to `/var/www/tapeya/backoffice/dist/backoffice`.

4. **Laravel:** Set correct permissions and `APP_URL` (e.g. `https://api.tapeya.com`). Run migrations/cache as needed.
   - Production CORS: `CORS_ALLOWED_ORIGINS` must include `https://graphics.tapeya.com`
   - Reverb: `REVERB_ALLOWED_ORIGINS` must include `graphics.tapeya.com`
   - Admin → System Settings → **Graphics Frontend URL** → `https://graphics.tapeya.com`

5. **HTTPS:** See `tapeya-ssl.conf.sample` for TLS server blocks (including `graphics.tapeya.com`). Obtain certs before production graphics traffic:
   ```bash
   certbot certonly --webroot -w /var/www/tapeya/app/dist-graphics -d graphics.tapeya.com
   ```

6. **Test and reload:**
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```
