<?php

namespace App\Http\Resources;

use App\Enums\SystemSetting\SystemSettingKeyEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SystemSettingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var SystemSettingKeyEnum $key */
        $key = $this->resource;

        $possibleValues = $key->type()->getPossibleValues($key);
        $fieldType = $possibleValues !== []
            ? 'dropdown'
            : $key->type()->fieldType();

        return [
            'group' => $key->group(),
            'key' => $key,
            'label' => $key->label(),
            'description' => $key->description(),
            'value' => $key->serialize($key->read()),
            'type' => $key->type(),
            'field_type' => $fieldType,
            'values' => $this->when($possibleValues !== [], $possibleValues),
        ];
    }
}
