#!/bin/bash

# Tapeya Project Setup Script
# Run this script to set up the entire project

set -e

echo "🚀 Setting up Tapeya project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Setup API
echo ""
echo "📦 Setting up API (Laravel)..."
if [ -d "api" ]; then
    cd api
    composer install
    if [ ! -f ".env" ]; then
        cp .env.example .env
        php artisan key:generate
        print_status "API environment configured"
    else
        print_warning "API .env already exists, skipping..."
    fi
    cd "$PROJECT_ROOT"
    print_status "API setup complete"
else
    print_error "API directory not found!"
fi

# Setup Backoffice
echo ""
echo "📦 Setting up Backoffice (Angular)..."
if [ -d "backoffice" ]; then
    cd backoffice
    npm install
    cd "$PROJECT_ROOT"
    print_status "Backoffice setup complete"
else
    print_error "Backoffice directory not found!"
fi

# Setup Mobile App
echo ""
echo "📦 Setting up Mobile App (Ionic + React)..."
if [ -d "app" ]; then
    cd app
    npm install
    cd "$PROJECT_ROOT"
    print_status "Mobile app setup complete"
else
    print_error "App directory not found!"
fi

echo ""
echo "✅ Tapeya project setup complete!"
echo ""
echo "To start the applications:"
echo "  API:        cd api && php artisan serve"
echo "  Backoffice: cd backoffice && ng serve"
echo "  Mobile:     cd app && npm start"
project-root/
├── api/                          # Laravel API backend
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── storage/
│   ├── tests/
│   ├── composer.json
│   ├── artisan
│   └── .env
│
├── backoffice/                   # Angular admin panel
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   ├── environments/
│   │   └── index.html
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/                       # Ionic + React user app
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.tsx
│   ├── ionic.config.json
│   ├── capacitor.config.ts
│   └── package.json
│
├── shared/                       # Optional: shared types/constants
│   ├── types/
│   └── constants/
│
├── docs/                         # Documentation
│   ├── API.md
│   ├── SETUP.md
│   └── DEPLOYMENT.md
│
├── scripts/                      # Deployment/setup scripts
│   ├── setup.sh
│   └── deploy.sh
│
├── docker/                       # Docker configuration (optional)
│   ├── api/
│   ├── backoffice/
│   └── mobile/
│
├── .gitignore
├── docker-compose.yml            # Optional: for local development
└── README.md