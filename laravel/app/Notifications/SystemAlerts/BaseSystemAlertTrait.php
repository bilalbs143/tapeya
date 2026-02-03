<?php

namespace App\Notifications\SystemAlerts;

use App\Models\CustomerInquiry;
use App\Models\CustomerInquiryReply;
use App\Models\ExchangeRequest;
use App\Models\QuickAccountInquiry;
use App\Models\User;
use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
use Illuminate\Notifications\Slack\SlackMessage;

trait BaseSystemAlertTrait
{
    public function userSlackAlert(
        User $user,
        string $alertMessage,
        ?string $actorName = null,
        ?string $actionMessage = ''
    ) {
        return (new SlackMessage)
            ->text(__("alerts.{$alertMessage}"))
            ->headerBlock(__("alerts.{$alertMessage}"))
            ->contextBlock(function (ContextBlock $block) use ($actorName, $actionMessage, $user) {
                $block->text(__("messages.{$actionMessage}", ['name' => $actorName]));
                $block->text($actionMessage === 'updated_by' ? $user->updated_at->diffForHumans() : $user->created_at->diffForHumans());
            })
            ->sectionBlock(function (SectionBlock $block) use ($user) {
                $block->field("*{$this->trans('terms.name')}:*\n{$user->name}")->markdown();
                $block->field("*{$this->trans('terms.username')}:*\n{$user->username}")->markdown();
            });
    }

    public function exchangeRequestSlackAlert(
        ExchangeRequest $exchangeRequest,
        string $alertMessage,
        ?string $actorName = null,
        ?string $actionMessage = ''
    ) {
        return (new SlackMessage)
            ->text(__("alerts.{$alertMessage}"))
            ->headerBlock(__("alerts.{$alertMessage}"))
            ->contextBlock(function (ContextBlock $block) use ($actorName, $actionMessage, $exchangeRequest) {
                $block->text(__("messages.{$actionMessage}", ['name' => $actorName]));
                $block->text($exchangeRequest->created_at->diffForHumans());
            })
            ->sectionBlock(function (SectionBlock $block) use ($exchangeRequest) {
                $block->field("*{$this->trans('terms.type')}:*\n{$exchangeRequest->type?->label()}")->markdown();
                $block->field("*{$this->trans('terms.amount')}:*\n{$exchangeRequest->requested_money}")->markdown();
            });
    }

    public function quickAccountInquirySlackAlert(
        QuickAccountInquiry $quickAccountInquiry,
        string $alertMessage,
        ?string $actorName = null,
        ?string $actionMessage = ''
    ) {
        return (new SlackMessage)
            ->text(__("alerts.{$alertMessage}"))
            ->headerBlock(__("alerts.{$alertMessage}"))
            ->contextBlock(function (ContextBlock $block) use ($actorName, $actionMessage, $quickAccountInquiry) {
                $block->text(__("messages.{$actionMessage}", ['name' => $actorName]));
                $block->text($quickAccountInquiry->created_at->diffForHumans());
            })
            ->sectionBlock(function (SectionBlock $block) use ($quickAccountInquiry) {
                $block->field("*{$this->trans('terms.name')}:*\n{$quickAccountInquiry->name}")->markdown();
                $block->field("*{$this->trans('terms.phone')}:*\n{$quickAccountInquiry->phone}")->markdown();
            })
            ->sectionBlock(function (SectionBlock $block) use ($quickAccountInquiry) {
                $block->field("*{$this->trans('terms.message')}:*\n{$quickAccountInquiry->message}")->markdown();
            });
    }

    public function customerInquirySlackAlert(
        CustomerInquiry $customerInquiry,
        string $alertMessage,
        ?string $actorName = null,
        ?string $actionMessage = ''
    ) {
        return (new SlackMessage)
            ->text(__("alerts.{$alertMessage}"))
            ->headerBlock(__("alerts.{$alertMessage}"))
            ->contextBlock(function (ContextBlock $block) use ($actorName, $actionMessage, $customerInquiry) {
                $block->text(__("messages.{$actionMessage}", ['name' => $actorName]));
                $block->text($customerInquiry->created_at->diffForHumans());
            })
            ->sectionBlock(function (SectionBlock $block) use ($customerInquiry) {
                $block->field("*{$this->trans('terms.category')}:*\n{$customerInquiry->category?->label()}")->markdown();
                $block->field("*{$this->trans('terms.title')}:*\n{$customerInquiry->title}")->markdown();
            })
            ->sectionBlock(function (SectionBlock $block) use ($customerInquiry) {
                $block->field("*{$this->trans('terms.message')}:*\n{$customerInquiry->content}")->markdown();
            });
    }

    public function customerInquiryReplySlackAlert(
        CustomerInquiry $customerInquiry,
        string $alertMessage,
        ?string $actorName = null,
        ?string $actionMessage = '',
        ?CustomerInquiryReply $customerInquiryReply = null,
    ) {
        return (new SlackMessage)
            ->text(__("alerts.{$alertMessage}"))
            ->headerBlock(__("alerts.{$alertMessage}"))
            ->contextBlock(function (ContextBlock $block) use ($actorName, $actionMessage, $customerInquiry) {
                $block->text(__("messages.{$actionMessage}", ['name' => $actorName]));
                $block->text($customerInquiry?->reply->updated_at->diffForHumans());
            })
            ->sectionBlock(function (SectionBlock $block) use ($customerInquiry) {
                $block->field("*{$this->trans('terms.category')}:*\n{$customerInquiry->category?->label()}")->markdown();
                $block->field("*{$this->trans('terms.title')}:*\n{$customerInquiry->title}")->markdown();
            })
            ->sectionBlock(function (SectionBlock $block) use ($customerInquiry) {
                $block->field("*{$this->trans('terms.message')}:*\n{$customerInquiry->content}")->markdown();
            })
            ->sectionBlock(function (SectionBlock $block) use ($customerInquiryReply) {
                $block->field("*{$this->trans('terms.reply')}:*\n{$customerInquiryReply->content}")->markdown();
            });
    }
}
