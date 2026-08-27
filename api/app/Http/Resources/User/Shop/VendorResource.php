<?php

namespace App\Http\Resources\User\Shop;

use App\Support\Media\MediaDisk;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VendorResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'store_name' => $this->store_name,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo' => MediaDisk::url($this->logo),
            'banner' => MediaDisk::url($this->banner),
            'city' => $this->city,
            'country' => $this->country,
            'phone' => $this->phone,
            'products' => ProductResource::collection($this->whenLoaded('products')),
        ];
    }
}
