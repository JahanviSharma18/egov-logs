<?php
// FILE LOCATION: app/Http/Controllers/UserController.php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AuditTrail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * GET /users
     * Lists all users with their roles.
     */
    public function index(): Response
    {
        $users = User::with('roles')
            ->latest()
            ->get()
            ->map(fn($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'roles'      => $u->roles->pluck('name'),
                'created_at' => $u->created_at->diffForHumans(),
            ]);

        $roles = Role::orderBy('name')->pluck('name');

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    /**
     * POST /users/{user}/roles
     * Assigns a role to a user (replaces existing roles).
     */
    public function assignRole(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'role' => 'required|string|exists:roles,name',
        ]);

        $oldRoles = $user->roles->pluck('name')->toArray();
        
        // syncRoles replaces all existing roles with the new one
        $user->syncRoles([$validated['role']]);

        // Log audit trail
        AuditTrail::create([
            'user_id'        => $request->user()->id,
            'action'         => 'assigned_role',
            'auditable_type' => User::class,
            'auditable_id'   => $user->id,
            'old_values'     => ['roles' => $oldRoles],
            'new_values'     => ['roles' => [$validated['role']]],
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->userAgent(),
        ]);

        return back()->with('success', "Role \"{$validated['role']}\" assigned to {$user->name}.");
    }

    /**
     * DELETE /users/{user}/roles/{role}
     * Removes a specific role from a user.
     */
    public function removeRole(Request $request, User $user, string $role): RedirectResponse
    {
        $user->removeRole($role);

        // Log audit trail
        AuditTrail::create([
            'user_id'        => $request->user()->id,
            'action'         => 'removed_role',
            'auditable_type' => User::class,
            'auditable_id'   => $user->id,
            'old_values'     => ['removed_role' => $role],
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->userAgent(),
        ]);

        return back()->with('success', "Role \"{$role}\" removed from {$user->name}.");
    }

    /**
     * DELETE /users/{user}
     * Deletes a user (cannot delete yourself).
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $oldValues = $user->toArray();
        $user->delete();

        // Log audit trail
        AuditTrail::create([
            'user_id'        => $request->user()->id,
            'action'         => 'deleted_user',
            'auditable_type' => User::class,
            'auditable_id'   => $user->id,
            'old_values'     => $oldValues,
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->userAgent(),
        ]);

        return back()->with('success', "User {$user->name} deleted.");
    }

    /**
     * POST /users/seed-roles
     * Seeds default roles if they don't exist yet.
     */
    public function seedRoles(): RedirectResponse
    {
        $defaultRoles = ['admin', 'analyst', 'viewer'];

        foreach ($defaultRoles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        return back()->with('success', 'Default roles created successfully.');
    }
}
