<?php

namespace App\Services\Push;

use App\Enums\Push\NotificationEventEnum;
use App\Enums\Push\PushNotificationStatusEnum;
use App\Enums\Push\PushTargetTypeEnum;
use App\Enums\Push\PushTriggeredByEnum;
use App\Jobs\SendPushNotificationJob;
use App\Models\PushNotificationLog;
use App\Models\PushNotificationTemplate;
use App\Settings\PushSettings;

class PushNotificationService
{
    public function __construct(
        private readonly PushSettings $pushSettings,
        private readonly NotificationTemplateRenderer $renderer,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function dispatch(
        NotificationEventEnum $event,
        array $data = [],
        ?int $userId = null,
        ?string $imageUrl = null,
        ?int $sentByUserId = null,
    ): PushNotificationLog {
        $triggeredBy = $sentByUserId !== null
            ? PushTriggeredByEnum::ADMIN
            : PushTriggeredByEnum::SYSTEM;

        ['title' => $title, 'body' => $body] = $this->resolveTitleAndBody($event, $data);
        $payload = $this->buildPayload($event, $data);

        if ($this->pushSettings->enabled !== 1) {
            return $this->createLog(
                event: $event,
                title: $title,
                body: $body,
                payload: $payload,
                targetType: $userId !== null ? PushTargetTypeEnum::USER : PushTargetTypeEnum::ALL,
                targetUserId: $userId,
                triggeredBy: $triggeredBy,
                sentByUserId: $sentByUserId,
                status: PushNotificationStatusEnum::FAILED,
                imageUrl: $imageUrl,
                errorMessage: 'Push notifications are disabled',
            );
        }

        $log = $this->createLog(
            event: $event,
            title: $title,
            body: $body,
            payload: $payload,
            targetType: $userId !== null ? PushTargetTypeEnum::USER : PushTargetTypeEnum::ALL,
            targetUserId: $userId,
            triggeredBy: $triggeredBy,
            sentByUserId: $sentByUserId,
            status: PushNotificationStatusEnum::QUEUED,
            imageUrl: $imageUrl,
        );

        SendPushNotificationJob::dispatch($log->id)->onQueue('push-notifications');

        return $log;
    }

    /**
     * Resolve title and body together so the template is only fetched once.
     *
     * @param  array<string, mixed>  $data
     * @return array{title: string, body: string}
     */
    private function resolveTitleAndBody(NotificationEventEnum $event, array $data): array
    {
        if ($event === NotificationEventEnum::MANUAL_BROADCAST) {
            return [
                'title' => (string) ($data['title'] ?? ''),
                'body' => (string) ($data['body'] ?? ''),
            ];
        }

        $template = $this->findTemplate($event);

        return [
            'title' => $this->renderer->render($template->title_template, $data),
            'body' => $this->renderer->render($template->body_template, $data),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function buildPayload(NotificationEventEnum $event, array $data): array
    {
        $payload = ['type' => $event->value];

        if ($event === NotificationEventEnum::MANUAL_BROADCAST) {
            return $payload;
        }

        if (isset($data['order_id'])) {
            $payload['order_id'] = $data['order_id'];
            $payload['deep_link'] = '/shop/orders/'.$data['order_id'];
        }

        if (isset($data['vendor_order_id'])) {
            $payload['vendor_order_id'] = $data['vendor_order_id'];
            $payload['deep_link'] = '/seller/orders/'.$data['vendor_order_id'];
        }

        if (isset($data['order_number'])) {
            $payload['order_number'] = $data['order_number'];
        }

        if (isset($data['vendor_order_number'])) {
            $payload['vendor_order_number'] = $data['vendor_order_number'];
        }

        if (isset($data['post_id'])) {
            $payload['post_id'] = $data['post_id'];
        }

        if (isset($data['comment_id'])) {
            $payload['comment_id'] = $data['comment_id'];
        }

        if (isset($data['actor_id'])) {
            $payload['actor_id'] = $data['actor_id'];
        }

        if (isset($data['deep_link']) && is_string($data['deep_link']) && $data['deep_link'] !== '') {
            $payload['deep_link'] = $data['deep_link'];
        }

        return $payload;
    }

    private function findTemplate(NotificationEventEnum $event): PushNotificationTemplate
    {
        $template = PushNotificationTemplate::query()
            ->where('key', $event->value)
            ->where('is_active', true)
            ->first();

        if (! $template) {
            throw new \RuntimeException("Push notification template not found for event: {$event->value}");
        }

        return $template;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function createLog(
        NotificationEventEnum $event,
        string $title,
        string $body,
        array $payload,
        PushTargetTypeEnum $targetType,
        ?int $targetUserId,
        PushTriggeredByEnum $triggeredBy,
        ?int $sentByUserId,
        PushNotificationStatusEnum $status,
        ?string $imageUrl = null,
        ?string $errorMessage = null,
    ): PushNotificationLog {
        return PushNotificationLog::create([
            'template_key' => $event === NotificationEventEnum::MANUAL_BROADCAST ? null : $event->value,
            'title' => $title,
            'body' => $body,
            'data' => $payload,
            'image_url' => $imageUrl,
            'target_type' => $targetType,
            'target_user_id' => $targetUserId,
            'triggered_by' => $triggeredBy,
            'sent_by_user_id' => $sentByUserId,
            'status' => $status,
            'provider' => $this->pushSettings->provider ?? 'fcm',
            'error_message' => $errorMessage,
            'queued_at' => $status === PushNotificationStatusEnum::QUEUED ? now() : null,
        ]);
    }
}
