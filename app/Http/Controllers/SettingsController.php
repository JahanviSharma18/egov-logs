<?php

namespace App\Http\Controllers;

use App\Models\AuditTrail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

class SettingsController extends Controller
{
    /**
     * GET /settings
     */
    public function index(): Response
    {
        // For a real app, these might come from a settings table or config.
        // For GovTrace, we'll return some dummy values to make the UI interactive.
        $settings = Cache::rememberForever('system_settings', function () {
            return [
                'retention_days' => 30,
                'max_log_size'   => 1024,
                'maintenance'    => false,
                'require_2fa'    => false,
            ];
        });

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
        ]);
    }

    /**
     * POST /settings
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'retention_days' => 'required|integer|min:1|max:365',
            'max_log_size'   => 'required|integer|min:1',
            'maintenance'    => 'required|boolean',
            'require_2fa'    => 'required|boolean',
        ]);

        $oldSettings = Cache::get('system_settings', []);
        
        Cache::forever('system_settings', $validated);

        AuditTrail::create([
            'user_id'        => $request->user()->id,
            'action'         => 'updated_settings',
            'old_values'     => $oldSettings,
            'new_values'     => $validated,
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->userAgent(),
        ]);

        return back()->with('success', 'System settings updated successfully.');
    }

    /**
     * POST /settings/clear-cache
     */
    public function clearCache(Request $request): RedirectResponse
    {
        Artisan::call('cache:clear');

        AuditTrail::create([
            'user_id'        => $request->user()->id,
            'action'         => 'cleared_system_cache',
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->userAgent(),
        ]);

        return back()->with('success', 'System cache cleared.');
    }
}
