<?php

namespace App\Http\Requests\Admin;

use App\Models\StaticPage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateStaticPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $title = (string) $this->input('title', '');
        $slugRaw = $this->input('slug');
        $fromTitle = Str::slug($title);
        $fallback = $fromTitle !== '' ? $fromTitle : 'page';

        if ($slugRaw === null || trim((string) $slugRaw) === '') {
            $this->merge(['slug' => $fallback]);

            return;
        }

        $normalized = Str::slug(trim((string) $slugRaw));
        $this->merge(['slug' => $normalized !== '' ? $normalized : $fallback]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var StaticPage $page */
        $page = $this->route('static_page');

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('static_pages', 'slug')->ignore($page->id)],
            'content' => ['nullable', 'string'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): array
    {
        $data = parent::validated($key, $default);
        /** @var StaticPage $page */
        $page = $this->route('static_page');
        $title = $data['title'];
        $incomingSlug = isset($data['slug']) ? trim((string) $data['slug']) : '';
        $base = $incomingSlug !== ''
            ? Str::slug($incomingSlug)
            : Str::slug($title);
        if ($base === '') {
            $base = 'page';
        }
        $data['slug'] = $this->uniqueSlug($base, $page->id);

        return $data;
    }

    private function uniqueSlug(string $base, int $ignoreId): string
    {
        $slug = $base;
        $c = 0;
        while (StaticPage::where('slug', $slug)->where('id', '!=', $ignoreId)->exists()) {
            $slug = $base.'-'.(++$c);
        }

        return $slug;
    }
}
