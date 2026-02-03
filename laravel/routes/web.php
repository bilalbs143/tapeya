<?php

use App\Http\Controllers\v1\User\AppReleaseController;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/file/{path}', function ($path) {
    $url = Storage::temporaryUrl($path, now()->addMinutes(30));

    return response()->redirectTo($url);
})->where('path', '.*');

Route::prefix('app')->group(function () {
    Route::get('/download/{os}', [AppReleaseController::class, 'download']);
});

Route::get('/referral/{referral_code}', function ($referral_code) {
    $user = User::active()->where('ref_code', $referral_code)->firstOrFail();

    return redirect()->away($user->website_ref_link);
})->name('referral_link');
