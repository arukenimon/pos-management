<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PlatformStatusRequest;
use App\Models\PlatformAuditLog;
use App\Models\Shop;
use App\Models\User;
use App\Services\PlatformAdministration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlatformController extends Controller
{
    public function overview(): Response
    {
        return Inertia::render('SuperAdmin/Overview', [
            'metrics' => [
                'shops' => Shop::count(),
                'activeShops' => Shop::whereNull('suspended_at')->count(),
                'suspendedShops' => Shop::whereNotNull('suspended_at')->count(),
                'newShops' => Shop::where('created_at', '>=', now()->subDays(30))->count(),
                'users' => User::count(),
                'activeUsers' => User::whereNull('suspended_at')->count(),
                'suspendedUsers' => User::whereNotNull('suspended_at')->count(),
                'newUsers' => User::where('created_at', '>=', now()->subDays(30))->count(),
            ],
            'newestShops' => Shop::latest('id')->limit(5)->get()->map(fn (Shop $shop) => $this->shopSummary($shop)),
            'recentActions' => PlatformAuditLog::latest('id')->limit(5)->get(),
        ]);
    }

    public function shops(Request $request): Response
    {
        $filters = $this->directoryFilters($request);
        $query = Shop::query()->withCount('members');
        if ($search = $filters['q'] ?? null) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('slug', 'like', "%{$search}%"));
        }
        $this->filterStatus($query, $filters['status'] ?? null);

        return Inertia::render('SuperAdmin/Shops', [
            'filters' => $filters,
            'shops' => $query->latest('id')->paginate(25)->withQueryString()->through(fn (Shop $shop) => [
                ...$this->shopSummary($shop), 'members_count' => $shop->members_count,
            ]),
        ]);
    }

    public function shop(Shop $platformShop): Response
    {
        // Remove only the tenant scope for these explicitly authorized operational counts.
        $platformShop->loadCount([
            'members',
            'products' => fn ($q) => $q->withoutGlobalScope('shop'),
            'orders' => fn ($q) => $q->withoutGlobalScope('shop'),
        ]);

        return Inertia::render('SuperAdmin/Shop', [
            'shop' => [
                ...$this->shopSummary($platformShop),
                'suspension_reason' => $platformShop->suspension_reason,
                'members_count' => $platformShop->members_count,
                'products_count' => $platformShop->products_count,
                'orders_count' => $platformShop->orders_count,
            ],
            'members' => $platformShop->members()->orderBy('name')->paginate(25)->withQueryString()->through(fn (User $user) => [
                ...$this->userSummary($user), 'shop_role' => $user->pivot->role,
            ]),
        ]);
    }

    public function users(Request $request): Response
    {
        $filters = $this->directoryFilters($request, true);
        $query = User::query()->withCount('shops');
        if ($search = $filters['q'] ?? null) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
        }
        $this->filterStatus($query, $filters['status'] ?? null);
        if (($filters['verification'] ?? null) === 'verified') {
            $query->whereNotNull('email_verified_at');
        } elseif (($filters['verification'] ?? null) === 'unverified') {
            $query->whereNull('email_verified_at');
        }

        return Inertia::render('SuperAdmin/Users', [
            'filters' => $filters,
            'users' => $query->latest('id')->paginate(25)->withQueryString()->through(fn (User $user) => [
                ...$this->userSummary($user), 'shops_count' => $user->shops_count,
            ]),
        ]);
    }

    public function user(User $platformUser): Response
    {
        return Inertia::render('SuperAdmin/User', [
            'account' => [...$this->userSummary($platformUser), 'suspension_reason' => $platformUser->suspension_reason],
            'memberships' => $platformUser->shops()->orderBy('name')->paginate(25)->withQueryString()->through(fn (Shop $shop) => [
                ...$this->shopSummary($shop), 'shop_role' => $shop->pivot->role,
            ]),
        ]);
    }

    public function shopStatus(PlatformStatusRequest $request, Shop $platformShop, PlatformAdministration $administration): RedirectResponse
    {
        $changed = $administration->setSuspended($platformShop, $request->validated('status') === 'suspended', $request->user(), $request->validated('reason'));

        return back()->with('success', $changed ? 'Shop status updated and recorded in the audit log.' : 'Shop already has this status.');
    }

    public function userStatus(PlatformStatusRequest $request, User $platformUser, PlatformAdministration $administration): RedirectResponse
    {
        $changed = $administration->setSuspended($platformUser, $request->validated('status') === 'suspended', $request->user(), $request->validated('reason'));

        return back()->with('success', $changed ? 'Account status updated and recorded in the audit log.' : 'Account already has this status.');
    }

    public function audit(Request $request): Response
    {
        $filters = $request->validate([
            'actor' => ['nullable', 'string', 'max:255'],
            'target' => ['nullable', 'string', 'max:255'],
            'action' => ['nullable', 'in:shop.suspended,shop.restored,user.suspended,user.restored,super_admin.granted,super_admin.revoked'],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', ...($request->filled('from') ? ['after_or_equal:from'] : [])],
        ]);
        $query = PlatformAuditLog::query();
        foreach (['actor', 'target'] as $field) {
            if ($value = $filters[$field] ?? null) {
                $query->where(fn ($q) => $q->where("{$field}->name", 'like', "%{$value}%")
                    ->orWhere("{$field}->email", 'like', "%{$value}%")
                    ->orWhere("{$field}->slug", 'like', "%{$value}%"));
            }
        }
        if ($action = $filters['action'] ?? null) {
            $query->where('action', $action);
        }
        if ($from = $filters['from'] ?? null) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $filters['to'] ?? null) {
            $query->whereDate('created_at', '<=', $to);
        }

        return Inertia::render('SuperAdmin/Audit', [
            'filters' => $filters,
            'entries' => $query->latest('id')->paginate(25)->withQueryString(),
        ]);
    }

    private function directoryFilters(Request $request, bool $users = false): array
    {
        return $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:active,suspended'],
            ...($users ? ['verification' => ['nullable', 'in:verified,unverified']] : []),
        ]);
    }

    private function filterStatus($query, ?string $status): void
    {
        if ($status === 'active') {
            $query->whereNull('suspended_at');
        } elseif ($status === 'suspended') {
            $query->whereNotNull('suspended_at');
        }
    }

    private function shopSummary(Shop $shop): array
    {
        return $shop->only(['id', 'name', 'slug', 'created_at', 'suspended_at']);
    }

    private function userSummary(User $user): array
    {
        return $user->only(['id', 'name', 'email', 'created_at', 'email_verified_at', 'suspended_at', 'is_super_admin']);
    }
}
