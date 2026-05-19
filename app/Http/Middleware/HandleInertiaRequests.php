<?php
// FILE LOCATION: app/Http/Middleware/HandleInertiaRequests.php

namespace App\Http\Middleware;

use App\Models\LogEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [

            'auth' => [
                'user' => $request->user() ? [
                    'id'    => $request->user()->id,
                    'name'  => $request->user()->name,
                    'email' => $request->user()->email,
                    'roles' => $request->user()->getRoleNames(),
                ] : null,
            ],

            // FIX 1: Cache the alerts query for 60 seconds instead of hitting DB on every page load
            'recentAlerts' => function () use ($request) {
                if (!$request->user()) return [];

                $userId = $request->user()->id;

                return Cache::remember("recent_alerts_{$userId}", 60, function () {
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
                });
            },

            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error'   => fn() => $request->session()->get('error'),
            ],
        ]);
    }
}
