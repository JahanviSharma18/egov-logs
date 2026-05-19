<?php
// FILE LOCATION: app/Http/Controllers/DashboardController.php

namespace App\Http\Controllers;

use App\Models\AuditTrail;
use App\Models\LogEntry;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // FIX 2: Cache heavy dashboard aggregates for 2 minutes.
        // Stats don't need to be live — the WebSocket handles real-time updates.
        $stats = Cache::remember('dashboard_stats', 120, function () {
            // FIX 3: Single query for all level counts instead of 4 separate COUNT queries
            $levelCounts = LogEntry::selectRaw('level, count(*) as count')
                ->groupBy('level')
                ->pluck('count', 'level');

            $total    = $levelCounts->sum();
            $critical = ($levelCounts->get('critical', 0)) + ($levelCounts->get('security', 0));
            $warnings = $levelCounts->get('warning', 0);
            $errors   = $levelCounts->get('error', 0);
            $today    = LogEntry::today()->count();

            return [
                'total'       => number_format($total),
                'critical'    => number_format($critical),
                'warnings'    => number_format($warnings),
                'errors'      => number_format($errors),
                'today'       => number_format($today),
                'uptime'      => '99.8%',
                'total_users' => \App\Models\User::count(),
            ];
        });

        // FIX 4: Cache 7-day activity chart data for 10 minutes (changes slowly)
        $activityData = Cache::remember('dashboard_activity', 600, function () {
            return collect(range(6, 0))->map(function ($daysAgo) {
                $date = Carbon::now()->subDays($daysAgo);

                // FIX 5: Single query per day using groupBy instead of 2 queries
                $dayCounts = LogEntry::whereDate('created_at', $date)
                    ->selectRaw('level, count(*) as count')
                    ->groupBy('level')
                    ->pluck('count', 'level');

                $logs     = $dayCounts->sum();
                $critical = ($dayCounts->get('critical', 0)) + ($dayCounts->get('security', 0));

                return [
                    'day'      => $date->format('D'),
                    'date'     => $date->format('M d'),
                    'logs'     => $logs,
                    'critical' => $critical,
                ];
            })->values();
        });

        // FIX 6: Cache pie chart data for 10 minutes
        $pieData = Cache::remember('dashboard_pie', 600, function () {
            $levels = ['info', 'warning', 'error', 'critical', 'security', 'audit', 'debug'];

            // Single query for all level counts
            $levelCounts = LogEntry::selectRaw('level, count(*) as count')
                ->groupBy('level')
                ->pluck('count', 'level');

            $total = $levelCounts->sum();

            return collect($levels)->map(function ($level) use ($levelCounts, $total) {
                $count = $levelCounts->get($level, 0);
                return [
                    'name'  => ucfirst($level),
                    'value' => $total > 0 ? round(($count / $total) * 100) : 0,
                    'count' => $count,
                ];
            })->filter(fn($d) => $d['count'] > 0)->values();
        });

        // Recent logs — short cache (30s), these should feel relatively fresh
        $recentLogs = Cache::remember('dashboard_recent_logs', 30, function () {
            return LogEntry::with('user:id,name')
                ->latest()
                ->take(6)
                ->get()
                ->map(fn($log) => [
                    'id'      => $log->id,
                    'level'   => $log->level,
                    'source'  => $log->source ?? 'System',
                    'message' => $log->message,
                    'time'    => $log->created_at->diffForHumans(),
                ]);
        });

        // Audit feed — cache for 60s
        $recentAudit = Cache::remember('dashboard_recent_audit', 60, function () {
            return AuditTrail::with('user:id,name')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($a) => [
                    'action' => $a->action,
                    'user'   => $a->user?->name ?? 'System',
                    'time'   => $a->created_at->diffForHumans(),
                ]);
        });

        return Inertia::render('Dashboard', [
            'stats'        => $stats,
            'activityData' => $activityData,
            'pieData'      => $pieData,
            'recentLogs'   => $recentLogs,
            'recentAudit'  => $recentAudit,
        ]);
    }
}
