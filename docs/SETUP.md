# Setup Guide

## Requirements

### System Requirements
- macOS, Linux, or Windows (WSL recommended)
- PHP 8.2 or higher
- Composer 2.x
- Node.js 18.x or higher
- npm 9.x or higher

### Global CLI Tools
```bash
# Install Angular CLI
npm install -g @angular/cli

# Install Ionic CLI
npm install -g @ionic/cli
```

## API Setup (Laravel)

1. Navigate to the API directory:
   ```bash
   cd api
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Generate application key:
   ```bash
   php artisan key:generate
   ```

5. Configure your database in `.env`:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=tapeya
   DB_USERNAME=root
   DB_PASSWORD=
   ```

6. Run migrations:
   ```bash
   php artisan migrate
   ```

7. (Optional) Seed the database:
   ```bash
   php artisan db:seed
   ```

## Backoffice Setup (Angular)

1. Navigate to the backoffice directory:
   ```bash
   cd backoffice
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Local API URLs live in `src/environments/environment.development.ts` (`ng serve` uses this).
   Do not hand-edit production/staging URLs for deploys — use:
   ```bash
   npm run build:production   # api.tapeya.com
   npm run build:staging      # dev-api.tapeya.com
   ```

## Consumer App Setup (Vite + React + Capacitor)

1. Navigate to the app directory:
   ```bash
   cd app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Local `npm run dev` uses Vite defaults / `.env` as needed.
   Deploy builds bake URLs via scripts (same pattern as graphics):
   ```bash
   npm run build:production
   npm run build:staging
   npm run build:graphics:production
   npm run build:graphics:staging
   ```

4. For native builds:
   ```bash
   npm run cap:ios
   # or
   npm run cap:android
   ```

