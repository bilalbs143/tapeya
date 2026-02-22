<?php

namespace App\Notifications;

use App\Enums\Notification\AdminNotificationTypeEnum;
use App\Models\Event\EventRequest;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventRequestSubmittedAdminNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected EventRequest $eventRequest
    ) {}

    /**
     * Channels: database for System user; mail for AnonymousNotifiable (config admin_emails).
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        if ($notifiable instanceof AnonymousNotifiable) {
            return ['mail'];
        }

        if ($notifiable instanceof User && $notifiable->isSystem()) {
            return ['database'];
        }

        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New event request: '.$this->eventRequest->event_name)
            ->view('emails.admin.event-request-submitted', $this->mailPayload());
    }

    /**
     * @return array<string, mixed>
     */
    private function mailPayload(): array
    {
        $r = $this->eventRequest;

        return [
            'event_name' => $r->event_name,
            'contact_person_name' => $r->contact_person_name ?? '-',
            'contact_phone' => $r->contact_phone ?? '-',
            'venue_name' => $r->venue_name ?? '-',
            'start_date' => $r->start_date?->format('Y-m-d') ?? '-',
            'end_date' => $r->end_date?->format('Y-m-d') ?? '-',
            'city' => $r->city ?? '-',
            'country' => $r->country ?? '',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $this->eventRequest->loadMissing('user');
        $eventName = $this->eventRequest->event_name;
        $contact = $this->eventRequest->contact_person_name ?? '-';
        $message = 'New event request: '.$eventName.' from '.$contact;

        return [
            'type' => AdminNotificationTypeEnum::EVENT_REQUEST_SUBMITTED->value,
            'event_request_id' => $this->eventRequest->id,
            'event_name' => $eventName,
            'contact_person_name' => $this->eventRequest->contact_person_name,
            'contact_phone' => $this->eventRequest->contact_phone,
            'message' => $message,
        ];
    }
}
