<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| User and Admin APIs are split into separate files for clarity.
| - User (app): routes/api/v1/user.php
| - Admin (backoffice): routes/api/v1/admin.php
*/

Route::prefix('v1')->group(function () {
    require __DIR__.'/api/v1/user.php';
    require __DIR__.'/api/v1/admin.php';
});
