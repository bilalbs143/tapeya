<?php

namespace App\Notifications;

use App\Enums\Notification\AdminNotificationTypeEnum;
use App\Models\Shop\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class VendorApplicationSubmittedAdminNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Vendor $vendor
    ) {}

    /**
     * Database only (admin in-app notification).
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $this->vendor->loadMissing('user');

        $storeName = $this->vendor->store_name;
        $applicant = $this->vendor->user?->name ?? 'Unknown';
        $message = 'New seller application: '.$storeName.' from '.$applicant;

        return [
            'type' => AdminNotificationTypeEnum::VENDOR_APPLICATION_SUBMITTED->value,
            'vendor_id' => $this->vendor->id,
            'store_name' => $storeName,
            'slug' => $this->vendor->slug,
            'user_id' => $this->vendor->user_id,
            'user_name' => $this->vendor->user?->name,
            'user_phone' => $this->vendor->user?->phone ?? $this->vendor->phone,
            'message' => $message,
        ];
    }
}
