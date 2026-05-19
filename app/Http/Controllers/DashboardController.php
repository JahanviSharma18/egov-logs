<?php
// FILE LOCATION: app/Http/Controllers/DashboardController.php

namespace App\Http\Controllers;

use App\Models\AuditTrail;
use App\Models\LogEntry;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // ── Stat cards ───────────────────────────────────────────
        $total    = LogEntry::count();
        $critical = LogEntry::whereIn('level', ['critical', 'security'])->count();
        $warnings = LogEntry::where('level', 'warning')->count();
        $errors   = LogEntry::where('level', 'error')->count();
        $today    = LogEntry::today()->count();

        // ── 7-day activity chart ─────────────────────────────────
        $activityData = collect(range(6, 0))->map(function ($daysAgo) {
            $date = Carbon::now()->subDays($daysAgo);

            $logs     = LogEntry::whereDate('created_at', $date)->count();
            $critical = LogEntry::whereDate('created_at', $date)
                ->whereIn('level', ['critical', 'security'])
                ->count();

            return [
                'day'      => $date->format('D'), // Mon, Tue...
                'date'     => $date->format('M d'),
                'logs'     => $logs,
                'critical' => $critical,
            ];
        })->values();

        // ── Pie chart — breakdown by level ───────────────────────
        $levels   = ['info', 'warning', 'error', 'critical', 'security', 'audit', 'debug'];
        $pieData  = collect($levels)->map(function ($level) use ($total) {
            $count = LogEntry::where('level', $level)->count();
            return [
                'name'  => ucfirst($level),
                'value' => $total > 0 ? round(($count / $total) * 100) : 0,
                'count' => $count,
            ];
        })->filter(fn($d) => $d['count'] > 0)->values();

        // ── Recent logs (6 most recent) ──────────────────────────
        $recentLogs = LogEntry::with('user:id,name')
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

        // ── Recent audit events (for activity feed) ──────────────
        $recentAudit = AuditTrail::with('user:id,name')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($a) => [
                'action'  => $a->action,
                'user'    => $a->user?->name ?? 'System',
                'time'    => $a->created_at->diffForHumans(),
            ]);

        return Inertia::render('Dashboard', [
            'stats' => [
                'total'       => number_format($total),
                'critical'    => number_format($critical),
                'warnings'    => number_format($warnings),
                'errors'      => number_format($errors),
                'today'       => number_format($today),
                'uptime'      => '99.8%', // Can wire to real monitoring later
                'total_users' => \App\Models\User::count(),
            ],
            'activityData' => $activityData,
            'pieData'      => $pieData,
            'recentLogs'   => $recentLogs,
            'recentAudit'  => $recentAudit,
        ]);
    }
}