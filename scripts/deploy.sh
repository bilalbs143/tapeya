#!/bin/bash

# Tapeya Deployment Script
# Usage: ./deploy.sh [api|backoffice|mobile|all]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

deploy_api() {
    echo "🚀 Deploying API..."
    cd "$PROJECT_ROOT/api"
    
    composer install --optimize-autoloader --no-dev
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan migrate --force
    
    print_status "API deployed successfully"
}

deploy_backoffice() {
    echo "🚀 Building Backoffice..."
    cd "$PROJECT_ROOT/backoffice"
    
    npm ci
    ng build --configuration production
    
    print_status "Backoffice built successfully"
    echo "Deploy the 'dist/backoffice' folder to your web server"
}

deploy_mobile() {
    echo "🚀 Building Mobile App..."
    cd "$PROJECT_ROOT/app"
    
    npm ci
    npm run build
    
    print_status "Mobile web build complete"
    echo "For native builds, use: npm run cap:sync && npm run cap:open:ios (or cap:open:android)"
}

case "$1" in
    api)
        deploy_api
        ;;
    backoffice)
        deploy_backoffice
        ;;
    mobile)
        deploy_mobile
        ;;
    all)
        deploy_api
        deploy_backoffice
        deploy_mobile
        ;;
    *)
        echo "Usage: $0 [api|backoffice|mobile|all]"
        exit 1
        ;;
esac
