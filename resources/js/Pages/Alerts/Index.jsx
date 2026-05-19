// FILE LOCATION: resources/js/Pages/Alerts/Index.jsx

import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import {
    IconBellRinging, IconPlus, IconTrash, IconToggleLeft, IconToggleRight,
    IconMail, IconBrandSlack, IconAlertTriangle, IconShieldExclamation,
    IconAlertCircle, IconInfoCircle, IconCheck, IconX, IconClock
} from "@tabler/icons-react";

// ─── Config ──────────────────────────────────────────────────────
const LEVELS = ["debug", "info", "warning", "error", "critical", "security", "audit"];

const LEVEL_STYLES = {
    critical: { cls: "bg-purple-500/15 text-purple-300 border-purple-500/25", dot: "bg-purple-400" },
    security: { cls: "bg-pink-500/15 text-pink-300 border-pink-500/25",       dot: "bg-pink-400"   },
    error:    { cls: "bg-red-500/15 text-red-300 border-red-500/25",           dot: "bg-red-400"    },
    warning:  { cls: "bg-amber-500/15 text-amber-300 border-amber-500/25",     dot: "bg-amber-400"  },
    info:     { cls: "bg-blue-500/15 text-blue-300 border-blue-500/25",        dot: "bg-blue-400"   },
    audit:    { cls: "bg-green-500/15 text-green-300 border-green-500/25",     dot: "bg-green-400"  },
    debug:    { cls: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",        dot: "bg-zinc-400"   },
};

// ─── Level badge ─────────────────────────────────────────────────
function LevelBadge({ level }) {
    const s = LEVEL_STYLES[level] ?? LEVEL_STYLES.debug;
    return (
        <span className={`inline-flex items-center gap-1.5 text-[9px] px-2 py-1 rounded-md font-bold uppercase tracking-wider border ${s.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {level}
        </span>
    );
}

// ─── Toggle switch ───────────────────────────────────────────────
function Toggle({ active, onChange }) {
    return (
        <button
            onClick={onChange}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 border
                ${active ? "bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]" : "bg-slate-900/50 border-slate-700/50"}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300
                ${active ? "translate-x-6 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" : "translate-x-1 bg-slate-500"}`} />
        </button>
    );
}

// ─── Rule card ───────────────────────────────────────────────────
function RuleCard({ rule, onToggle, onDelete }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        if (!deleting) { setDeleting(true); return; }
        onDelete(rule.id);
    };

    return (
        <div className={`gt-glass border rounded-2xl p-5 transition-all duration-300 gt-row group
            ${rule.is_active ? "border-slate-700/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]" : "border-slate-800/50 opacity-60 hover:opacity-100"}`}>

            <div className="flex items-start gap-4">
                {/* Channel icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105
                    ${rule.channel === "slack" ? "bg-purple-900/30 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]" : "bg-cyan-900/30 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]"}`}>
                    {rule.channel === "slack"
                        ? <IconBrandSlack size={18} className="text-purple-400" />
                        : <IconMail size={18} className="text-cyan-400" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                        <span className="text-[14px] font-bold text-slate-100 truncate tracking-wide">{rule.name}</span>
                        <LevelBadge level={rule.trigger_level} />
                    </div>

                    <div className="text-[12px] text-slate-400 truncate mb-2.5 font-medium">
                        {rule.channel === "slack" ? "Slack webhook" : "Email"} <span className="text-slate-600 mx-1">→</span> <span className="text-slate-300">{rule.recipient}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                        <IconClock size={13} className="text-slate-600" />
                        <span>Cooldown: <span className="text-cyan-400/80">{rule.cooldown_minutes} min</span></span>
                        {!rule.is_active && (
                            <span className="ml-2 text-rose-400/80 border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 rounded">Disabled</span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 flex-shrink-0 pl-2">
                    <Toggle active={rule.is_active} onChange={() => onToggle(rule.id)} />

                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleDelete}
                            title={deleting ? "Click again to confirm" : "Delete rule"}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
                                ${deleting
                                    ? "bg-rose-900/40 text-rose-300 border border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.3)] scale-105"
                                    : "text-slate-500 hover:text-rose-400 hover:bg-rose-900/20 border border-transparent hover:border-rose-500/30"}`}>
                            {deleting ? <IconCheck size={16} /> : <IconTrash size={16} />}
                        </button>

                        {deleting && (
                            <button onClick={() => setDeleting(false)}
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50 transition-all duration-300">
                                <IconX size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main page ───────────────────────────────────────────────────
export default function AlertsIndex({ rules = [] }) {
    const { flash } = usePage().props;

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: "",
        trigger_level: "critical",
        channel: "mail",
        recipient: "",
        cooldown_minutes: 15,
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        router.post(route("alerts.store"), form, {
            onError: (errs) => { setErrors(errs); setSubmitting(false); },
            onSuccess: () => {
                setSubmitting(false);
                setShowForm(false);
                setForm({ name: "", trigger_level: "critical", channel: "mail", recipient: "", cooldown_minutes: 15 });
            },
        });
    };

    const handleToggle = (id) => {
        router.patch(route("alerts.toggle", id), {}, { preserveScroll: true });
    };

    const handleDelete = (id) => {
        router.delete(route("alerts.destroy", id), { preserveScroll: true });
    };

    const activeCount   = rules.filter(r => r.is_active).length;
    const inactiveCount = rules.length - activeCount;

    return (
        <AppLayout title="Alerts">
            <Head title="Alerts" />

            <div className="p-5 space-y-5">

                {/* ── Flash message ── */}
                {flash?.success && (
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-300 text-[12px] px-4 py-3 rounded-lg">
                        <IconCheck size={14} />
                        {flash.success}
                    </div>
                )}

                {/* ── Stats row ── */}
                <div className="grid grid-cols-3 gap-4 fade-up">
                    {[
                        { label: "Total Rules",   value: rules.length,  color: "text-slate-100", glow: "shadow-[0_0_15px_rgba(255,255,255,0.05)]" },
                        { label: "Active",        value: activeCount,   color: "text-cyan-400", glow: "shadow-[0_0_15px_rgba(6,182,212,0.15)]" },
                        { label: "Disabled",      value: inactiveCount, color: "text-slate-500", glow: "" },
                    ].map(({ label, value, color, glow }) => (
                        <div key={label} className={`gt-glass border border-slate-700/50 rounded-2xl p-6 text-center ${glow} transition-all duration-300 gt-hover-lift`}>
                            <div className={`text-[32px] font-extrabold ${color} tracking-tighter`}>{value}</div>
                            <div className="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-widest">{label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Section header ── */}
                <div className="flex items-center justify-between fade-up" style={{ animationDelay: '0.1s' }}>
                    <div>
                        <h2 className="text-[16px] font-bold text-slate-100 tracking-wide">Notification Rules</h2>
                        <p className="text-[12px] text-slate-400 mt-1 font-medium">
                            Alerts are dispatched when an intercepted anomaly matches a rule's criteria.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-300
                            ${showForm
                                ? "bg-slate-900/50 border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                                : "bg-cyan-900/30 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"}`}>
                        {showForm ? <IconX size={15} /> : <IconPlus size={15} />}
                        {showForm ? "Cancel Creation" : "Add New Rule"}
                    </button>
                </div>

                {/* ── Add rule form ── */}
                {showForm && (
                    <form onSubmit={handleSubmit}
                        className="gt-glass border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.1)] space-y-5 fade-up">
                        
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[40px] rounded-full pointer-events-none"></div>

                        <h3 className="text-[14px] font-bold text-cyan-400 flex items-center gap-2 tracking-wide relative z-10">
                            <IconBellRinging size={16} />
                            Configure Alert Policy
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">

                            {/* Name */}
                            <div className="md:col-span-2">
                                <label className="block text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2 ml-1">Rule Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => set("name", e.target.value)}
                                    placeholder="e.g. Critical Breach Alert"
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-[13px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0)] focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                />
                                {errors.name && <p className="text-[11px] font-bold text-rose-400 mt-1.5 ml-1">{errors.name}</p>}
                            </div>

                            {/* Trigger level */}
                            <div>
                                <label className="block text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2 ml-1">Trigger Severity</label>
                                <select
                                    value={form.trigger_level}
                                    onChange={e => set("trigger_level", e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-[13px] text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-300 cursor-pointer capitalize shadow-[0_0_10px_rgba(6,182,212,0)] focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                                    {LEVELS.map(l => (
                                        <option key={l} value={l} className="capitalize">{l}</option>
                                    ))}
                                </select>
                                {errors.trigger_level && <p className="text-[11px] font-bold text-rose-400 mt-1.5 ml-1">{errors.trigger_level}</p>}
                            </div>

                            {/* Channel */}
                            <div>
                                <label className="block text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2 ml-1">Dispatch Channel</label>
                                <div className="flex gap-3">
                                    {["mail", "slack"].map(ch => (
                                        <button
                                            key={ch}
                                            type="button"
                                            onClick={() => set("channel", ch)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-bold tracking-wide border transition-all duration-300
                                                ${form.channel === ch
                                                    ? ch === "slack" ? "bg-purple-900/30 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "bg-cyan-900/30 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                                                    : "bg-slate-900/50 border-slate-700/50 text-slate-500 hover:border-slate-500/50 hover:text-slate-300"}`}>
                                            {ch === "slack" ? <IconBrandSlack size={16} /> : <IconMail size={16} />}
                                            {ch.charAt(0).toUpperCase() + ch.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                {errors.channel && <p className="text-[11px] font-bold text-rose-400 mt-1.5 ml-1">{errors.channel}</p>}
                            </div>

                            {/* Recipient */}
                            <div>
                                <label className="block text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2 ml-1">
                                    {form.channel === "slack" ? "Webhook Endpoint" : "Target Address"}
                                </label>
                                <input
                                    type={form.channel === "mail" ? "email" : "text"}
                                    value={form.recipient}
                                    onChange={e => set("recipient", e.target.value)}
                                    placeholder={form.channel === "slack" ? "https://hooks.slack.com/services/..." : "admin@governance.system"}
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-[13px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-300 font-mono shadow-[0_0_10px_rgba(6,182,212,0)] focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                />
                                {errors.recipient && <p className="text-[11px] font-bold text-rose-400 mt-1.5 ml-1">{errors.recipient}</p>}
                            </div>

                            {/* Cooldown */}
                            <div>
                                <label className="block text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2 ml-1">
                                    Anti-Flood Cooldown (mins)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="1440"
                                    value={form.cooldown_minutes}
                                    onChange={e => set("cooldown_minutes", parseInt(e.target.value))}
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-[13px] text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0)] focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                />
                                <p className="text-[10px] font-medium text-slate-500 mt-2 ml-1">Prevents alert fatigue during high-volume incidents.</p>
                                {errors.cooldown_minutes && <p className="text-[11px] font-bold text-rose-400 mt-1.5 ml-1">{errors.cooldown_minutes}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 relative z-10">
                            <button type="button" onClick={() => setShowForm(false)}
                                className="px-5 py-2.5 rounded-xl text-[12px] font-bold border border-slate-700/50 bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all duration-300">
                                Abort
                            </button>
                            <button type="submit" disabled={submitting}
                                className="px-6 py-2.5 rounded-xl text-[13px] font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white disabled:opacity-60 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                                {submitting ? "Deploying Rule..." : "Deploy Rule"}
                            </button>
                        </div>
                    </form>
                )}

                {/* ── Rules list ── */}
                {rules.length > 0 ? (
                    <div className="space-y-3 fade-up" style={{ animationDelay: '0.2s' }}>
                        {rules.map(rule => (
                            <RuleCard
                                key={rule.id}
                                rule={rule}
                                onToggle={handleToggle}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="gt-glass border border-slate-700/50 rounded-2xl relative overflow-hidden fade-up" style={{ animationDelay: '0.2s' }}>
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0idHJhbnNwYXJlbnQiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIvPgo8L3N2Zz4=')] opacity-50"></div>
                        <div className="flex flex-col items-center justify-center py-20 text-center relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-cyan-900/20 border border-cyan-500/30 flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-float">
                                <IconBellRinging size={28} className="text-cyan-400" />
                            </div>
                            <p className="text-[15px] font-bold text-slate-200 mb-1 tracking-wide">No Active Policies</p>
                            <p className="text-[12px] text-slate-500 mb-6 font-medium">
                                Deploy an alert policy to intercept critical telemetry data automatically.
                            </p>
                            <button onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-cyan-900/30 border border-cyan-500/40 text-cyan-400 text-[12px] font-bold rounded-xl hover:bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300">
                                <IconPlus size={15} />
                                Initialize Policy
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Info box ── */}
                <div className="gt-glass border border-slate-700/50 rounded-xl p-5 relative overflow-hidden group fade-up" style={{ animationDelay: '0.3s' }}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-700"></div>
                    <h4 className="text-[11px] font-bold text-slate-400 mb-3 flex items-center gap-1.5 uppercase tracking-widest relative z-10">
                        <IconInfoCircle size={14} className="text-cyan-400" />
                        System Notification Matrix
                    </h4>
                    <ul className="space-y-2 text-[11px] text-slate-400 leading-relaxed font-medium relative z-10">
                        <li><span className="text-cyan-500 mr-1.5">◆</span> Telemetry ingested via <code className="text-slate-300 bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-800/50">/api/ingest-log</code> is routed through AI classification.</li>
                        <li><span className="text-cyan-500 mr-1.5">◆</span> Matches against <strong className="text-slate-200 tracking-wide">Severity Triggers</strong> immediately dispatch an alert payload.</li>
                        <li><span className="text-cyan-500 mr-1.5">◆</span> <strong className="text-slate-200 tracking-wide">Anti-Flood Cooldowns</strong> suppress duplicate alerts for the specified timeframe.</li>
                        <li><span className="text-cyan-500 mr-1.5">◆</span> Ensure full HTTPS endpoint URLs are provided for external integrations like Slack.</li>
                    </ul>
                </div>

            </div>
        </AppLayout>
    );
}
