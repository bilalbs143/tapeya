#!/bin/bash

# Production Build Script for Angular Application
# This script optimizes the build process and provides detailed feedback

set -e

echo "🚀 Starting Production Build Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "angular.json" ]; then
    print_error "This script must be run from the Angular project root directory"
    exit 1
fi

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/
rm -rf .angular/

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm ci --production=false
fi

# Run linting
print_status "Running pre-build linting..."
npm run lint:ci

# Build the application
print_status "Building application for production..."
npm run build:prod

# Check build output
if [ -d "dist" ]; then
    print_success "Build completed successfully!"
    
    # Analyze bundle sizes
    print_status "Analyzing bundle sizes..."
    npm run build:stats
    
    # Display build information
    print_status "Build output directory: dist/"
    print_status "Total build size: $(du -sh dist/ | cut -f1)"
    
    # Check for large files
    print_status "Checking for large files..."
    find dist/ -type f -name "*.js" -o -name "*.css" | xargs ls -lh | sort -k5 -hr | head -5
    
else
    print_error "Build failed - dist/ directory not found"
    exit 1
fi

# Optional: Run tests if available
if npm run test:ci > /dev/null 2>&1; then
    print_status "Running tests..."
    npm run test:ci
    print_success "Tests completed!"
else
    print_warning "Test script not available, skipping tests"
fi

print_success "Production build process completed successfully!"
print_status "You can now deploy the contents of the dist/ directory"

# Optional: Open bundle analyzer
read -p "Would you like to open the bundle analyzer? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Opening bundle analyzer..."
    npm run build:analyze
fi
