<?php

namespace App\Notifications\Admin;

use App\Models\ExchangeRequest;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CryptoWithdrawalFailureNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $withdrawalData;

    protected $user;

    protected $exchangeRequest;

    public function __construct(array $withdrawalData, User $user, ?ExchangeRequest $exchangeRequest)
    {
        $this->withdrawalData = $withdrawalData;
        $this->user = $user;
        $this->exchangeRequest = $exchangeRequest;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $metadata = $this->exchangeRequest ? json_decode($this->exchangeRequest->metadata, true) : [];

        return (new MailMessage)
            ->subject('🚨 Crypto Withdrawal Failure - Action Required')
            ->greeting('Hello Admin,')
            ->line('A crypto withdrawal request has failed and requires your attention.')
            ->line('')
            ->line('**Withdrawal Details:**')
            ->line('• **User:** '.$this->user->email.' (ID: '.$this->user->id.')')
            ->line('• **Amount:** '.number_format($this->withdrawalData['requested_money'], 0).' IDR')
            ->line('• **Currency:** '.strtoupper($this->withdrawalData['currency']).'')
            ->line('• **Address:** '.$this->withdrawalData['withdrawal_address'].'')
            ->line('• **Order ID:** '.($metadata['order_id'] ?? 'N/A').'')
            ->line('• **Withdrawal ID:** '.($metadata['withdrawal_id'] ?? 'N/A').'')
            ->line('• **Batch ID:** '.($metadata['batch_withdrawal_id'] ?? 'N/A').'')
            ->line('• **Status:** '.($this->exchangeRequest && $this->exchangeRequest->status ? $this->exchangeRequest->status : 'failed').'')
            ->line('• **Created:** '.($this->exchangeRequest && $this->exchangeRequest->created_at ? $this->exchangeRequest->created_at->format('Y-m-d H:i:s') : now()->format('Y-m-d H:i:s')).'')
            ->line('')
            ->line('**User Information:**')
            ->line('• **Name:** '.($this->user->name ?? 'N/A').'')
            ->line('• **Phone:** '.($this->user->phone ?? 'N/A').'')
            ->line('• **IP Address:** '.($this->exchangeRequest && $this->exchangeRequest->ip_address ? $this->exchangeRequest->ip_address : ($this->withdrawalData['ip_address'] ?? 'N/A')).'')
            ->line('• **Wallet Balance:** '.number_format($this->user->wallet->holding_money ?? 0, 0).' IDR')
            ->line('')
            ->line('**Action Required:**')
            ->line('Please review this withdrawal request in your NOWPayments dashboard and take appropriate action.')
            ->line('')
            ->line('**Exchange Request ID:** '.($this->exchangeRequest && $this->exchangeRequest->id ? $this->exchangeRequest->id : 'N/A'));
    }

    public function toArray($notifiable)
    {
        return [
            'withdrawal_id' => $this->exchangeRequest && $this->exchangeRequest->id ? $this->exchangeRequest->id : null,
            'user_id' => $this->user->id,
            'amount' => $this->withdrawalData['requested_money'],
            'currency' => $this->withdrawalData['currency'],
            'address' => $this->withdrawalData['withdrawal_address'],
            'status' => $this->exchangeRequest && $this->exchangeRequest->status ? $this->exchangeRequest->status : 'failed',
        ];
    }
}
