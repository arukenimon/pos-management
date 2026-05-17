<?php

namespace App\Notifications;

use App\Models\Shop;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Password;

class TeamInvitationNotification extends Notification
{
    public function __construct(
        private readonly Shop   $shop,
        private readonly string $role,
        private readonly string $inviterName,
        private readonly bool   $isNewUser,
    ) {}

    public function via(mixed $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(mixed $notifiable): MailMessage
    {
        $actionUrl = $this->isNewUser
            ? $this->passwordSetupUrl($notifiable)
            : url(route('dashboard'));

        return (new MailMessage)
            ->subject("You've been invited to join {$this->shop->name} on " . config('app.name'))
            ->view('emails.team-invitation', [
                'user'        => $notifiable,
                'shop'        => $this->shop,
                'role'        => $this->role,
                'inviterName' => $this->inviterName,
                'isNewUser'   => $this->isNewUser,
                'actionUrl'   => $actionUrl,
                'appName'     => config('app.name'),
            ]);
    }

    private function passwordSetupUrl(mixed $notifiable): string
    {
        $token = Password::broker()->createToken($notifiable);

        return url(route('password.reset', [
            'token' => $token,
            'email' => $notifiable->email,
        ], false));
    }
}
