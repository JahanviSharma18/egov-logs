// FILE LOCATION: resources/js/Pages/Users/Index.jsx

import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import {
    IconUsers, IconShieldCheck, IconTrash, IconPlus,
    IconCheck, IconX, IconCrown, IconUser, IconMail,
    IconClock, IconChevronDown,
} from "@tabler/icons-react";

// ─── Role badge config ────────────────────────────────────────
const ROLE_STYLES = {
    "admin":       { cls: "bg-purple-900/30 text-purple-300 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]",  icon: IconShieldCheck  },
    "analyst":     { cls: "bg-cyan-900/30   text-cyan-300   border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]",    icon: IconUser         },
    "viewer":      { cls: "bg-slate-800/50  text-slate-300  border-slate-600/50",    icon: IconUser         },
};

const DEFAULT_ROLE_STYLE = { cls: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25", icon: IconUser };

function RoleBadge({ role }) {
    const s = ROLE_STYLES[role] ?? DEFAULT_ROLE_STYLE;
    const Icon = s.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-md font-bold uppercase tracking-widest border transition-all duration-300 hover:shadow-[0_0_15px_inherit] ${s.cls}`}>
            <Icon size={11} />
            {role}
        </span>
    );
}

// ─── Role assign dropdown ─────────────────────────────────────
function RoleDropdown({ user, allRoles, onAssign }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAssign = (role) => {
        setLoading(true);
        setOpen(false);
        onAssign(user.id, role, () => setLoading(false));
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 border border-slate-700/50 rounded-lg text-[11px] font-bold text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-900/20 transition-all duration-300 disabled:opacity-50">
                <IconPlus size={11} />
                {loading ? "Assigning..." : "Assign Role"}
                <IconChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 gt-glass border border-slate-700/50 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-20 overflow-hidden fade-up">
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest px-4 pt-3 pb-2 border-b border-slate-800/50 bg-slate-950/50">Select Role Level</p>
                        {allRoles.map(role => {
                            const s = ROLE_STYLES[role] ?? DEFAULT_ROLE_STYLE;
                            const Icon = s.icon;
                            const hasRole = user.roles.includes(role);
                            return (
                                <button key={role}
                                    onClick={() => !hasRole && handleAssign(role)}
                                    disabled={hasRole}
                                    className={`w-full flex items-center gap-2 px-4 py-3 text-[12px] transition-all duration-300 text-left font-medium
                                        ${hasRole ? "text-slate-600 bg-slate-900/30 cursor-not-allowed" : "text-slate-300 hover:bg-slate-800 hover:text-cyan-300 hover:shadow-[inset_2px_0_0_#06b6d4]"}`}>
                                    <Icon size={14} className={hasRole ? "text-slate-600" : ""} />
                                    <span className="capitalize flex-1 tracking-wide">{role}</span>
                                    {hasRole && <IconCheck size={12} className="text-emerald-500 shadow-[0_0_8px_#10b981]" />}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

// ─── User row card ────────────────────────────────────────────
function UserCard({ user, allRoles, currentUserId, onAssign, onRemoveRole, onDelete }) {
    const [deleting, setDeleting] = useState(false);
    const isSelf = user.id === currentUserId;

    // Initials from name
    const initials = user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div className="gt-glass border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-500 gt-hover-lift group">
            <div className="flex items-start gap-4">

                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-600 to-emerald-600 flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-400/30">
                    {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[14px] font-bold text-slate-100 tracking-wide group-hover:text-cyan-300 transition-colors">{user.name}</span>
                        {isSelf && (
                            <span className="text-[8px] px-2 py-0.5 rounded bg-cyan-900/40 text-cyan-300 border border-cyan-500/50 font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.3)]">Current User</span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-[#555] mb-3">
                        <IconMail size={10} />
                        <span className="truncate">{user.email}</span>
                        <span className="mx-1">·</span>
                        <IconClock size={10} />
                        <span>{user.created_at}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {user.roles.length > 0 ? (
                            user.roles.map(role => (
                                <div key={role} className="flex items-center gap-1 group/badge relative">
                                    <RoleBadge role={role} />
                                    <button
                                        onClick={() => onRemoveRole(user.id, role)}
                                        className="opacity-0 group-hover/badge:opacity-100 absolute -right-2 -top-2 w-5 h-5 rounded-full bg-rose-900/80 border border-rose-500/50 flex items-center justify-center text-rose-300 transition-all hover:bg-rose-600 hover:text-white shadow-[0_0_10px_rgba(225,29,72,0.4)]">
                                        <IconX size={10} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <span className="text-[11px] text-slate-500 italic font-medium">No permissions assigned</span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <RoleDropdown user={user} allRoles={allRoles} onAssign={onAssign} />

                    {!isSelf && (
                        <>
                            <button
                                onClick={() => deleting ? onDelete(user.id) : setDeleting(true)}
                                title={deleting ? "Confirm permanent deletion" : "Revoke Access"}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                                    ${deleting ? "bg-rose-900/40 border border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.3)] animate-pulse" : "text-slate-500 hover:text-rose-400 hover:bg-rose-900/20 border border-transparent hover:border-rose-500/30"}`}>
                                {deleting ? <IconCheck size={14} /> : <IconTrash size={14} />}
                            </button>
                            {deleting && (
                                <button onClick={() => setDeleting(false)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#555] hover:text-[#999] hover:bg-[#1a1a1a] transition-all">
                                    <IconX size={13} />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────
export default function UsersIndex({ users = [], roles = [] }) {
    const { auth, flash } = usePage().props;
    const currentUserId = auth?.user?.id;

    const availableRoles = roles.length > 0
        ? roles
        : ["admin", "analyst", "viewer"];

    const handleAssign = (userId, role, done) => {
        router.post(route("users.assign-role", userId), { role }, {
            preserveScroll: true,
            onFinish: done,
        });
    };

    const handleRemoveRole = (userId, role) => {
        router.delete(route("users.remove-role", { user: userId, role }), {
            preserveScroll: true,
        });
    };

    const handleDelete = (userId) => {
        router.delete(route("users.destroy", userId), {
            preserveScroll: true,
        });
    };

    // Seed roles button — creates the 4 default roles via a quick POST
    const seedRoles = () => {
        router.post(route("users.seed-roles"), {}, { preserveScroll: true });
    };

    const roleCount    = users.reduce((acc, u) => acc + u.roles.length, 0);
    const noRoleCount  = users.filter(u => u.roles.length === 0).length;

    return (
        <AppLayout title="Users & Roles">
            <Head title="Users & Roles" />

            <div className="p-6 space-y-8 relative z-10">



                {/* ── Flash message ── */}
                {flash?.success && (
                    <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-500/40 text-emerald-300 text-[13px] px-5 py-3.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)] font-bold fade-up">
                        <IconCheck size={16} /> {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-2 bg-rose-900/30 border border-rose-500/40 text-rose-300 text-[13px] px-5 py-3.5 rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.2)] font-bold fade-up">
                        <IconX size={16} /> {flash.error}
                    </div>
                )}

                {/* ── Stats ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 fade-up" style={{ animationDelay: '0.1s' }}>
                    {[
                        { label: "Active Identities",     value: users.length,  color: "text-slate-100", glow: "shadow-[0_0_20px_rgba(255,255,255,0.05)]" },
                        { label: "Clearance Granted",     value: roleCount,     color: "text-emerald-400", glow: "shadow-[0_0_20px_rgba(16,185,129,0.1)]" },
                        { label: "Pending Assignment",    value: noRoleCount,   color: "text-amber-400", glow: "shadow-[0_0_20px_rgba(251,191,36,0.1)]" },
                    ].map(({ label, value, color, glow }) => (
                        <div key={label} className={`gt-glass border border-slate-700/50 rounded-2xl p-6 text-center ${glow} relative overflow-hidden group`}>
                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className={`text-4xl font-extrabold ${color} mb-1 drop-shadow-md`}>{value}</div>
                            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Role legend + seed button ── */}
                <div className="flex items-center justify-between flex-wrap gap-4 fade-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-3 flex-wrap bg-slate-900/40 border border-slate-800/50 px-4 py-2.5 rounded-xl">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mr-1">Clearance Tiers:</span>
                        {["admin", "analyst", "viewer"].map(r => (
                            <RoleBadge key={r} role={r} />
                        ))}
                    </div>

                    {roles.length === 0 && (
                        <button onClick={seedRoles}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold bg-cyan-900/30 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300">
                            <IconShieldCheck size={15} />
                            Initialize Core Framework
                        </button>
                    )}
                </div>

                {/* ── Section header ── */}
                <div className="fade-up" style={{ animationDelay: '0.3s' }}>
                    <h2 className="text-[16px] font-bold text-slate-200 tracking-wide flex items-center gap-2">
                        Personnel Directory <span className="text-cyan-400 bg-cyan-900/30 px-2 py-0.5 rounded-md text-[11px] font-mono shadow-[0_0_8px_rgba(6,182,212,0.2)]">{users.length}</span>
                    </h2>
                    <p className="text-[12px] text-slate-500 mt-1">
                        Use the assignment matrix to grant or revoke clearance level access.
                    </p>
                </div>

                {/* ── User list ── */}
                {users.length > 0 ? (
                    <div className="space-y-2.5">
                        {users.map((user, idx) => (
                            <div key={user.id} className="relative" style={{ zIndex: users.length - idx }}>
                                <UserCard
                                    user={user}
                                    allRoles={availableRoles}
                                    currentUserId={currentUserId}
                                    onAssign={handleAssign}
                                    onRemoveRole={handleRemoveRole}
                                    onDelete={handleDelete}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="gt-glass border border-slate-700/50 rounded-2xl p-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0idHJhbnNwYXJlbnQiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIvPgo8L3N2Zz4=')] opacity-50"></div>
                        <div className="relative z-10 flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-cyan-900/20 border border-cyan-500/30 flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-float">
                                <IconUsers size={28} className="text-cyan-400" />
                            </div>
                            <p className="text-[15px] font-bold text-slate-200 mb-1 tracking-wide">No Personnel Records</p>
                            <p className="text-[12px] text-slate-500">Register new identities via the authentication gateway to begin assignment.</p>
                        </div>
                    </div>
                )}

                {/* ── Info box ── */}
                <div className="gt-glass border border-slate-700/50 rounded-xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-700"></div>
                    <h4 className="text-[11px] font-bold text-slate-400 mb-3 flex items-center gap-1.5 uppercase tracking-widest relative z-10">
                        <IconShieldCheck size={14} className="text-cyan-400" />
                        Clearance Level Definitions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-[11px] text-slate-400 relative z-10">
                        {[
                            { role: "admin",       desc: "Master override — manage identities, clearances, and platform parameters" },
                            { role: "analyst",     desc: "Intelligence access — view telemetry, dashboards, and export datasets"    },
                            { role: "viewer",      desc: "Standard access — read-only monitoring of dashboards and logs"            },
                        ].map(({ role, desc }) => (
                            <div key={role} className="flex items-start gap-3 bg-slate-900/40 border border-slate-800/50 p-3 rounded-lg">
                                <RoleBadge role={role} />
                                <span className="mt-0.5 leading-relaxed font-medium">{desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
