<?php
// FILE LOCATION: app/Http/Controllers/ReportController.php

namespace App\Http\Controllers;

use App\Models\LogEntry;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * GET /reports
     * Render the reports generation page.
     */
    public function index(): Response
    {
        // Get unique sources and levels for the filter dropdowns
        $sources = LogEntry::select('source')->distinct()->pluck('source');
        $levels  = LogEntry::select('level')->distinct()->pluck('level');

        return Inertia::render('Reports/Index', [
            'sources' => $sources,
            'levels'  => $levels,
        ]);
    }

    /**
     * POST /reports/export
     * Generate PDF or CSV report based on filters.
     */
    public function export(Request $request)
    {
        $request->validate([
            'format'     => 'required|in:pdf,csv',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
            'level'      => 'nullable|string',
            'source'     => 'nullable|string',
        ]);

        $query = LogEntry::query()->latest();

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        if ($request->filled('level') && $request->level !== 'all') {
            $query->where('level', $request->level);
        }
        if ($request->filled('source') && $request->source !== 'all') {
            $query->where('source', $request->source);
        }

        $logs = $query->get();

        // ─── PDF Export ───
        if ($request->format === 'pdf') {
            $pdf = Pdf::loadView('reports.pdf', [
                'logs'       => $logs,
                'start_date' => $request->start_date,
                'end_date'   => $request->end_date,
                'level'      => $request->level,
                'source'     => $request->source,
                'user'       => $request->user(),
            ]);

            // Log the action
            $this->logAudit('exported_pdf_report', $request);

            return $pdf->download('govtrace-report-' . now()->format('Y-m-d') . '.pdf');
        }

        // ─── CSV Export ───
        $this->logAudit('exported_csv_report', $request);

        return new StreamedResponse(function () use ($logs) {
            $handle = fopen('php://output', 'w');
            
            // CSV Headers
            fputcsv($handle, ['ID', 'Level', 'Source', 'Message', 'IP Address', 'Timestamp']);

            foreach ($logs as $log) {
                fputcsv($handle, [
                    $log->id,
                    strtoupper($log->level),
                    $log->source,
                    $log->message,
                    $log->ip_address,
                    $log->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="govtrace-report-' . now()->format('Y-m-d') . '.csv"',
        ]);
    }

    private function logAudit(string $action, Request $request): void
    {
        AuditTrail::create([
            'user_id'    => $request->user()->id,
            'action'     => $action,
            'new_values' => $request->only(['start_date', 'end_date', 'level', 'source']),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
