<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\TeamInvitationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function index()
    {
        $shop    = app('current_shop');
        $members = $shop->members()->get()->map(fn ($u) => [
            'id'    => $u->id,
            'name'  => $u->name,
            'email' => $u->email,
            'role'  => $u->pivot->role,
        ]);

        return Inertia::render('Auth/Admin/Settings/Team', [
            'shop'    => ['id' => $shop->id, 'name' => $shop->name, 'slug' => $shop->slug],
            'members' => $members,
        ]);
    }

    public function invite(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'role'  => 'required|in:owner,manager,cashier',
        ]);

        $shop     = app('current_shop');
        $inviter  = $request->user();

        $existingUser = User::where('email', $request->email)->first();
        $isNewUser    = $existingUser === null;

        $user = $existingUser ?? User::create([
            'name'     => Str::before($request->email, '@'),
            'email'    => $request->email,
            'password' => Hash::make(Str::random(32)),
            'role'     => 'cashier',
        ]);

        if ($shop->hasMember($user)) {
            $shop->members()->updateExistingPivot($user->id, ['role' => $request->role]);
        } else {
            $shop->members()->attach($user->id, ['role' => $request->role]);
        }

        $user->notify(new TeamInvitationNotification(
            shop:        $shop,
            role:        $request->role,
            inviterName: $inviter->name,
            isNewUser:   $isNewUser,
        ));

        $verb = $isNewUser ? 'invited' : 'added';

        return back()->with('success', "{$user->name} has been {$verb} to the team as {$request->role}. An invitation email has been sent.");
    }

    public function updateRole($shop, Request $request, int $userId)
    {
        $request->validate(['role' => 'required|in:owner,manager,cashier']);

        $shop = app('current_shop');
        $shop->members()->updateExistingPivot($userId, ['role' => $request->role]);

        return back()->with('success', 'Role updated.');
    }

    public function remove($shop, int $userId)
    {
        $shop    = app('current_shop');
        $current = request()->user();

        if ($current->id === $userId) {
            return back()->withErrors(['error' => 'You cannot remove yourself from the shop.']);
        }

        $shop->members()->detach($userId);

        return back()->with('success', 'Member removed from the shop.');
    }
}
