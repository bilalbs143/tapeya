<?php

namespace App\Http\Resources\v1\Bank;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BankResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'bank_name' => $this->name,
            'code' => $this->code,
            'other_names' => $this->names,
        ];
    }
}
