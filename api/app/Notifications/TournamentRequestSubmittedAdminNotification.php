<?php

namespace App\Notifications;

use App\Enums\Notification\AdminNotificationTypeEnum;
use App\Models\TournamentRequest;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TournamentRequestSubmittedAdminNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected TournamentRequest $tournamentRequest
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
            ->subject('New tournament request: '.$this->tournamentRequest->tournament_name)
            ->view('emails.admin.tournament-request-submitted', $this->mailPayload());
    }

    /**
     * @return array<string, mixed>
     */
    private function mailPayload(): array
    {
        $r = $this->tournamentRequest;

        return [
            'tournament_name' => $r->tournament_name,
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
        $this->tournamentRequest->loadMissing('user');
        $tournamentName = $this->tournamentRequest->tournament_name;
        $contact = $this->tournamentRequest->contact_person_name ?? '-';
        $message = 'New tournament request: '.$tournamentName.' from '.$contact;

        return [
            'type' => AdminNotificationTypeEnum::TOURNAMENT_REQUEST_SUBMITTED->value,
            'tournament_request_id' => $this->tournamentRequest->id,
            'tournament_name' => $tournamentName,
            'contact_person_name' => $this->tournamentRequest->contact_person_name,
            'contact_phone' => $this->tournamentRequest->contact_phone,
            'message' => $message,
        ];
    }
}
