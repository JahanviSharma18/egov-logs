<?php
// FILE: database/seeders/RoleSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Create the 3 roles
        $superAdmin = Role::create(['name' => 'super-admin']);
        $analyst    = Role::create(['name' => 'analyst']);
        $viewer     = Role::create(['name' => 'viewer']);

        // Create permissions
        $permissions = [
            'view-logs', 'export-logs', 'delete-logs',
            'manage-users', 'manage-roles',
            'view-dashboard', 'manage-notifications',
            'view-audit-trail', 'generate-reports',
        ];

        foreach ($permissions as $perm) {
            Permission::create(['name' => $perm]);
        }

        // Assign permissions to roles
        $superAdmin->givePermissionTo($permissions); // all

        $analyst->givePermissionTo([
            'view-logs', 'export-logs',
            'view-dashboard', 'view-audit-trail', 'generate-reports',
        ]);

        $viewer->givePermissionTo([
            'view-logs', 'view-dashboard',
        ]);

        // Assign super-admin role to the first registered user (you)
        $firstUser = User::first();
        if ($firstUser) {
            $firstUser->assignRole('super-admin');
        }
    }
}