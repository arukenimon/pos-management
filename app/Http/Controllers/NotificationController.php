<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /** Mark a single notification as read. */
    public function markRead(Request $request, string $id)
    {
        $request->user()
            ->notifications()
            ->whereKey($id)
            ->update(['read_at' => now()]);

        return back();
    }

    /** Mark all of the current user's notifications as read. */
    public function markAllRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }
}
