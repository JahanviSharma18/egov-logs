<?php
// FILE LOCATION: app/Http/Controllers/LogController.php

namespace App\Http\Controllers;

use App\Models\LogEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LogController extends Controller
{
    /**
     * GET /logs
     * Returns paginated, filtered, searchable logs to Logs/Index.jsx
     */
    public function index(Request $request): Response
    {
        $query = LogEntry::with('user:id,name')->latest();

        // ── Search by message, source, or IP ────────────────────
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('message',    'like', "%{$search}%")
                  ->orWhere('source',    'like', "%{$search}%")
                  ->orWhere('ip_address','like', "%{$search}%");
            });
        }

        // ── Filter by level ──────────────────────────────────────
        if ($level = $request->get('level')) {
            $query->where('level', $level);
        }

        // ── Filter by date range ─────────────────────────────────
        if ($from = $request->get('date_from')) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->get('date_to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        // ── Filter by source ─────────────────────────────────────
        if ($source = $request->get('source')) {
            $query->where('source', $source);
        }

        // ── Paginate 25 per page, keep filters in URL ────────────
        $logs = $query->paginate(25)->withQueryString();

        // ── Unique sources for filter dropdown ───────────────────
        $sources = LogEntry::select('source')
            ->whereNotNull('source')
            ->distinct()
            ->orderBy('source')
            ->pluck('source');

        // ── Summary counts for filter bar ────────────────────────
        $levelCounts = LogEntry::selectRaw('level, count(*) as count')
            ->groupBy('level')
            ->pluck('count', 'level');

        return Inertia::render('Logs/Index', [
            'logs'        => $logs,
            'sources'     => $sources,
            'levelCounts' => $levelCounts,
            'filters'     => $request->only(['search', 'level', 'date_from', 'date_to', 'source']),
        ]);
    }

    /**
     * GET /logs/export-csv
     * Streams a CSV download of filtered logs
     */
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

            // CSV headers
            fputcsv($handle, ['ID', 'Level', 'Message', 'Source', 'IP Address', 'URL', 'Method', 'Created At']);

            // Stream rows in chunks to avoid memory issues
            $query->chunk(500, function ($logs) use ($handle) {
                foreach ($logs as $log) {
                    fputcsv($handle, [
                        $log->id,
                        $log->level,
                        $log->message,
                        $log->source,
                        $log->ip_address,
                        $log->url,
                        $log->method,
                        $log->created_at->format('Y-m-d H:i:s'),
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    /**
     * Delete a specific log entry.
     */
    public function destroy(LogEntry $log)
    {
        $oldValues = $log->toArray();
        $log->delete();

        // Log this action
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