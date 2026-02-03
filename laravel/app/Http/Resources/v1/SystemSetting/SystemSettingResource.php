<?php

namespace App\Http\Resources\v1\SystemSetting;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SystemSettingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $fieldType = $this->type->fieldType();

        return [
            'group' => $this->group,
            'key' => $this->key,
            'value' => $this->plain_value,
            'type' => $this->type,
            'field_type' => $fieldType,
            'values' => $this->when($fieldType === 'dropdown', $this->type->getPossibleValues($this->key)),
            // 'description' => $this->description?->label(),
        ];
    }
}
