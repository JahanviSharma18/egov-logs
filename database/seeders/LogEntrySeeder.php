<?php
// FILE: database/seeders/LogEntrySeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LogEntry;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class LogEntrySeeder extends Seeder
{
    public function run(): void
    {
        // Create a test user first if none exists
        if (User::count() === 0) {
            User::create([
                'name'              => 'Jahanvi Sharma',
                'email'             => 'admin@govtrace.com',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
        }

        $userId = User::first()->id;

        $levels   = ['debug','info','info','info','warning','warning','error','critical','security','audit'];
        $sources  = ['AuthService','PaymentModule','UserController','APIGateway','DatabaseService','FileUploader','EmailService','ReportGenerator'];
        $messages = [
            'debug'    => ['Debug trace captured','Variable dump logged','Query executed in 2ms'],
            'info'     => ['User logged in successfully','Profile updated','Report generated','File uploaded successfully','Password changed'],
            'warning'  => ['High memory usage detected','Slow query detected (>2s)','Deprecated API endpoint called','Rate limit approaching'],
            'error'    => ['Database connection failed','File not found: config.json','Unhandled exception in PaymentModule','Mail send failed'],
            'critical' => ['Server out of memory','Database server unreachable','Critical service crashed','Disk space below 5%'],
            'security' => ['Multiple failed login attempts','Unauthorized API access attempt','SQL injection attempt detected','Suspicious IP detected'],
            'audit'    => ['User role changed to admin','Log export performed','User account deleted','Notification rule modified'],
        ];

        for ($i = 0; $i < 120; $i++) {
            $level   = $levels[array_rand($levels)];
            $msgList = $messages[$level];

            LogEntry::create([
                'level'         => $level,
                'message'       => $msgList[array_rand($msgList)],
                'source'        => $sources[array_rand($sources)],
                'ip_address'    => fake()->ipv4(),
                // Only assign user_id sometimes, and only use real user ids
                'user_id'       => rand(0, 1) ? $userId : null,
                'metadata'      => ['request_id' => fake()->uuid(), 'duration_ms' => rand(10, 3000)],
                'url'           => fake()->randomElement(['/api/login','/api/logs','/dashboard','/api/users','/api/reports']),
                'method'        => fake()->randomElement(['GET','POST','PUT','DELETE']),
                'classified_at' => now(),
                'notified'      => in_array($level, ['critical','security']),
                'created_at'    => Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23)),
            ]);
        }
    }
}