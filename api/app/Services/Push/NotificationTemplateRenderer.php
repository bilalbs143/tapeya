<?php

namespace App\Services\Push;

final class NotificationTemplateRenderer
{
    /**
     * Replace {{variable}} placeholders. Unknown keys become empty strings.
     * HTML is stripped from the result.
     */
    public function render(string $template, array $data): string
    {
        $rendered = preg_replace_callback(
            '/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/',
            static function (array $matches) use ($data): string {
                $key = $matches[1];

                return isset($data[$key]) ? (string) $data[$key] : '';
            },
            $template
        ) ?? $template;

        return strip_tags($rendered);
    }
}
