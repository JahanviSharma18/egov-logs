// FILE LOCATION: resources/js/Pages/Logs/Index.jsx
// Also create the folder: resources/js/Pages/Logs/

import { Head, router, usePage } from "@inertiajs/react";
import { useState, useCallback } from "react";
import AppLayout from "@/Layouts/AppLayout";
import {
    IconSearch, IconFilter, IconDownload, IconRefresh,
    IconChevronLeft, IconChevronRight, IconX,
    IconCalendar, IconDatabase, IconTrash
} from "@tabler/icons-react";

// ─── Severity badge config ────────────────────────────────────
const BADGES = {
    critical: { cls: "bg-purple-500/15 text-purple-300 border border-purple-500/25", dot: "bg-purple-400" },
    security: { cls: "bg-pink-500/15   text-pink-300   border border-pink-500/25",   dot: "bg-pink-400"   },
    error:    { cls: "bg-red-500/15    text-red-300    border border-red-500/25",     dot: "bg-red-400"    },
    warning:  { cls: "bg-amber-500/15  text-amber-300  border border-amber-500/25",  dot: "bg-amber-400"  },
    info:     { cls: "bg-blue-500/15   text-blue-300   border border-blue-500/25",   dot: "bg-blue-400"   },
    audit:    { cls: "bg-green-500/15  text-green-300  border border-green-500/25",  dot: "bg-green-400"  },
    debug:    { cls: "bg-zinc-500/15   text-zinc-400   border border-zinc-500/25",   dot: "bg-zinc-400"   },
};

const LEVELS = ["debug","info","warning","error","critical","security","audit"];

// ─── Badge component ──────────────────────────────────────────
function LevelBadge({ level }) {
    const b = BADGES[level] ?? BADGES.debug;
    return (
        <span className={`inline-flex items-center gap-1.5 text-[9px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${b.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`} />
            {level}
        </span>
    );
}

