# git checkout master

# git fetch -p

# git branch -D $1 || true

# git checkout $1

git pull
php artisan event:clear

php artisan migrate --seed

php artisan event:cache

sudo supervisorctl reload
