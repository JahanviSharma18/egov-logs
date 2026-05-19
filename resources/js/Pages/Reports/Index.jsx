// FILE LOCATION: resources/js/Pages/Reports/Index.jsx

import { Head } from "@inertiajs/react";
import { useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import {
    IconChartBar, IconDownload, IconFileReport, 
    IconFileSpreadsheet, IconCalendarEvent, IconFilter,
    IconLoader2
} from "@tabler/icons-react";

export default function ReportsIndex({ sources = [], levels = [] }) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate]     = useState("");
    const [level, setLevel]         = useState("all");
    const [source, setSource]       = useState("all");
    
    // UI state for fake loading delay (since native form submits trigger immediate download)
    const [exportingPdf, setExportingPdf] = useState(false);
    const [exportingCsv, setExportingCsv] = useState(false);

    // We use a native form submit to trigger the browser's download prompt
    const handleExport = (format) => {
        // We delay the React state update by a tick so the browser has time to fire the native form submit event.
        // If we disable the button instantly, the browser cancels the submit.
        setTimeout(() => {
            if (format === 'pdf') {
                setExportingPdf(true);
                setTimeout(() => setExportingPdf(false), 2000);
            } else {
                setExportingCsv(true);
                setTimeout(() => setExportingCsv(false), 2000);
            }
        }, 50);
    };

    return (
        <AppLayout title="Reports">
            <Head title="Reports & Exports" />

            <div className="p-6 space-y-8 max-w-5xl mx-auto mt-4 relative z-10">
                
                <div className="gt-glass border border-slate-700/50 rounded-3xl p-8 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden group fade-up" style={{ animationDelay: '0.1s' }}>
                    
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] group-hover:text-cyan-400 transition-all duration-700">
                        <IconFileReport size={240} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <form action={route('reports.export')} method="POST" className="relative z-10">
                        {/* CSRF Token required for native form POST */}
                        <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            
                            {/* Date Range */}
                            <div className="space-y-5">
                                <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <IconCalendarEvent size={15} className="text-cyan-400" /> Temporal Range
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Start Date</label>
                                        <input type="date" name="start_date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-[13px] text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0)] focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] [color-scheme:dark]" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">End Date</label>
                                        <input type="date" name="end_date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-[13px] text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0)] focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] [color-scheme:dark]" />
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="space-y-5">
                                <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <IconFilter size={15} className="text-cyan-400" /> Telemetry Filters
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Severity Level</label>
                                        <select name="level" value={level} onChange={e => setLevel(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-[13px] text-slate-200 outline-none focus:border-cyan-500/50 transition-all duration-300 appearance-none cursor-pointer focus:ring-1 focus:ring-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0)] focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                                            <option value="all">All Levels</option>
                                            {levels.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Source Node</label>
                                        <select name="source" value={source} onChange={e => setSource(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-[13px] text-slate-200 outline-none focus:border-cyan-500/50 transition-all duration-300 appearance-none cursor-pointer focus:ring-1 focus:ring-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0)] focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                                            <option value="all">All Sources</option>
                                            {sources.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Export Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 border-t border-slate-700/50">
                            <button type="submit" name="format" value="pdf" onClick={() => handleExport('pdf')} disabled={exportingPdf}
                                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-[14px] font-bold transition-all duration-300 disabled:opacity-70 disabled:cursor-wait shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                                {exportingPdf ? <IconLoader2 size={18} className="animate-spin" /> : <IconDownload size={18} />}
                                Download PDF Report
                            </button>
                            
                            <button type="submit" name="format" value="csv" onClick={() => handleExport('csv')} disabled={exportingCsv}
                                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:bg-slate-800/80 hover:border-cyan-500/40 hover:text-cyan-300 text-slate-300 text-[14px] font-bold transition-all duration-300 disabled:opacity-70 disabled:cursor-wait hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                                {exportingCsv ? <IconLoader2 size={18} className="animate-spin" /> : <IconFileSpreadsheet size={18} />}
                                Export Raw CSV
                            </button>
                        </div>
                    </form>
                </div>

                <div className="text-center mt-8 fade-up" style={{ animationDelay: '0.2s' }}>
                    <p className="text-[12px] text-slate-500 flex items-center justify-center gap-2 font-medium">
                        <IconChartBar size={14} className="text-cyan-500" />
                        All extraction procedures are recorded in the Audit Trail for governance compliance.
                    </p>
                </div>

            </div>
        </AppLayout>
    );
}
