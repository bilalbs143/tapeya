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

## CI/CD Pipeline

Consider using GitHub Actions or GitLab CI for automated deployments.

Example GitHub Actions workflow in `.github/workflows/deploy.yml`
