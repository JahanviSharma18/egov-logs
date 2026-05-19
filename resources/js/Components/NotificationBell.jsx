// FILE LOCATION: resources/js/Components/NotificationBell.jsx

import { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";
import {
    IconBellRinging, IconBell, IconX,
    IconAlertTriangle, IconShieldExclamation,
    IconAlertCircle, IconCheck
} from "@tabler/icons-react";

// ─── Icons per level ──────────────────────────────────────────
const LEVEL_ICON = {
    critical: { icon: IconAlertTriangle,    color: "text-purple-400", bg: "bg-purple-500/10" },
    security: { icon: IconShieldExclamation,color: "text-pink-400",   bg: "bg-pink-500/10"   },
    error:    { icon: IconAlertCircle,      color: "text-red-400",    bg: "bg-red-500/10"    },
};

// ─── Single notification item ─────────────────────────────────
function NotifItem({ log, onClose }) {
    const cfg = LEVEL_ICON[log.level] ?? LEVEL_ICON.error;
    const Icon = cfg.icon;

    return (
        <div className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer border-b border-[#141414] last:border-0"
            onClick={() => { router.visit(route("logs.index")); onClose(); }}>

            <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon size={13} className={cfg.color} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${cfg.color}`}>
                        {log.level}
                    </span>
                    <span className="text-[10px] text-[#444]">{log.source}</span>
                </div>
                <p className="text-[11px] text-[#aaa] leading-snug line-clamp-2">{log.message}</p>
                <p className="text-[10px] text-[#555] mt-1">{log.time}</p>
            </div>
        </div>
    );
}

// ─── Main bell component ──────────────────────────────────────
export default function NotificationBell({ recentAlerts = [] }) {
    const [open, setOpen]   = useState(false);
    const [read, setRead]   = useState(false);
    const ref               = useRef(null);

    const unread = !read && recentAlerts.length > 0;

    // Close on click outside
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleOpen = () => {
        setOpen(!open);
        if (!open) setRead(true); // mark as read when opened
    };

    const markAllRead = (e) => {
        e.stopPropagation();
        setRead(true);
        setOpen(false);
    };

    return (
        <div className="relative" ref={ref}>

            {/* Bell button */}
            <button
                onClick={handleOpen}
                className={`relative w-8 h-8 border rounded-lg flex items-center justify-center transition-all duration-300
                    ${open
                        ? "border-cyan-500/50 bg-cyan-900/30 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                        : "border-slate-700/50 text-slate-400 hover:text-cyan-300 hover:bg-cyan-900/20"
                    }`}>
                {unread ? <IconBellRinging size={15} className="animate-pulse" /> : <IconBell size={15} />}

                {/* Unread dot */}
                {unread && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-cyan-400 rounded-full border border-[#020617] shadow-[0_0_5px_#06b6d4]" />
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 gt-glass border border-slate-700/50 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 overflow-hidden fade-up">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
                        <div>
                            <h3 className="text-[12px] font-semibold text-[#e0e0e0]">Alerts</h3>
                            <p className="text-[10px] text-[#555] mt-0.5">
                                {recentAlerts.length > 0
                                    ? `${recentAlerts.length} recent critical events`
                                    : "No recent alerts"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {recentAlerts.length > 0 && (
                                <button onClick={markAllRead}
                                    className="flex items-center gap-1 text-[10px] text-[#666] hover:text-green-400 transition-colors">
                                    <IconCheck size={11} />
                                    Mark read
                                </button>
                            )}
                            <button onClick={() => setOpen(false)}
                                className="w-6 h-6 flex items-center justify-center rounded text-[#555] hover:text-[#999] hover:bg-[#1a1a1a] transition-colors">
                                <IconX size={12} />
                            </button>
                        </div>
                    </div>

                    {/* Alert list */}
                    <div className="max-h-80 overflow-y-auto">
                        {recentAlerts.length > 0 ? (
                            recentAlerts.map((log) => (
                                <NotifItem key={log.id} log={log} onClose={() => setOpen(false)} />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#222] flex items-center justify-center mb-3">
                                    <IconBell size={18} className="text-[#444]" />
                                </div>
                                <p className="text-[12px] text-[#666]">All clear</p>
                                <p className="text-[10px] text-[#444] mt-0.5">No critical events</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {recentAlerts.length > 0 && (
                        <div className="px-4 py-3 border-t border-slate-800/50 bg-slate-900/40">
                            <button
                                onClick={() => { router.visit(route("logs.index"), { data: { level: "critical" } }); setOpen(false); }}
                                className="w-full text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline transition-all duration-300 text-center font-bold tracking-wide">
                                View all critical logs →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}