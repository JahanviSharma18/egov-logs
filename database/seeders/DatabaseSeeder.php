<?php
// FILE: database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,              // Creates roles + assigns to first user
            LogEntrySeeder::class,          // 120 sample logs
            NotificationRuleSeeder::class,  // 4 default notification rules
        ]);
    }
}