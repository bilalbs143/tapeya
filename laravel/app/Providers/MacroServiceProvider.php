<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\ServiceProvider;

class MacroServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->response();
        $this->migrations();
    }

    private function response()
    {
        Response::macro('success', function ($data = null, $message = null, $code = 200) {
            $response = [];

            if ($message) {
                $response['message'] = __($message);
            }

            if ($data) {
                $response['data'] = $data;
            }

            return response()->json($response, $code);
        });

        Response::macro('failure', function ($message = null, $code = 400, $errors = null) {
            $response['message'] = __($message);

            if ($errors) {
                $response['errors'] = $errors;
            }

            return response()->json($response, $code);
        });

        Response::macro('forbidden', function ($message = null) {
            return response()->failure(__($message) ?: __('messages.forbidden'), 403);
        });

        Response::macro('notFound', function ($message = null) {
            return response()->failure(__($message) ?: __('messages.not_found'), 404);
        });

        Response::macro('unauth', function ($message = null) {
            return response()->failure(__($message) ?: __('auth.failed'), 401);
        });
    }

    private function migrations()
    {
        Blueprint::macro('auditFields', function () {
            $this->foreignIdFor(User::class, 'restored_by')->nullable()->index()->constrained('users')->references('id')->nullOnDelete();
            $this->timestamp('restored_at')->nullable();
            $this->foreignIdFor(User::class, 'deleted_by')->nullable()->index()->constrained('users')->references('id')->nullOnDelete();
            $this->softDeletes();
            $this->foreignIdFor(User::class, 'created_by')->nullable()->index()->constrained('users')->references('id')->nullOnDelete();
            $this->foreignIdFor(User::class, 'updated_by')->nullable()->index()->constrained('users')->references('id')->nullOnDelete();
            $this->timestamps();
        });
    }
}
