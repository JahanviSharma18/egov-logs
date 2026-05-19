<?php
// FILE: database/migrations/xxxx_create_audit_trails_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_trails', function (Blueprint $table) {
            $table->id();

            // Who performed the action
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained()
                  ->nullOnDelete();

            // What they did (e.g. "viewed_logs", "exported_report", "changed_role")
            $table->string('action');

            // Which model was affected (e.g. "LogEntry", "User")
            $table->string('auditable_type')->nullable();
            $table->unsignedBigInteger('auditable_id')->nullable();

            // Snapshot of old vs new values (for edits)
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();

            // Request info
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_trails');
    }
};