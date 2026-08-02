<?php

namespace App\Http\Resources\Admin\Shop;

use App\Support\Media\MediaDisk;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductImageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'path' => MediaDisk::url($this->path),
            'alt' => $this->alt,
            'sort_order' => $this->sort_order,
        ];
    }
}