// ─── Pagination component ─────────────────────────────────────
function Pagination({ meta, links }) {
    const handlePage = (url) => {
        if (!url) return;
        router.visit(url, { preserveScroll: true, preserveState: true });
    };

    return (
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800/50 bg-slate-900/30">
            <p className="text-[11px] text-slate-400">
                Showing <span className="text-slate-200 font-bold">{meta.from ?? 0}</span>–<span className="text-slate-200 font-bold">{meta.to ?? 0}</span> of <span className="text-slate-200 font-bold">{meta.total}</span> logs
            </p>
            <div className="flex items-center gap-1.5">
                {/* Prev */}
                <button onClick={() => handlePage(links.prev)} disabled={!links.prev}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-700/50 text-slate-400 hover:text-cyan-400 hover:bg-cyan-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300">
                    <IconChevronLeft size={14} />
                </button>

                {/* Page numbers */}
                {meta.links?.filter(l => !l.label.includes('Previous') && !l.label.includes('Next'))
                    .map((link, i) => (
                    <button key={i}
                        onClick={() => handlePage(link.url)}
                        disabled={!link.url}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-[11px] border transition-all duration-300
                            ${link.active
                                ? "bg-cyan-900/40 border-cyan-500/50 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                                : "border-slate-700/50 text-slate-400 hover:text-cyan-300 hover:bg-cyan-900/20 disabled:opacity-30"
                            }`}
                    />
                ))}

                {/* Next */}
                <button onClick={() => handlePage(links.next)} disabled={!links.next}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-700/50 text-slate-400 hover:text-cyan-400 hover:bg-cyan-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300">
                    <IconChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────
export default function LogsIndex({ logs, sources = [], levelCounts = {}, filters = {} }) {
    const { auth } = usePage().props;
    const userRoles = auth?.user?.roles || [];
    const isAdmin = userRoles.includes('admin');
    const isAnalyst = userRoles.includes('analyst') || isAdmin;

    const [search,   setSearch]   = useState(filters.search    ?? "");
    const [level,    setLevel]    = useState(filters.level     ?? "");
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? "");
    const [dateTo,   setDateTo]   = useState(filters.date_to   ?? "");
    const [source,   setSource]   = useState(filters.source    ?? "");

    // ── Apply filters via Inertia GET ─────────────────────────
    const applyFilters = useCallback((overrides = {}) => {
        const params = {
            search:    overrides.search    !== undefined ? overrides.search    : search,
            level:     overrides.level     !== undefined ? overrides.level     : level,
            date_from: overrides.date_from !== undefined ? overrides.date_from : dateFrom,
            date_to:   overrides.date_to   !== undefined ? overrides.date_to   : dateTo,
            source:    overrides.source    !== undefined ? overrides.source    : source,
        };

        // Remove empty params
        Object.keys(params).forEach(k => !params[k] && delete params[k]);

        router.get(route("logs.index"), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [search, level, dateFrom, dateTo, source]);

    // ── Clear all filters ──────────────────────────────────────
    const clearAll = () => {
        setSearch(""); setLevel(""); setDateFrom(""); setDateTo(""); setSource("");
        router.get(route("logs.index"), {}, { preserveState: false });
    };

    // ── Export CSV with current filters ───────────────────────
    const exportCsv = () => {
        const params = new URLSearchParams();
        if (search)   params.set("search",    search);
        if (level)    params.set("level",     level);
        if (dateFrom) params.set("date_from", dateFrom);
        if (dateTo)   params.set("date_to",   dateTo);
        window.location.href = route("logs.export-csv") + "?" + params.toString();
    };

    const hasFilters = search || level || dateFrom || dateTo || source;
    const totalShown = logs?.meta?.total ?? 0;

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this log?")) {
            router.delete(route("logs.destroy", id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout title="Log Entries">
            <Head title="Log Entries" />

            <div className="p-5 space-y-4">

                {/* ── Level count pills ── */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => { setLevel(""); applyFilters({ level: "" }); }}
                        className={`text-[10px] px-3 py-1.5 rounded-full border font-bold tracking-wider transition-all duration-300
                            ${!level ? "bg-cyan-900/40 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]" : "border-slate-700/50 text-slate-400 hover:border-cyan-500/30 hover:text-cyan-300"}`}>
                        ALL <span className="ml-1 opacity-70 bg-slate-900/50 px-1.5 py-0.5 rounded">{Object.values(levelCounts).reduce((a, b) => a + b, 0)}</span>
                    </button>
                    {LEVELS.map(l => {
                        const b = BADGES[l];
                        return (
                            <button key={l}
                                onClick={() => { setLevel(l); applyFilters({ level: l }); }}
                                className={`text-[10px] px-3 py-1.5 rounded-full border font-bold tracking-wider transition-all duration-300 uppercase
                                    ${level === l ? b.cls + " shadow-[0_0_10px_inherit]" : "border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"}`}>
                                {l} <span className="ml-1 opacity-60 bg-slate-900/50 px-1.5 py-0.5 rounded">{levelCounts[l] ?? 0}</span>
                            </button>
                        );
                    })}
                </div>

                {/* ── Search & filter bar ── */}
                <div className="gt-glass border-slate-700/50 rounded-xl p-3">
                    <div className="flex items-center gap-3 flex-wrap">

                        {/* Search input */}
                        <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 flex-1 min-w-[200px] focus-within:border-cyan-500/50 focus-within:shadow-[0_0_10px_rgba(6,182,212,0.15)] transition-all duration-300">
                            <IconSearch size={13} className="text-slate-500 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search telemetry logs..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && applyFilters()}
                                className="bg-transparent text-[12px] text-slate-200 placeholder:text-slate-500 outline-none flex-1 min-w-0"
                            />
                            {search && (
                                <button onClick={() => { setSearch(""); applyFilters({ search: "" }); }}>
                                    <IconX size={12} className="text-slate-400 hover:text-cyan-400 transition-colors" />
                                </button>
                            )}
                        </div>

                        {/* Source filter */}
                        <select value={source} onChange={e => { setSource(e.target.value); applyFilters({ source: e.target.value }); }}
                            className="bg-slate-900/50 border border-slate-700/50 text-[12px] text-slate-300 rounded-lg px-3 py-2 outline-none hover:border-cyan-500/30 focus:border-cyan-500/50 transition-colors cursor-pointer">
                            <option value="">All Telemetry Sources</option>
                            {sources.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        {/* Date from */}
                        <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 hover:border-cyan-500/30 transition-colors">
                            <IconCalendar size={13} className="text-slate-500" />
                            <input type="date" value={dateFrom}
                                onChange={e => { setDateFrom(e.target.value); applyFilters({ date_from: e.target.value }); }}
                                className="bg-transparent text-[12px] text-slate-300 outline-none cursor-pointer" />
                        </div>

                        {/* Date to */}
                        <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 hover:border-cyan-500/30 transition-colors">
                            <IconCalendar size={13} className="text-slate-500" />
                            <input type="date" value={dateTo}
                                onChange={e => { setDateTo(e.target.value); applyFilters({ date_to: e.target.value }); }}
                                className="bg-transparent text-[12px] text-slate-300 outline-none cursor-pointer" />
                        </div>

                        {/* Apply button */}
                        <button onClick={() => applyFilters()}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 text-[12px] font-bold tracking-wide rounded-lg hover:bg-emerald-600/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-300">
                            <IconFilter size={13} />
                            Apply
                        </button>

                        {/* Clear filters */}
                        {hasFilters && (
                            <button onClick={clearAll}
                                className="flex items-center gap-2 px-3 py-2 border border-slate-700/50 text-slate-400 text-[12px] rounded-lg hover:text-rose-400 hover:border-rose-500/30 transition-all duration-300">
                                <IconRefresh size={13} />
                                Clear
                            </button>
                        )}

                        {/* Export CSV */}
                        {isAnalyst && (
                            <button onClick={exportCsv}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 text-[12px] font-medium rounded-lg hover:text-cyan-300 hover:border-cyan-500/40 transition-all ml-auto">
                                <IconDownload size={13} />
                                Export
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Logs table ── */}
                <div className="gt-glass border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl">

                    {/* Table header */}
                    <div className={`grid gap-3 px-5 py-4 border-b border-slate-700/50 bg-slate-950/60`}
                        style={{ gridTemplateColumns: isAdmin ? "140px 160px 1fr 100px 80px 130px 40px" : "140px 160px 1fr 100px 80px 130px" }}>
                        {["Level","Source","Payload","IP Address","Method","Timestamp"].map(h => (
                            <div key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</div>
                        ))}
                        {isAdmin && <div></div>}
                    </div>

                    {/* Rows */}
                    {logs?.data?.length > 0 ? (
                        logs.data.map((log, i) => (
                            <div key={log.id}
                                className={`gt-row`}
                                style={{ gridTemplateColumns: isAdmin ? "140px 160px 1fr 100px 80px 130px 40px" : "140px 160px 1fr 100px 80px 130px" }}>

                                <div><LevelBadge level={log.level} /></div>

                                <div className="text-[11px] text-slate-400 truncate font-mono">{log.source ?? "—"}</div>

                                <div className="text-[13px] text-slate-200 truncate pr-4">{log.message}</div>

                                <div className="text-[11px] text-slate-500 font-mono truncate">{log.ip_address ?? "—"}</div>

                                <div>
                                    {log.method && (
                                        <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold
                                            ${log.method === 'GET'    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                                            : log.method === 'POST'   ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                                            : log.method === 'DELETE' ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                                            : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'}`}>
                                            {log.method}
                                        </span>
                                    )}
                                </div>

                                <div className="text-[11px] text-slate-500 font-mono">
                                    {log.created_at ? new Date(log.created_at).toLocaleString('en-IN', {
                                        month:'short', day:'numeric',
                                        hour:'2-digit', minute:'2-digit', second:'2-digit'
                                    }) : log.time}
                                </div>

                                {isAdmin && (
                                    <div className="flex justify-end">
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(log.id); }}
                                            className="w-7 h-7 rounded bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-500 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-400 hover:shadow-[0_0_10px_rgba(244,63,94,0.2)] transition-all duration-300">
                                            <IconTrash size={13} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        // Empty state
                        <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-900/20">
                            <div className="w-16 h-16 rounded-2xl bg-cyan-900/20 border border-cyan-500/30 flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-float">
                                <IconDatabase size={28} className="text-cyan-400" />
                            </div>
                            <p className="text-[14px] font-bold text-slate-200 mb-1 tracking-wide">No Telemetry Found</p>
                            <p className="text-[12px] text-slate-500">
                                {hasFilters ? "Adjust search criteria or date range." : "Awaiting initial data ingestion."}
                            </p>
                            {hasFilters && (
                                <button onClick={clearAll}
                                    className="mt-5 text-[12px] text-cyan-400 hover:text-cyan-300 hover:underline transition-colors font-semibold">
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {logs?.meta?.last_page > 1 && (
                        <Pagination meta={logs.meta} links={logs.links} />
                    )}
                </div>

            </div>
        </AppLayout>
    );
}