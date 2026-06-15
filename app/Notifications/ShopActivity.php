<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

/**
 * A single shop-activity notification (stock moved, product added, sale made…).
 *
 * Persists to the database (for the notification bell) and broadcasts over the
 * user's private channel (for the live toast + bell badge). Queued, so the
 * triggering request stays fast — processed by `php artisan queue:work`.
 */
class ShopActivity extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @param  string  $kind     Machine type, e.g. "stock", "product", "sale".
     * @param  string  $title    Short headline shown in the bell + toast.
     * @param  string  $message  One-line detail.
     * @param  array   $meta     Extra payload (ids, links) for the frontend.
     */
    public function __construct(
        public string $kind,
        public string $title,
        public string $message,
        public array $meta = [],
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /** Stored in the notifications table (read by the bell). */
    public function toArray(object $notifiable): array
    {
        return [
            'kind'    => $this->kind,
            'title'   => $this->title,
            'message' => $this->message,
            'meta'    => $this->meta,
        ];
    }

    /** Pushed live over the user's private channel. */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    /** Event name the frontend listens for (overrides the long default). */
    public function broadcastType(): string
    {
        return 'shop.activity';
    }
}
