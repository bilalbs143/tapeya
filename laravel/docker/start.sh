#!/bin/sh

chown -R $USER:www-data storage
chown -R $USER:www-data bootstrap/cache
chmod -R 775 storage
chmod -R 775 bootstrap/cache

php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

echo "Migrating..."
php artisan migrate --force

echo "Seeding..."
php artisan db:seed --force

echo "Clearing permission cache..."
php artisan permission:cache-reset

echo "Clearing all caches for Docker environment..."
php artisan cache:clear
php artisan config:cache


# echo "Syncing Games..."
# php artisan sync:games

echo "Starting Docker App..."

supervisord -c /etc/supervisor/conf.d/supervisord.conf
