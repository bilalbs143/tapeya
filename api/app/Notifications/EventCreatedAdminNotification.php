<?php

namespace App\Notifications;

use App\Enums\Notification\AdminNotificationTypeEnum;
use App\Models\Event\Event;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventCreatedAdminNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Event $event
    ) {}

    /**
     * Channels: database for System user; mail for AnonymousNotifiable (config admin_emails).
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        if ($notifiable instanceof User && $notifiable->isSystem()) {
            return ['database'];
        }

        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $eventName = $this->event->event_name;
        $eventId = $this->event->id;

        return (new MailMessage)
            ->subject('New event created: '.$eventName)
            ->view('emails.admin.event-created', $this->mailPayload());
    }

    /**
     * @return array<string, mixed>
     */
    private function mailPayload(): array
    {
        $e = $this->event;

        return [
            'event_id' => $e->id,
            'event_name' => $e->event_name,
            'contact_person_name' => $e->contact_person_name ?? '-',
            'contact_phone' => $e->contact_phone ?? '-',
            'venue_name' => $e->venue_name ?? '-',
            'start_date' => $e->start_date?->format('Y-m-d'),
            'end_date' => $e->end_date?->format('Y-m-d'),
            'city' => $e->city ?? '-',
            'country' => $e->country ?? '-',
        ];
    }

    /**
     * Data stored in the database notification (for in-app / API listing).
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $e = $this->event;
        $message = 'New event created: '.$e->event_name.' (ID: '.$e->id.')';

        return [
            'type' => AdminNotificationTypeEnum::EVENT_CREATED->value,
            'event_id' => $e->id,
            'event_name' => $e->event_name,
            'contact_person_name' => $e->contact_person_name,
            'contact_phone' => $e->contact_phone,
            'start_date' => $e->start_date?->toIso8601String(),
            'end_date' => $e->end_date?->toIso8601String(),
            'message' => $message,
        ];
    }
}
