<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class ContactSettings extends Settings
{
    /** Public support email shown in the app. */
    public ?string $supportEmail;

    /** E.164-style or local display number for in-app support. */
    public ?string $supportPhone;

    /** Marketing / landing page shown in the app. */
    public ?string $publicWebsiteUrl;

    public static function group(): string
    {
        return 'contact';
    }
}
