// FILE LOCATION: resources/js/Pages/Roles/Index.jsx

import { Head, useForm, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    IconShieldCheck, IconPlus, IconTrash, IconCheck, IconX, IconUsers
} from "@tabler/icons-react";
import toast from "react-hot-toast";

export default function RolesIndex({ roles }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, reset, errors } = useForm({
        name: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("roles.store"), {
            onSuccess: () => {
                reset();
                toast.success("Role created successfully", { style: { background: "#1a1a1a", color: "#e0e0e0" } });
            },
        });
    };

    const handleDelete = (role) => {
        if (confirm(`Delete the custom role "${role.name}"? Users with this role will lose its permissions.`)) {
            // using a standard native delete (or you can use router)
            import("@inertiajs/react").then(({ router }) => {
                router.delete(route("roles.destroy", role.id), {
                    onSuccess: () => {
                        toast.success("Role deleted", { style: { background: "#1a1a1a", color: "#e0e0e0" } });
                    }
                });
            });
        }
    };

    // Protect system roles from deletion
    const SYSTEM_ROLES = ["admin", "analyst", "viewer"];

    const roleStyles = {
        "admin":   { cls: "bg-purple-900/30 text-purple-300 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]", icon: IconShieldCheck },
        "analyst": { cls: "bg-cyan-900/30 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]", icon: IconUser },
        "viewer":  { cls: "bg-slate-800/50 text-slate-300 border border-slate-600/50", icon: IconUser },
    };

    return (
        <AppLayout title="Roles & Access">
            <Head title="Roles & Access" />

            <div className="p-6 space-y-8 max-w-6xl mx-auto relative z-10">


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Form Panel */}
                    <div className="md:col-span-1 space-y-5 fade-up" style={{ animationDelay: '0.1s' }}>
                        <div className="gt-glass border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <h3 className="text-[14px] font-bold text-slate-100 mb-1 tracking-wide relative z-10">Create Custom Role</h3>
                            <p className="text-[11px] text-slate-400 mb-5 font-medium relative z-10">Define a new role before assigning it to users.</p>
                            
                            <form onSubmit={submit} className="space-y-4 relative z-10">
                                <div>
                                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5 ml-1">Role Name</label>
                                    <input 
                                        type="text" 
                                        value={data.name} 
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="e.g. editor, auditor"
                                        className={`w-full bg-slate-900/50 border ${errors.name ? 'border-rose-500/50' : 'border-slate-700/50'} rounded-xl px-4 py-2.5 text-[12px] text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-300`}
                                    />
                                    {errors.name && <p className="text-rose-400 text-[10px] mt-1 ml-1">{errors.name}</p>}
                                </div>
                                
                                <button disabled={processing} type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-4 py-2.5 rounded-xl text-[12px] font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all duration-300 disabled:opacity-50">
                                    <IconPlus size={14} /> Add Role
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Roles List */}
                    <div className="md:col-span-2 fade-up" style={{ animationDelay: '0.2s' }}>
                        <div className="gt-glass border border-slate-700/50 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                            <div className="grid grid-cols-12 gap-3 px-5 py-4 border-b border-slate-700/50 bg-slate-900/50">
                                <div className="col-span-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role Name</div>
                                <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Users</div>
                                <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</div>
                                <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</div>
                            </div>
                            
                            <div className="divide-y divide-slate-800/50">
                                {roles.map(role => {
                                    const isProtected = SYSTEM_ROLES.includes(role.name);
                                    const style = roleStyles[role.name] || { cls: "bg-slate-800/50 border-slate-700/50 text-slate-300", icon: IconShieldCheck };
                                    const IconComponent = style.icon;

                                    return (
                                        <div key={role.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-slate-800/30 transition-all duration-300 gt-row group">
                                            <div className="col-span-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider border transition-all duration-300 group-hover:shadow-[0_0_15px_inherit] ${style.cls}`}>
                                                    <IconComponent size={13} />
                                                    {role.name}
                                                </span>
                                            </div>
                                            <div className="col-span-3">
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                                                    <IconUsers size={13} className="text-slate-500" />
                                                    {role.users_count} user{role.users_count !== 1 && 's'}
                                                </div>
                                            </div>
                                            <div className="col-span-3">
                                                {isProtected ? (
                                                    <span className="text-[9px] px-2 py-1 rounded bg-slate-800/50 text-slate-400 border border-slate-600/50 uppercase font-bold tracking-widest shadow-inner">System Default</span>
                                                ) : (
                                                    <span className="text-[9px] px-2 py-1 rounded bg-cyan-900/30 text-cyan-300 border border-cyan-500/30 uppercase font-bold tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.2)]">Custom Role</span>
                                                )}
                                            </div>
                                            <div className="col-span-2 flex justify-end">
                                                {!isProtected && (
                                                    <button onClick={() => handleDelete(role)}
                                                        title="Delete Custom Role"
                                                        className="w-8 h-8 rounded-lg bg-slate-900/40 border border-slate-700/50 flex items-center justify-center text-slate-500 hover:bg-rose-900/40 hover:border-rose-500/50 hover:text-rose-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:scale-105">
                                                        <IconTrash size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
