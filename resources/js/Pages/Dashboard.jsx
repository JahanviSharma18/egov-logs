// FILE LOCATION: resources/js/Pages/Dashboard.jsx

import { Head, router, usePage } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    LineChart, Line
} from "recharts";
import {
    IconDatabase, IconAlertTriangle, IconAlertCircle,
    IconActivity, IconArrowUpRight, IconArrowDownRight,
    IconRefresh, IconUsers
} from "@tabler/icons-react";

// ─── Severity badge styles ────────────────────────────────────
const BADGE = {
    critical: "badge-critical",
    security: "badge-security",
    error:    "badge-error",
    warning:  "badge-warning",
    info:     "badge-info",
    audit:    "badge-audit",
    debug:    "badge-debug",
};

const PIE_COLORS = ["#06b6d4","#10b981","#14b8a6","#f43f5e","#f59e0b","#8b5cf6"]; // Aurora cyan, emerald, teal, rose, amber, purple

// ─── Live indicator dot ───────────────────────────────────────
function LiveDot({ connected }) {
    return (
        <span className="flex items-center gap-1.5 text-[10px]">
            <span className={`relative flex w-2 h-2`}>
                {connected && (
                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80" />
                )}
                <span className={`relative inline-flex rounded-full w-2 h-2 ${connected ? "bg-cyan-400 animate-hologram-flicker" : "bg-slate-600"}`} />
            </span>
            <span className={connected ? "text-cyan-400 tracking-wider font-semibold animate-hologram-flicker" : "text-slate-500"}>
                {connected ? "LIVE" : "OFFLINE"}
            </span>
        </span>
    );
}

// ─── Custom chart tooltip ─────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="gt-glass border border-cyan-500/30 rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-2xl relative overflow-hidden fade-up">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 pointer-events-none"></div>
            <p className="text-[12px] font-bold text-slate-300 mb-2 uppercase tracking-widest relative z-10">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-[12px] font-extrabold tracking-wide flex items-center gap-2 relative z-10" style={{ color: p.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }}></span>
                    {p.name.toUpperCase()}: {p.value}
                </p>
            ))}
        </div>
    );
};

