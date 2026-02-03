<?php

namespace App\Casts;

use Exception;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class AsFile implements CastsAttributes
{
    public function __construct(
        public string $basePath = 'images',
    ) {}

    /**
     * Cast the given value.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        return $value ? Storage::url($value) : null;
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        if (isset($attributes[$key])) {
            try {
                Storage::delete($attributes[$key]);
            } catch (Exception $e) {
                // do nothing
            }
        }

        return $value ? $value->store("{$this->basePath}/{$model->kebab()}") : null;
    }
}
