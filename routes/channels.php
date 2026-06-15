<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Authorization callbacks for private/presence channels. Return true to
| allow the authenticated user to listen on the channel.
|
*/

// Private per-user channel. ShopActivity notifications broadcast here, so each
// member only ever receives notifications addressed to them.
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