// ─── Animated counter ─────────────────────────────────────────
function AnimatedNumber({ value }) {
    const [display, setDisplay] = useState(value);
    const prev = useRef(value);

    useEffect(() => {
        if (value === prev.current) return;
        const diff = value - prev.current;
        const steps = Math.min(Math.abs(diff), 20);
        const step = diff / steps;
        let current = prev.current;
        let count = 0;

        const interval = setInterval(() => {
            current += step;
            count++;
            setDisplay(Math.round(current));
            if (count >= steps) {
                setDisplay(value);
                clearInterval(interval);
            }
        }, 30);

        prev.current = value;
        return () => clearInterval(interval);
    }, [value]);

    return <span>{typeof display === "string" ? display : display.toLocaleString()}</span>;
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function Dashboard({ stats = {}, activityData = [], pieData = [], recentLogs = [], recentAudit = [] }) {

    const { auth } = usePage().props;
    const userRoles = auth?.user?.roles || [];
    const isAdmin = userRoles.includes('admin');
    const isAnalyst = userRoles.includes('analyst') || isAdmin;
    const isViewer = userRoles.includes('viewer') || isAnalyst;

    // ── Live state ──────────────────────────────────────────────
    const [liveTotal,    setLiveTotal]    = useState(parseInt(stats.total?.replace(/,/g,"")) || 0);
    const [liveCritical, setLiveCritical] = useState(parseInt(stats.critical?.replace(/,/g,"")) || 0);
    const [liveRecent,   setLiveRecent]   = useState(recentLogs);
    const [connected,    setConnected]    = useState(false);
    const [newLogFlash,  setNewLogFlash]  = useState(false);

    // ── WebSocket subscription ──────────────────────────────────
    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.channel('logs');

        channel.subscribed(() => setConnected(true));

        channel.listen('.LogIngested', (data) => {
            const log = data.log;

            // Bump total counter
            setLiveTotal(prev => prev + 1);

            // Bump critical counter if applicable
            if (log.level === 'critical' || log.level === 'security') {
                setLiveCritical(prev => prev + 1);
            }

            // Prepend to recent logs (keep max 6)
            setLiveRecent(prev => [log, ...prev].slice(0, 6));

            // Flash animation on the recent logs panel
            setNewLogFlash(true);
            setTimeout(() => setNewLogFlash(false), 800);

            // Toast notification for critical/security
            if (log.level === 'critical' || log.level === 'security') {
                toast.error(`${log.level.toUpperCase()}: ${log.source} — ${log.message.slice(0, 60)}`, {
                    duration: 5000,
                    style: {
                        background: "rgba(15, 23, 42, 0.9)",
                        color: "#f8fafc",
                        border: "1px solid rgba(225, 29, 72, 0.5)",
                        fontSize: "12px",
                        backdropFilter: "blur(8px)",
                        boxShadow: "0 0 15px rgba(225, 29, 72, 0.2)"
                    },
                });
            }
        });

        // Listen for connection errors
        window.Echo.connector.pusher.connection.bind('connected',    () => setConnected(true));
        window.Echo.connector.pusher.connection.bind('disconnected', () => setConnected(false));
        window.Echo.connector.pusher.connection.bind('unavailable',  () => setConnected(false));

        return () => {
            window.Echo.leaveChannel('logs');
        };
    }, []);

    const statCards = [
        {
            label: "Total Logs",
            value: liveTotal,
            icon: IconDatabase,
            iconColor: "text-cyan-400",
            iconBg:    "bg-cyan-900/30",
            borderAccent: "border-cyan-500/30",
            trend: "+live", trendUp: true, sub: "updates in real-time",
            sparkline: [{v:2},{v:5},{v:3},{v:8},{v:12},{v:9},{v:15}],
            sparkColor: "#06b6d4"
        },
        {
            label: "Critical Events",
            value: liveCritical,
            icon: IconAlertTriangle,
            iconColor: "text-rose-400",
            iconBg:    "bg-rose-900/30",
            borderAccent: "border-rose-500/30",
            trend: "monitored", trendUp: false, sub: "critical + security",
            sparkline: [{v:4},{v:2},{v:0},{v:1},{v:5},{v:2},{v:1}],
            sparkColor: "#f43f5e"
        },
        {
            label: "Warnings",
            value: parseInt(stats.warnings?.replace(/,/g,"")) || 0,
            icon: IconAlertCircle,
            iconColor: "text-amber-400",
            iconBg:    "bg-amber-900/30",
            borderAccent: "border-amber-500/30",
            trend: "stable", trendUp: true, sub: "warning level",
            sparkline: [{v:2},{v:1},{v:3},{v:2},{v:4},{v:2},{v:3}],
            sparkColor: "#f59e0b"
        },
        {
            label: isAdmin ? "Total Users" : "System Uptime",
            value: isAdmin ? (stats.total_users || 0) : (stats.uptime ?? "99.8%"),
            icon: isAdmin ? IconUsers : IconActivity,
            iconColor: isAdmin ? "text-emerald-400" : "text-emerald-400",
            iconBg:    isAdmin ? "bg-emerald-900/30" : "bg-emerald-900/30",
            borderAccent: isAdmin ? "border-emerald-500/30" : "border-emerald-500/30",
            trend: isAdmin ? "Active" : "Healthy", 
            trendUp: true, 
            sub: isAdmin ? "system accounts" : "all systems go",
            sparkline: [{v:10},{v:10},{v:11},{v:11},{v:11},{v:12},{v:12}],
            sparkColor: "#10b981"
        },
    ];

    const chartData = activityData.length ? activityData : [
        { day: "Mon", logs: 320, critical: 4  },
        { day: "Tue", logs: 480, critical: 8  },
        { day: "Wed", logs: 390, critical: 3  },
        { day: "Thu", logs: 720, critical: 14 },
        { day: "Fri", logs: 510, critical: 6  },
        { day: "Sat", logs: 640, critical: 9  },
        { day: "Sun", logs: 890, critical: 23 },
    ];

    const donutData = pieData.length ? pieData : [
        { name: "Info",     value: 42 },
        { name: "Warning",  value: 22 },
        { name: "Error",    value: 18 },
        { name: "Critical", value: 10 },
        { name: "Security", value: 5  },
        { name: "Audit",    value: 3  },
    ];

    return (
        <AppLayout title="Dashboard Overview">
            <Head title="Dashboard" />

            <div className="p-5 space-y-5">

                {/* ── Live status bar ── */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <LiveDot connected={connected} />
                        {connected ? (
                            <span className="text-[10px] text-[#555]">WebSocket connected — dashboard updates automatically</span>
                        ) : (
                            <span className="text-[10px] text-[#444]">Real-time updates offline — start <code className="text-[#666]">php artisan reverb:start</code></span>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            const btn = document.getElementById('refresh-icon');
                            btn?.classList.add('animate-spin');
                            router.reload({
                                only: ['stats', 'recentLogs'],
                                onFinish: () => {
                                    btn?.classList.remove('animate-spin');
                                    toast.success("Dashboard stats updated");
                                }
                            });
                        }}
                        className="text-[10px] text-[#555] hover:text-[#bbb] transition-colors flex items-center gap-1">
                        <IconRefresh id="refresh-icon" size={11} /> Refresh stats
                    </button>
                </div>

                {/* ── Stat cards ── */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 relative z-10">
                    {statCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div key={card.label}
                                className={`gt-card relative overflow-hidden group p-5 fade-up stagger-${index + 1}`}>
                                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${card.iconBg}`} />

                                <div className="flex justify-between items-start mb-4">
                                    <div className={`inline-flex p-2.5 rounded-xl ${card.iconBg} ${card.iconColor} shadow-[0_0_15px_inherit]`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="w-16 h-8 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={card.sparkline}>
                                                <Line type="monotone" dataKey="v" stroke={card.sparkColor} strokeWidth={2} dot={false} isAnimationActive={true} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <p className="text-[12px] text-slate-400 mb-1 font-semibold tracking-wide uppercase">{card.label}</p>
                                <p className="text-[32px] font-extrabold text-white tracking-tight leading-none mb-3">
                                    <AnimatedNumber value={card.value} />
                                </p>
                                <div className="flex items-center gap-1.5">
                                    {card.trendUp
                                        ? <IconArrowUpRight size={14} className="text-emerald-400 flex-shrink-0" />
                                        : <IconArrowDownRight size={14} className="text-rose-400 flex-shrink-0" />
                                    }
                                    <span className={`text-[11px] font-bold tracking-wide ${card.trendUp ? "text-emerald-400" : "text-rose-400"}`}>
                                        {card.trend}
                                    </span>
                                    <span className="text-[10px] text-slate-500">{card.sub}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Charts ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10">
                    <div className="gt-card p-5 lg:col-span-2 relative overflow-hidden fade-up stagger-4">
                        <div className="ai-scan-line"></div>
                        <h2 className="text-[13px] font-bold text-slate-200 mb-6 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4] animate-hologram-flicker"></span>
                            Log Activity (7 Days)
                        </h2>
                        <div className="h-[280px] -ml-2 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05}/>
                                        </linearGradient>
                                        <linearGradient id="colorCrit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.9}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} stroke="#334155" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:"#94a3b8", fontSize: 10, fontWeight: "bold"}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill:"#94a3b8", fontSize: 10, fontWeight: "bold"}} dx={-10} />
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(6, 182, 212, 0.1)'}} />
                                    <Area type="monotone" dataKey="logs" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorLogs)" activeDot={{r:6, fill:"#06b6d4", strokeWidth:2, stroke:"#fff"}} />
                                    <Area type="monotone" dataKey="critical" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorCrit)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Donut chart */}
                    <div className="gt-card p-5 relative overflow-hidden fade-up stagger-5">
                        <h2 className="text-[13px] font-bold text-slate-200 mb-2 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] animate-hologram-flicker" style={{animationDelay: '1.5s'}}></span>
                            Severity Distribution
                        </h2>
                        <div className="h-[220px] mt-2 relative">
                            {/* Ambient background glow for donut chart */}
                            <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none w-40 h-40 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                            <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                                <PieChart>
                                    <Pie data={donutData} innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value" stroke="rgba(255,255,255,0.05)" strokeWidth={1}>
                                    {donutData.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />}/>
                            </PieChart>
                        </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3">
                            {donutData.map((d, i) => (
                                <div key={d.name} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-800/50 transition-colors">
                                    <span className="w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_8px_inherit]"
                                        style={{ background: PIE_COLORS[i % PIE_COLORS.length], color: PIE_COLORS[i % PIE_COLORS.length] }}/>
                                    <span className="text-[11px] text-slate-300 font-medium truncate">{d.name}</span>
                                    <span className="text-[10px] text-slate-500 ml-auto font-mono bg-slate-900/50 px-1.5 py-0.5 rounded">{d.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Recent logs — live feed ── */}
                <div className={`gt-card overflow-hidden transition-all duration-500 relative z-10 fade-up stagger-6
                    ${newLogFlash ? "border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)] bg-slate-800/80" : ""}`}>

                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50 bg-slate-900/40">
                        <div className="flex items-center gap-3">
                            <div>
                                <h3 className="text-[14px] font-bold text-slate-200 tracking-wide">Live Event Stream</h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">Real-time system telemetry</p>
                            </div>
                            {newLogFlash && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-900/40 text-cyan-300 border border-cyan-500/50 font-bold animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.3)] tracking-widest">
                                    NEW EVENT
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => router.visit(route('logs.index'))}
                            className="text-[12px] text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20 px-3 py-1.5 rounded-md transition-all font-medium border border-transparent hover:border-cyan-500/30">
                            View All Feed →
                        </button>
                    </div>

                    {/* Header row */}
                    <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-slate-800/50 bg-slate-950/50">
                        <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Level</div>
                        <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source</div>
                        <div className="col-span-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payload</div>
                        <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Timestamp</div>
                    </div>

                    {/* Log rows */}
                    {liveRecent.length > 0 ? liveRecent.map((log, i) => (
                        <div key={log.id ?? i}
                            className={`gt-row group
                                ${i === 0 && newLogFlash ? "bg-cyan-900/20" : ""}`}>
                            <div className="col-span-2">
                                <span className={BADGE[log.level] ?? BADGE.debug}>
                                    {log.level}
                                </span>
                            </div>
                            <div className="col-span-2 text-[11px] text-slate-400 group-hover:text-cyan-300 transition-colors truncate font-mono">
                                {log.source}
                            </div>
                            <div className="col-span-6 text-[13px] text-slate-300 group-hover:text-slate-100 transition-colors truncate pr-4">
                                {log.message}
                            </div>
                            <div className="col-span-2 text-[11px] text-slate-500 group-hover:text-slate-400 transition-colors text-right font-mono">
                                {log.time ?? log.created_at}
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-16 text-[12px] text-slate-500">
                            <IconActivity size={32} className="text-slate-700 mb-3" />
                            <p>Awaiting incoming telemetry data...</p>
                            <p className="text-[10px] mt-1 text-slate-600">Ensure services are piping logs to the ingestion endpoint.</p>
                        </div>
                    )}
                </div>

            </div>
        </AppLayout>
    );
}