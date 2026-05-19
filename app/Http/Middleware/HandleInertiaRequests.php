<?php
// FILE LOCATION: app/Http/Middleware/HandleInertiaRequests.php
// This file already exists — REPLACE its contents

namespace App\Http\Middleware;

use App\Models\LogEntry;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Shared data — available on EVERY React page via usePage().props
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [

            // Auth user with roles
            'auth' => [
                'user' => $request->user() ? [
                    'id'    => $request->user()->id,
                    'name'  => $request->user()->name,
                    'email' => $request->user()->email,
                    'roles' => $request->user()->getRoleNames(), // Spatie roles
                ] : null,
            ],

            // Recent critical/security alerts — for NotificationBell on every page
            // Only runs when user is logged in
            'recentAlerts' => function () use ($request) {
                if (!$request->user()) return [];

                return LogEntry::whereIn('level', ['critical', 'security'])
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(fn($log) => [
                        'id'      => $log->id,
                        'level'   => $log->level,
                        'source'  => $log->source ?? 'System',
                        'message' => $log->message,
                        'time'    => $log->created_at->diffForHumans(),
                    ])
                    ->toArray();
            },

            // Flash messages for toast notifications
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error'   => fn() => $request->session()->get('error'),
            ],
        ]);
    }
}