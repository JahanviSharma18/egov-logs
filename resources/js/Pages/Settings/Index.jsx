// FILE LOCATION: resources/js/Pages/Settings/Index.jsx

import { Head, useForm, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    IconSettings, IconDatabase, IconServerCog, IconShieldLock, IconDeviceFloppy
} from "@tabler/icons-react";
import toast from "react-hot-toast";

export default function SettingsIndex({ settings }) {
    const { data, setData, post, processing } = useForm({
        retention_days: settings.retention_days || 30,
        max_log_size:   settings.max_log_size || 1024,
        maintenance:    settings.maintenance || false,
        require_2fa:    settings.require_2fa || false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("settings.update"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Settings saved successfully", { style: { background: "#1a1a1a", color: "#e0e0e0" } });
            }
        });
    };

    const clearCache = () => {
        router.post(route("settings.clear-cache"), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("System cache cleared", { style: { background: "#1a1a1a", color: "#e0e0e0" } });
            }
        });
    };

    return (
        <AppLayout title="System Settings">
            <Head title="System Settings" />

            <div className="p-6 space-y-8 max-w-5xl mx-auto relative z-10">


                <form onSubmit={submit} className="space-y-5">
                    
                    {/* Log Retention */}
                    {/* Log Retention */}
                    <div className="gt-glass border border-slate-700/50 rounded-2xl p-8 relative overflow-hidden group fade-up" style={{ animationDelay: '0.1s' }}>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <h3 className="text-[14px] font-bold text-slate-100 mb-5 flex items-center gap-2 relative z-10 tracking-wide">
                            <IconDatabase size={18} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" /> Storage & Retention
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div>
                                <label className="block text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2 ml-1">Log Retention Period (Days)</label>
                                <input type="number" min="1" max="365"
                                    value={data.retention_days} onChange={e => setData('retention_days', e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-[12px] text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0)] focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-300" />
                                <p className="text-[10px] text-slate-500 font-medium mt-2 ml-1">Logs older than this will be auto-deleted.</p>
                            </div>
                            <div>
                                <label className="block text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2 ml-1">Max Log Size (MB)</label>
                                <input type="number" min="1"
                                    value={data.max_log_size} onChange={e => setData('max_log_size', e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-[12px] text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0)] focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-300" />
                                <p className="text-[10px] text-slate-500 font-medium mt-2 ml-1">Threshold for archiving log streams.</p>
                            </div>
                        </div>
                    </div>

                    {/* Security & Maintenance */}
                    {/* Security & Maintenance */}
                    <div className="gt-glass border border-slate-700/50 rounded-2xl p-8 relative overflow-hidden group fade-up" style={{ animationDelay: '0.2s' }}>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <h3 className="text-[14px] font-bold text-slate-100 mb-5 flex items-center gap-2 relative z-10 tracking-wide">
                            <IconShieldLock size={18} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" /> Security & Access
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <label className="flex items-center gap-4 p-4 rounded-xl border border-slate-800/50 bg-slate-900/40 cursor-pointer hover:bg-slate-800/80 hover:border-cyan-500/30 transition-all duration-300">
                                <input type="checkbox" checked={data.require_2fa} onChange={e => setData('require_2fa', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-700/50 bg-slate-900/50 text-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.1)] focus:ring-cyan-500/40 focus:ring-offset-0 transition-all duration-300" />
                                <div>
                                    <p className="text-[13px] text-slate-200 font-bold tracking-wide">Require 2FA for Admins</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Force two-factor authentication for sensitive roles.</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-4 p-4 rounded-xl border border-slate-800/50 bg-slate-900/40 cursor-pointer hover:bg-slate-800/80 hover:border-rose-500/30 transition-all duration-300">
                                <input type="checkbox" checked={data.maintenance} onChange={e => setData('maintenance', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-700/50 bg-slate-900/50 text-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.1)] focus:ring-rose-500/40 focus:ring-offset-0 transition-all duration-300" />
                                <div>
                                    <p className="text-[13px] text-slate-200 font-bold tracking-wide">Maintenance Mode</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Only Super Admins can log in when this is active.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 fade-up" style={{ animationDelay: '0.3s' }}>
                        <button type="button" onClick={clearCache}
                            className="flex items-center gap-2 text-[12px] font-bold text-slate-400 hover:text-cyan-300 bg-slate-900/40 hover:bg-cyan-900/20 border border-slate-800/50 hover:border-cyan-500/40 px-5 py-3 rounded-xl transition-all duration-300">
                            <IconServerCog size={15} /> Clear System Cache
                        </button>
                        
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-8 py-3 rounded-xl text-[13px] font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all duration-300 disabled:opacity-50">
                            <IconDeviceFloppy size={18} /> {processing ? "Initializing..." : "Save Configuration"}
                        </button>
                    </div>

                </form>
            </div>
        </AppLayout>
    );
}
