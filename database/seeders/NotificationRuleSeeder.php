<?php
// FILE: database/seeders/NotificationRuleSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NotificationRule;

class NotificationRuleSeeder extends Seeder
{
    public function run(): void
    {
        NotificationRule::insert([
            ['name' => 'Critical Alert',  'trigger_level' => 'critical', 'channel' => 'both',  'recipient' => 'admin@egov.com', 'is_active' => true, 'cooldown_minutes' => 5,  'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Security Alert',  'trigger_level' => 'security', 'channel' => 'both',  'recipient' => 'admin@egov.com', 'is_active' => true, 'cooldown_minutes' => 1,  'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Error Watcher',   'trigger_level' => 'error',    'channel' => 'email', 'recipient' => 'admin@egov.com', 'is_active' => true, 'cooldown_minutes' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Warning Monitor', 'trigger_level' => 'warning',  'channel' => 'email', 'recipient' => 'admin@egov.com', 'is_active' => false,'cooldown_minutes' => 15, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}