<?php

namespace App\Notifications\SystemAlerts;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
use Illuminate\Notifications\Slack\SlackMessage;

class LoginAlert extends BaseSystemAlert
{
    /**
     * Create a new notification instance.
     */
    public function __construct(public User $user, public Carbon $time)
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
            ->text(__('alerts.new_login'))
            ->headerBlock(__('alerts.user_logged_in'))
            ->contextBlock(function (ContextBlock $block) {
                $block->text($this->time->diffForHumans());
            })
            ->sectionBlock(function (SectionBlock $block) {
                $block->field("*{$this->trans('terms.name')}:*\n{$this->user->name}")->markdown();
                $block->field("*{$this->trans('terms.username')}:*\n{$this->user->username}")->markdown();
            });
    }
}
