<?php
// FILE LOCATION: app/Http/Controllers/LogController.php

namespace App\Http\Controllers;

use App\Models\LogEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = LogEntry::with('user:id,name')->latest();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('message',     'like', "%{$search}%")
                  ->orWhere('source',    'like', "%{$search}%")
                  ->orWhere('ip_address','like', "%{$search}%");
            });
        }

        if ($level = $request->get('level')) {
            $query->where('level', $level);
        }

        if ($from = $request->get('date_from')) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->get('date_to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        if ($source = $request->get('source')) {
            $query->where('source', $source);
        }

        $logs = $query->paginate(25)->withQueryString();

        // FIX 7: Cache sources list (changes rarely) for 5 minutes
        $sources = Cache::remember('log_sources', 300, function () {
            return LogEntry::select('source')
                ->whereNotNull('source')
                ->distinct()
                ->orderBy('source')
                ->pluck('source');
        });

        // FIX 8: Cache level counts for 2 minutes — single query replacing 7 separate counts
        $levelCounts = Cache::remember('log_level_counts', 120, function () {
            return LogEntry::selectRaw('level, count(*) as count')
                ->groupBy('level')
                ->pluck('count', 'level');
        });

        return Inertia::render('Logs/Index', [
            'logs'        => $logs,
            'sources'     => $sources,
            'levelCounts' => $levelCounts,
            'filters'     => $request->only(['search', 'level', 'date_from', 'date_to', 'source']),
        ]);
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $query = LogEntry::latest();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('message',    'like', "%{$search}%")
                  ->orWhere('source',    'like', "%{$search}%")
                  ->orWhere('ip_address','like', "%{$search}%");
            });
        }
        if ($level = $request->get('level'))     $query->where('level', $level);
        if ($from  = $request->get('date_from')) $query->whereDate('created_at', '>=', $from);
        if ($to    = $request->get('date_to'))   $query->whereDate('created_at', '<=', $to);

        $filename = 'govtrace-logs-' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Level', 'Message', 'Source', 'IP Address', 'URL', 'Method', 'Created At']);
            $query->chunk(500, function ($logs) use ($handle) {
                foreach ($logs as $log) {
                    fputcsv($handle, [
                        $log->id, $log->level, $log->message, $log->source,
                        $log->ip_address, $log->url, $log->method,
                        $log->created_at->format('Y-m-d H:i:s'),
                    ]);
                }
            });
            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    public function destroy(LogEntry $log)
    {
        $oldValues = $log->toArray();
        $log->delete();

        // Bust caches so counts stay accurate after deletion
        Cache::forget('log_level_counts');
        Cache::forget('log_sources');
        Cache::forget('dashboard_stats');
        Cache::forget('dashboard_pie');

        \App\Models\AuditTrail::create([
            'user_id'        => request()->user()->id,
            'action'         => 'deleted_log_entry',
            'auditable_type' => LogEntry::class,
            'auditable_id'   => $log->id,
            'old_values'     => $oldValues,
            'ip_address'     => request()->ip(),
            'user_agent'     => request()->userAgent(),
        ]);

        return back()->with('success', 'Log entry deleted successfully.');
    }
}
