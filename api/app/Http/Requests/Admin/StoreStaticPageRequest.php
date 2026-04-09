<?php

namespace App\Http\Requests\Admin;

use App\Models\StaticPage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreStaticPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): array
    {
        $data = parent::validated($key, $default);
        $title = $data['title'];
        $incomingSlug = isset($data['slug']) ? trim((string) $data['slug']) : '';
        $base = $incomingSlug !== ''
            ? Str::slug($incomingSlug)
            : Str::slug($title);
        if ($base === '') {
            $base = 'page';
        }
        $data['slug'] = $this->uniqueSlug($base);

        return $data;
    }

    private function uniqueSlug(string $base): string
    {
        $slug = $base;
        $c = 0;
        while (StaticPage::where('slug', $slug)->exists()) {
            $slug = $base.'-'.(++$c);
        }

        return $slug;
    }
}
