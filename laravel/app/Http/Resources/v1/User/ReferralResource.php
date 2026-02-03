<?php

namespace App\Http\Resources\v1\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReferralResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'code' => $this->ref_code,
            // 'link' => $this->ref_link,
            // 'qr_code' => $this->when($request->has('need_qr_code'), $this->ref_qr_code),
            // 'website_link' => $this->website_ref_link, // not needed for now
        ];
    }
}
