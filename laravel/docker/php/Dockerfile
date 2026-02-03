FROM php:8.4-fpm

ENV DOCKERIZE_VERSION 0.6.1

RUN curl -s -f -L -o /tmp/dockerize.tar.gz https://github.com/jwilder/dockerize/releases/download/v$DOCKERIZE_VERSION/dockerize-linux-amd64-v$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf /tmp/dockerize.tar.gz \
    && rm /tmp/dockerize.tar.gz

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    libz-dev \
    libpq-dev \
    libjpeg-dev \
    libpng-dev \
    libssl-dev \
    libzip-dev \
    libmagickwand-dev \
    imagemagick \
    unzip \
    zip \
    supervisor \
    && apt-get clean \
    && pecl install redis imagick \
    && docker-php-ext-configure gd \
    && docker-php-ext-configure zip \
    && docker-php-ext-install \
    gd \
    exif \
    opcache \
    pdo_pgsql \
    pgsql \
    pcntl \
    zip \
    && docker-php-ext-enable redis imagick \
    && rm -rf /var/lib/apt/lists/*;

COPY ./docker/php/laravel.ini /usr/local/etc/php/conf.d/laravel.ini

WORKDIR /usr/src/app

# Copy the rest of the application files
COPY . /usr/src/app

# Copy the .env.docker file to .env
COPY .env.docker /usr/src/app/.env

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set correct permissions for storage, bootstrap/cache directories, and Supervisor files
RUN chown -R www-data:www-data /usr/src/app/storage /usr/src/app/bootstrap/cache
RUN chmod -R 775 /usr/src/app/storage /usr/src/app/bootstrap/cache

# Create log and pid files for Supervisor and set permissions
RUN mkdir -p /usr/src/app && \
    touch /usr/src/app/supervisord.log /usr/src/app/supervisord.pid && \
    chown www-data:www-data /usr/src/app/supervisord.log /usr/src/app/supervisord.pid && \
    touch /usr/src/app/storage/logs/schedule.log && \
    touch /usr/src/app/storage/logs/schedule_error.log && \
    chown www-data:www-data /usr/src/app/storage/logs/schedule.log && \
    chown www-data:www-data /usr/src/app/storage/logs/schedule_error.log && \
    touch /usr/src/app/storage/logs/horizon.log && \
    touch /usr/src/app/storage/logs/horizon_error.log && \
    chown www-data:www-data /usr/src/app/storage/logs/horizon.log && \
    chown www-data:www-data /usr/src/app/storage/logs/horizon_error.log

# Copy supervisor configuration
COPY ./docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

COPY ./docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

USER www-data

CMD ["/usr/local/bin/start.sh"]
