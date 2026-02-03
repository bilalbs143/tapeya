# Tapeya

A full-stack application with a Laravel API backend, Angular admin backoffice, and Ionic + React mobile app.

## Project Structure

```
tapeya/
├── api/                # Laravel API backend
├── backoffice/         # Angular admin panel
├── app/                # Ionic + React user app
├── shared/             # Shared types and constants
├── docs/               # Documentation
└── scripts/            # Deployment/setup scripts
```

## Getting Started

### Prerequisites

- PHP 8.2+ with Composer
- Node.js 18+ with npm
- Angular CLI (`npm install -g @angular/cli`)
- Ionic CLI (`npm install -g @ionic/cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tapeya
   ```

2. **Setup API (Laravel)**
   ```bash
   cd api
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   ```

3. **Setup Backoffice (Angular)**
   ```bash
   cd backoffice
   npm install
   ```

4. **Setup Mobile App (Ionic + React)**
   ```bash
   cd app
   npm install
   ```

### Running the Applications

**API Server:**
```bash
cd api
php artisan serve
# Runs on http://localhost:8000
```

**Backoffice:**
```bash
cd backoffice
ng serve
# Runs on http://localhost:4200
```

**Mobile App:**
```bash
cd app
npm start
# Runs on http://localhost:5173 (Vite dev server)
```

## Documentation

- [API Documentation](docs/API.md)
- [Setup Guide](docs/SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## License

MIT
