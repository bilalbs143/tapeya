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

3. Configure API URL in `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8000/api'
   };
   ```

## Mobile App Setup (Ionic + React)

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure API URL in `src/config/api.ts`

4. For native builds:
   ```bash
   # Add iOS platform
   ionic cap add ios
   
   # Add Android platform
   ionic cap add android
   ```

