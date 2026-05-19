// FILE LOCATION: resources/js/Pages/Audit/Index.jsx

import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import AppLayout from "@/Layouts/AppLayout";
import {
    IconHistory, IconSearch, IconFilter, IconUser,
    IconDatabase, IconClock, IconChevronLeft, IconChevronRight,
    IconFingerprint
} from "@tabler/icons-react";

// ─── Format JSON cleanly ───────────────────────────────────────
function JsonViewer({ data }) {
    if (!data || Object.keys(data).length === 0) return <span className="text-slate-600 italic">None</span>;
    return (
        <div className="bg-slate-950/80 border border-slate-800/50 rounded-md p-2 text-[10px] font-mono text-cyan-300/80 whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
            {JSON.stringify(data, null, 2)}
        </div>
    );
}

// ─── Badge for actions ─────────────────────────────────────────
function ActionBadge({ action }) {
    const isDelete = action.includes("deleted") || action.includes("removed");
    const isCreate = action.includes("created") || action.includes("assigned");
    
    let colorClass = "bg-cyan-900/30 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]";
    if (isDelete) colorClass = "bg-rose-900/30 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(225,29,72,0.2)]";
    if (isCreate) colorClass = "bg-emerald-900/30 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]";

    return (
        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${colorClass}`}>
            {action.replace(/_/g, " ")}
        </span>
    );
}

// ─── Main page ─────────────────────────────────────────────────
export default function AuditIndex({ trails, filters, actions }) {
    const [search, setSearch] = useState(filters.search || "");
    const [action, setAction] = useState(filters.action || "");

    // Handle search/filter with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== filters.search || action !== filters.action) {
                router.get(route("audit.index"), { search, action }, {
                    preserveState: true,
                    replace: true,
                });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search, action]);

    return (
        <AppLayout title="Audit Trail">
            <Head title="Audit Trail" />

            <div className="p-6 space-y-8 relative z-10">
                {/* ── Header & Filters ── */}
                <div className="gt-glass border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 fade-up">
                    <div className="absolute top-0 right-1/4 w-32 h-32 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                    <div className="relative z-10">
                        <h2 className="text-[18px] font-bold text-slate-100 flex items-center gap-3 tracking-wide">
                            <div className="w-8 h-8 rounded-lg bg-cyan-900/40 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                                <IconHistory size={16} className="text-cyan-400" />
                            </div>
                            System Audit Trail
                        </h2>
                        <p className="text-[12px] text-slate-400 mt-1.5 font-medium">
                            Immutable record of administrative activity, configuration changes, and system access.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        {/* Search Input */}
                        <div className="relative">
                            <IconSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500" />
                            <input
                                type="text"
                                placeholder="Search identity, target, event..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-64 bg-slate-900/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-[12px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0)] focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-300"
                            />
                        </div>

                        {/* Action Filter */}
                        <div className="relative">
                            <IconFilter size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500" />
                            <select
                                value={action}
                                onChange={e => setAction(e.target.value)}
                                className="w-48 bg-slate-900/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-[12px] text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0)] focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-300 cursor-pointer appearance-none font-medium">
                                <option value="">All Events</option>
                                {actions.map(act => (
                                    <option key={act} value={act}>{act.replace(/_/g, " ").toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── Audit List ── */}
                <div className="gt-glass border border-slate-700/50 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] fade-up" style={{ animationDelay: '0.1s' }}>
                    {/* Headers */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-700/50 bg-slate-900/50">
                        <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identity & Node</div>
                        <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event & Target</div>
                        <div className="col-span-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">State Delta</div>
                        <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Timestamp</div>
                    </div>

                    {trails.data.length > 0 ? (
                        <div className="divide-y divide-slate-800/50">
                            {trails.data.map(trail => (
                                <div key={trail.id} className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-800/30 transition-all duration-300 gt-row group">
                                    
                                    {/* User */}
                                    <div className="col-span-3 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 text-[13px] font-bold text-slate-200 mb-1.5 group-hover:text-cyan-300 transition-colors">
                                            <IconUser size={13} className="text-slate-500 group-hover:text-cyan-500 transition-colors" />
                                            <span className="truncate tracking-wide">{trail.user?.name || "System/Unknown"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono group-hover:text-slate-400 transition-colors">
                                            <IconFingerprint size={12} className="text-slate-600" />
                                            {trail.ip_address || "N/A"}
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="col-span-3 flex flex-col justify-center items-start">
                                        <div className="mb-2">
                                            <ActionBadge action={trail.action} />
                                        </div>
                                        {trail.auditable_type && (
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono tracking-wide">
                                                <IconDatabase size={12} className="text-cyan-500" />
                                                {trail.auditable_type.split('\\').pop()} <span className="text-cyan-400">#{trail.auditable_id}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Changes (Old vs New) */}
                                    <div className="col-span-4 flex gap-3 overflow-hidden">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] font-bold text-rose-400/80 mb-1 uppercase tracking-widest">Previous State</p>
                                            <JsonViewer data={trail.old_values} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] font-bold text-emerald-400/80 mb-1 uppercase tracking-widest">New State</p>
                                            <JsonViewer data={trail.new_values} />
                                        </div>
                                    </div>

                                    {/* Time */}
                                    <div className="col-span-2 flex flex-col justify-center items-end text-right">
                                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-300 font-mono mb-1 group-hover:text-cyan-300 transition-colors">
                                            <IconClock size={12} className="text-cyan-500" />
                                            {new Date(trail.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-medium tracking-wide">
                                            {new Date(trail.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0idHJhbnNwYXJlbnQiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIvPgo8L3N2Zz4=')] opacity-50"></div>
                            <div className="w-16 h-16 rounded-2xl bg-cyan-900/20 border border-cyan-500/30 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-float relative z-10">
                                <IconHistory size={28} className="text-cyan-400" />
                            </div>
                            <p className="text-[15px] font-bold text-slate-200 mb-1 tracking-wide relative z-10">No Audit Events</p>
                            <p className="text-[12px] text-slate-500 relative z-10">No activities match your current search parameters.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {trails.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between bg-slate-950/50">
                            <span className="text-[12px] text-slate-500 font-medium">
                                Tracking <strong className="text-slate-300">{trails.from}</strong> to <strong className="text-slate-300">{trails.to}</strong> of <strong className="text-slate-300">{trails.total}</strong> events
                            </span>
                            <div className="flex items-center gap-1.5">
                                {trails.links.map((link, i) => (
                                    <button key={i}
                                        onClick={() => link.url && router.get(link.url)}
                                        disabled={!link.url}
                                        className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-300
                                            ${link.active ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]" : "text-slate-500 hover:bg-slate-800 hover:text-cyan-300 border border-transparent"}
                                            ${!link.url && "opacity-30 cursor-not-allowed hover:bg-transparent"}
                                        `}
                                        dangerouslySetInnerHTML={{ __html: link.label.replace('&laquo;', '‹').replace('&raquo;', '›') }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </AppLayout>
    );
}
