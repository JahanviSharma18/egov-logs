<?php
// FILE LOCATION: app/Http/Controllers/NotificationRuleController.php

namespace App\Http\Controllers;

use App\Models\NotificationRule;
use App\Models\AuditTrail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationRuleController extends Controller
{
    /**
     * GET /alerts
     * Lists all notification rules for the Alerts page.
     */
    public function index(): Response
    {
        $rules = NotificationRule::orderBy('created_at', 'desc')->get();

        return Inertia::render('Alerts/Index', [
            'rules' => $rules,
        ]);
    }

    /**
     * POST /alerts
     * Creates a new notification rule.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'trigger_level'    => 'required|in:info,warning,error,critical,security,audit,debug',
            'channel'          => 'required|in:mail,slack',
            'recipient'        => 'required|string|max:500',
            'cooldown_minutes' => 'required|integer|min:1|max:1440',
        ]);

        $rule = NotificationRule::create(array_merge($validated, ['is_active' => true]));

        // Log audit trail
        AuditTrail::create([
            'user_id'        => $request->user()->id,
            'action'         => 'created_rule',
            'auditable_type' => NotificationRule::class,
            'auditable_id'   => $rule->id,
            'new_values'     => $rule->toArray(),
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->userAgent(),
        ]);

        return back()->with('success', 'Notification rule created.');
    }

    /**
     * PATCH /alerts/{rule}/toggle
     * Toggles the is_active flag on a rule.
     */
    public function toggle(Request $request, NotificationRule $rule): RedirectResponse
    {
        $oldValues = ['is_active' => $rule->is_active];
        $rule->update(['is_active' => !$rule->is_active]);

        // Log audit trail
        AuditTrail::create([
            'user_id'        => $request->user()->id,
            'action'         => 'toggled_rule',
            'auditable_type' => NotificationRule::class,
            'auditable_id'   => $rule->id,
            'old_values'     => $oldValues,
            'new_values'     => ['is_active' => $rule->is_active],
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->userAgent(),
        ]);

        $status = $rule->is_active ? 'enabled' : 'disabled';

        return back()->with('success', "Rule \"{$rule->name}\" {$status}.");
    }

    /**
     * DELETE /alerts/{rule}
     * Deletes a notification rule.
     */
    public function destroy(Request $request, NotificationRule $rule): RedirectResponse
    {
        $oldValues = $rule->toArray();
        $rule->delete();

        // Log audit trail
        AuditTrail::create([
            'user_id'        => $request->user()->id,
            'action'         => 'deleted_rule',
            'auditable_type' => NotificationRule::class,
            'auditable_id'   => $rule->id,
            'old_values'     => $oldValues,
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->userAgent(),
        ]);

        return back()->with('success', 'Notification rule deleted.');
    }
}
