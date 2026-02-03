<?php

namespace App\Http\Requests\v1\Admin\AppRelease;

use App\Enums\AppRelease\AppOsEnum;
use App\Enums\AppRelease\AppReleaseChannelEnum;
use App\Enums\AppRelease\AppTypeEnum;
use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;

class CreateAppReleaseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('CREATE_APP_RELEASE');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file_path' => 'required|file',
            'version_type' => 'required|string|in:major,minor,patch',
        ];
    }

    public function isMajor(): bool
    {
        return $this->version_type === 'major';
    }

    public function isMinor(): bool
    {
        return $this->version_type === 'minor';
    }

    public function isPatch(): bool
    {
        return $this->version_type === 'patch';
    }

    public function getOS(): AppOsEnum
    {
        return AppOsEnum::ANDROID;
    }

    public function getType(): AppTypeEnum
    {
        return AppTypeEnum::RELEASE;
    }

    public function getReleaseChannel(): AppReleaseChannelEnum
    {
        return AppReleaseChannelEnum::PRODUCTION;
    }
}
