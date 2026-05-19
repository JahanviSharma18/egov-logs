<?php

namespace App\Http\Controllers;

use App\Models\AuditTrail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * GET /roles
     */
    public function index(): Response
    {
        // Load roles with the count of users who have them
        $roles = Role::withCount('users')->latest()->get();

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
        ]);
    }

    /**
     * POST /roles
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
        ]);

        $role = Role::create(['name' => strtolower($validated['name'])]);

        AuditTrail::create([
            'user_id'        => $request->user()->id,
            'action'         => 'created_custom_role',
            'auditable_type' => Role::class,
            'auditable_id'   => $role->id,
            'new_values'     => $role->toArray(),
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->userAgent(),
        ]);

        return back()->with('success', 'Custom role created successfully.');
    }

    /**
     * DELETE /roles/{role}
     */
    public function destroy(Request $request, Role $role): RedirectResponse
    {
        // Prevent deleting built-in roles
        $protected = ['admin', 'analyst', 'viewer'];
        
        if (in_array($role->name, $protected)) {
            return back()->with('error', 'Cannot delete system-protected roles.');
        }

        $oldValues = $role->toArray();
        $role->delete();

        AuditTrail::create([
            'user_id'        => $request->user()->id,
            'action'         => 'deleted_custom_role',
            'auditable_type' => Role::class,
            'auditable_id'   => $role->id,
            'old_values'     => $oldValues,
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->userAgent(),
        ]);

        return back()->with('success', 'Role deleted successfully.');
    }
}
