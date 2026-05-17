<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmailNotification extends VerifyEmail
{
    public function toMail(mixed $notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verify Your Email Address – ' . config('app.name'))
            ->view('emails.verify-email', [
                'user'            => $notifiable,
                'verificationUrl' => $verificationUrl,
                'appName'         => config('app.name'),
                'expiresInMinutes' => config('auth.verification.expire', 60),
            ]);
    }
}
