<?php
// FILE: database/migrations/xxxx_create_notification_rules_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_rules', function (Blueprint $table) {
            $table->id();

            // Rule name (e.g. "Alert on Critical Errors")
            $table->string('name');

            // Which log level triggers this rule
            $table->enum('trigger_level', [
                'debug', 'info', 'warning',
                'error', 'critical', 'security', 'audit'
            ]);

            // How to notify — mail or slack
            $table->enum('channel', ['mail', 'slack'])
                  ->default('mail');

            // Who to notify
            $table->string('recipient')->nullable(); // email address or slack webhook

            // Is this rule currently active?
            $table->boolean('is_active')->default(true);

            // Cooldown in minutes — don't spam alerts
            // e.g. 5 = only alert once every 5 minutes per rule
            $table->integer('cooldown_minutes')->default(5);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_rules');
    }
};