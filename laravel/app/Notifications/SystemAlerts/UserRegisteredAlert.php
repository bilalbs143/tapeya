<?php

namespace App\Notifications\SystemAlerts;

use App\Models\User;
use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
use Illuminate\Notifications\Slack\SlackMessage;

class UserRegisteredAlert extends BaseSystemAlert
{
    /**
     * Create a new notification instance.
     */
    public function __construct(public User $user)
    {
        //
    }

    public function getObject(): User
    {
        return $this->user;
    }

    public function toSlack(User $notifiable)
    {
        return (new SlackMessage)
            ->text(__('alerts.new_user_registered'))
            ->headerBlock(__('alerts.new_user_registered'))
            ->contextBlock(function (ContextBlock $block) {
                $block->text($this->user->created_at->diffForHumans());
            })
            ->sectionBlock(function (SectionBlock $block) {
                $block->field("*{$this->trans('terms.name')}:*\n{$this->user->name}")->markdown();
                $block->field("*{$this->trans('terms.username')}:*\n{$this->user->username}")->markdown();
            });
    }
}
