<?php

use App\Http\Controllers\YouTubeEmbedProxyController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

/** iOS Capacitor YouTube embed proxy — must stay outside SPA / auth. */
Route::get('embed/youtube', [YouTubeEmbedProxyController::class, 'show'])
    ->name('embed.youtube');

/*
 * Serve files from the public disk so /storage/* works even when the symlink
 * is not followed (e.g. wrong doc root). Requires php artisan storage:link for local disk.
 */
Route::get('storage/{path}', function (string $path) {
    if (! Storage::disk('public')->exists($path)) {
        abort(404);
    }

    return response()->file(Storage::disk('public')->path($path));
})->where('path', '.*')->name('storage.serve');
