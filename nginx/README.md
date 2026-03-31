# Tapeya Nginx configuration

- **API (PHP/Laravel):** `api.tapeya.com` → `/var/www/tapeya/api/public`
- **App (React):** `tapeya.com` → `/var/www/tapeya/app/dist`
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
   - Backoffice: `cd /var/www/tapeya/backoffice && npm run build`
   - Angular output is `dist/backoffice/browser`. If your Angular version uses `dist/backoffice` only, change the backoffice `root` in `tapeya.conf` to `/var/www/tapeya/backoffice/dist/backoffice`.

4. **Laravel:** Set correct permissions and `APP_URL` (e.g. `https://api.tapeya.com`). Run migrations/cache as needed.

5. **HTTPS:** Use `tapeya-ssl.conf.sample` as a reference and certbot for Let's Encrypt, then add the SSL server blocks and HTTP→HTTPS redirects.

6. **Test and reload:**
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```
