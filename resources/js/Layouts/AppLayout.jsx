// FILE LOCATION: resources/js/Layouts/AppLayout.jsx
// REPLACE entire file — adds NotificationBell + fixes nav links

import { useState, useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import NotificationBell from "@/Components/NotificationBell";
import AuroraBackground from "@/Components/AuroraBackground";
import toast from "react-hot-toast";
import {
    IconLayoutDashboard, IconFileText, IconBellRinging,
    IconUsers, IconShieldCheck, IconChartBar, IconHistory,
    IconSettings, IconRadar, IconSearch, IconMoon, IconSun,
    IconChevronDown, IconDotsVertical, IconLogout, IconX, IconMenu2
} from "@tabler/icons-react";

export default function AppLayout({ children, title = "Dashboard" }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    // Recent critical/security logs for the bell — passed from controllers via shared data
    // Falls back to empty array if not provided
    const recentAlerts = usePage().props.recentAlerts ?? [];

    const [dark, setDark]               = useState(() => {
        // Default to dark, but check localStorage if we want persistence
        return localStorage.getItem('theme') !== 'light';
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem('theme', 'light');
        }
    }, [dark]);

    const initials = user?.name
        ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
        : "U";

    // Check if current path matches nav href
    const isActive = (href) => {
        if (!href || href === "#") return false;
        try {
            const path = new URL(href, window.location.origin).pathname;
            return window.location.pathname === path || window.location.pathname.startsWith(path + "/");
        } catch {
            return false;
        }
    };

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route("logout"));
    };

    // Click handler — shows "coming soon" toast for placeholder # links
    const handleNavClick = (href, label, e) => {
        if (!href || href === "#") {
            e.preventDefault();
            setSidebarOpen(false);
            toast(`"${label}" is coming soon!`, {
                icon: "🚧",
                style: {
                    background: "#1a1a1a",
                    color: "#e0e0e0",
                    border: "1px solid #2a2a2a",
                    fontSize: "13px",
                },
            });
        } else {
            setSidebarOpen(false);
        }
    };

    // Determine role hierarchy
    const userRoles = user?.roles || [];
    const isAdmin = userRoles.includes('admin');
    const isAnalyst = userRoles.includes('analyst') || isAdmin;
    const isViewer = userRoles.includes('viewer') || isAnalyst;

    // Nav items conditionally rendered
    const NAV = [
        {
            section: "Monitor",
            items: [
                { label: "Dashboard",      href: route("dashboard"),  icon: IconLayoutDashboard, badge: null, show: true },
                { label: "Log Entries",    href: route("logs.index"), icon: IconFileText,        badge: null, show: true },
                { label: "Alerts",         href: route("alerts.index"), icon: IconBellRinging,   badge: null, show: isAdmin },
            ].filter(i => i.show)
        },
        {
            section: "Governance",
            showSection: isAnalyst, // Only Analyst and above see this section
            items: [
                { label: "Users",          href: route("users.index"), icon: IconUsers,       badge: null, show: isAdmin },
                { label: "Roles & Access", href: route("roles.index"), icon: IconShieldCheck, badge: null, show: isAdmin },
                { label: "Reports",        href: route("reports.index"), icon: IconChartBar,    badge: null, show: isAnalyst },
                { label: "Audit Trail",    href: route("audit.index"), icon: IconHistory,     badge: null, show: isAnalyst },
            ].filter(i => i.show)
        },
        {
            section: "System",
            showSection: isAdmin, // Only Admin and above see this section
            items: [
                { label: "Settings",       href: route("settings.index"), icon: IconSettings,    badge: null, show: isAdmin },
            ].filter(i => i.show)
        },
    ].filter(s => s.showSection !== false && s.items.length > 0);

    return (
        <div className="flex h-screen overflow-hidden bg-[#020617] relative" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            {/* ── Aurora Background ── */}
            <AuroraBackground />

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)} />
            )}

            {/* ══ SIDEBAR ══ */}
            <div className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-10 w-[240px] lg:w-[260px] lg:p-4 flex-shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
                <aside className="h-full flex flex-col gt-glass rounded-r-2xl lg:rounded-3xl border border-cyan-500/10 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden relative bg-slate-950/90 backdrop-blur-sm">
                    
                    {/* Ambient light inside sidebar */}
                    <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none"></div>
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800/50">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <IconRadar size={20} className="text-white" />
                    </div>
                    <div>
                        <div className="text-[18px] font-bold text-white tracking-wide">GovTrace</div>
                        <div className="text-[10px] text-[#888] tracking-widest uppercase mt-0.5">AICTE E-Gov</div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
                    {NAV.map(({ section, items }) => (
                        <div key={section}>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] px-2 mb-2">{section}</p>
                            <ul className="space-y-0.5">
                                {items.map(({ label, href, icon: Icon, badge }) => {
                                    const active = isActive(href);
                                    const isPlaceholder = !href || href === "#";
                                    return (
                                        <li key={label} className="relative">
                                            <Link
                                                href={href || "#"}
                                                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all duration-300 group overflow-hidden
                                                    ${active
                                                        ? "text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15),inset_0_1px_1px_rgba(255,255,255,0.1)]"
                                                        : isPlaceholder
                                                            ? "text-slate-500 hover:bg-slate-800/30 hover:text-slate-400 cursor-pointer border border-transparent"
                                                            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent hover:border-slate-700/50"
                                                    }`}
                                                onClick={(e) => handleNavClick(href, label, e)}>
                                                {active && (
                                                    <>
                                                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_15px_#06b6d4]" />
                                                        <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent opacity-50" />
                                                    </>
                                                )}
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 relative z-10 flex-shrink-0
                                                    ${active 
                                                        ? "bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-cyan-400/50" 
                                                        : "bg-slate-800/40 border border-slate-700/30 group-hover:bg-slate-800/80 group-hover:border-slate-600/50"
                                                    }`}>
                                                    <Icon size={16} className={`transition-colors duration-300 ${active ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                                                </div>
                                                <span className="flex-1 relative z-10 font-bold tracking-wide">{label}</span>
                                                {isPlaceholder && !active && (
                                                    <span className="text-[8px] px-1.5 py-0.5 rounded font-medium bg-slate-800/50 text-slate-500 border border-slate-700/50 relative z-10">Soon</span>
                                                )}
                                                {badge && !isPlaceholder && (
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold relative z-10
                                                        ${active ? "bg-cyan-900/40 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                                                        {badge}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* User */}
                <div className="px-3 pb-4 pt-3 border-t border-slate-800/50 space-y-1.5">
                    <p className="text-[10px] text-slate-500 px-3 truncate">{user?.email}</p>
                    <button onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:shadow-[0_0_20px_rgba(225,29,72,0.5)] border border-rose-500 transition-all duration-300">
                        <IconLogout size={14} />
                        Sign Out
                    </button>
                    <Link href={route("profile.edit")} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 mt-1 hover:border-cyan-500/30 transition-all duration-300 group">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.2)] group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-shadow">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-semibold text-slate-200 truncate group-hover:text-cyan-400 transition-colors">{user?.name}</div>
                            <div className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider">
                                {userRoles.length > 0 ? userRoles[0].replace('-', ' ') : 'User'}
                            </div>
                        </div>
                        <IconDotsVertical size={13} className="text-slate-500 flex-shrink-0 group-hover:text-cyan-400 transition-colors" />
                    </Link>
                </div>
                </aside>
            </div>

            {/* ══ MAIN ══ */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">

                {/* Topbar */}
                <header className="relative z-30 flex items-center gap-3 px-5 h-16 border-b border-slate-800/60 bg-slate-900/90 backdrop-blur-sm flex-shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                    <button className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-colors"
                        onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <IconX size={18}/> : <IconMenu2 size={18}/>}
                    </button>

                    <h1 className="text-[15px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 flex-1 tracking-wide">{title}</h1>

                    <Link href={route("logs.index")} className="hidden md:flex items-center gap-2 bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-[11px] text-slate-400 w-64 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:text-cyan-300 transition-all duration-300 cursor-pointer">
                        <IconSearch size={13} className="text-slate-500" />
                        <span>Search surveillance logs...</span>
                        <span className="ml-auto text-[9px] border border-slate-700 rounded px-1.5 py-0.5 text-slate-500">⌘K</span>
                    </Link>

                    {/* Notification bell with dropdown */}
                    <NotificationBell recentAlerts={recentAlerts} />

                    <button onClick={() => setDark(!dark)}
                        className="w-9 h-9 border border-slate-700/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-cyan-900/20 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                        {dark ? <IconSun size={16}/> : <IconMoon size={16}/>}
                    </button>

                    <Link href={route("profile.edit")} className="flex items-center gap-2 bg-slate-900/50 border border-slate-700/50 rounded-lg px-2.5 py-1.5 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center text-[9px] font-bold text-white group-hover:shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-shadow">
                            {initials}
                        </div>
                        <span className="text-[12px] text-slate-200 hidden sm:block font-medium group-hover:text-cyan-400 transition-colors">{user?.name?.split(" ")[0]}</span>
                        <IconChevronDown size={11} className="text-slate-500 group-hover:text-cyan-400" />
                    </Link>
                </header>

                <main className="relative z-10 flex-1 overflow-auto flex flex-col">
                    <div className="flex-1 relative z-10 p-2 sm:p-4">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}