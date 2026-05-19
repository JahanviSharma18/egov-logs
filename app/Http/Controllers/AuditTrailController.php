<?php
// FILE LOCATION: app/Http/Controllers/AuditTrailController.php

namespace App\Http\Controllers;

use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditTrailController extends Controller
{
    /**
     * GET /audit
     * Lists the audit trail with search and filtering.
     */
    public function index(Request $request): Response
    {
        $query = AuditTrail::with('user:id,name,email')
            ->latest();

        // ── Search by user, action, or model ──
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('auditable_type', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // ── Filter by action type ──
        if ($action = $request->input('action')) {
            $query->where('action', $action);
        }

        $trails = $query->paginate(20)->withQueryString();

        // Pass available actions for the filter dropdown
        $actions = AuditTrail::select('action')->distinct()->pluck('action');

        return Inertia::render('Audit/Index', [
            'trails'  => $trails,
            'filters' => $request->only(['search', 'action']),
            'actions' => $actions,
        ]);
    }
}
