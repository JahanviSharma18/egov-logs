// FILE LOCATION: resources/js/Layouts/GuestLayout.jsx
// Dark-themed auth layout matching the GovTrace design system

import { Link } from '@inertiajs/react';
import { IconRadar } from '@tabler/icons-react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            {/* Cinematic Aurora Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* 3D Hardware Accelerated Glow Atmospheric Orbs */}
                <div className="absolute top-[-25%] left-[-15%] w-[80vw] h-[80vh] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.18)_0%,transparent_70%)] mix-blend-screen animate-aurora-shift will-change-transform" style={{ transform: 'translate3d(0,0,0)' }} />
                <div className="absolute bottom-[-20%] right-[-15%] w-[70vw] h-[70vh] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.14)_0%,transparent_70%)] mix-blend-screen animate-aurora-shift will-change-transform" style={{ animationDelay: '5s', transform: 'translate3d(0,0,0)' }} />
                <div className="absolute top-[30%] left-[25%] w-[50vw] h-[50vh] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.10)_0%,transparent_75%)] mix-blend-screen animate-aurora-shift will-change-transform" style={{ animationDelay: '10s', transform: 'translate3d(0,0,0)' }} />


                {/* Floating particles */}
                <div className="absolute inset-0">
                    {[
                        {t:"8%",l:"10%",s:2,o:.30,d:"0s"}, {t:"15%",l:"45%",s:1,o:.20,d:"2s"},
                        {t:"5%", l:"75%",s:2,o:.25,d:"1s"}, {t:"25%",l:"88%",s:1,o:.15,d:"4s"},
                        {t:"70%",l:"12%",s:1,o:.20,d:"3s"}, {t:"80%",l:"60%",s:2,o:.25,d:"5s"},
                        {t:"90%",l:"30%",s:1,o:.15,d:"0.5s"}, {t:"60%",l:"85%",s:1,o:.18,d:"2.5s"},
                    ].map((s, i) => (
                        <div key={i} className="absolute rounded-full bg-cyan-400 animate-float shadow-[0_0_8px_#06b6d4] will-change-transform"
                            style={{ top: s.t, left: s.l, width: s.s, height: s.s, opacity: s.o, animationDelay: s.d, transform: 'translate3d(0,0,0)' }} />
                    ))}
                </div>
                
                {/* Floor reflection / lighting */}
                <div className="absolute bottom-0 left-0 right-0 h-[30vh] bg-gradient-to-t from-cyan-900/10 to-transparent" />
            </div>

            {/* Card */}
            <div className="relative z-10 w-full max-w-md mx-4">

                {/* Logo header */}
                <div className="flex flex-col items-center mb-8 fade-up">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-shadow duration-500 relative">
                            <div className="absolute inset-0 border border-white/20 rounded-2xl"></div>
                            <IconRadar size={22} className="text-white" />
                        </div>
                        <div>
                            <div className="text-[22px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 tracking-wide">GovTrace</div>
                            <div className="text-[10px] text-cyan-400 font-bold tracking-[0.2em] uppercase mt-0.5 shadow-[0_0_10px_rgba(6,182,212,0)]">AICTE Intelligence</div>
                        </div>
                    </Link>
                </div>

                {/* Form card with stunning glow border & shadow */}
                <div className="gt-glass border border-cyan-500/25 rounded-2xl p-8 shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_50px_rgba(6,182,212,0.18)] hover:shadow-[0_12px_45px_rgba(0,0,0,0.7),0_0_60px_rgba(6,182,212,0.25)] hover:border-cyan-400/40 transition-all duration-500 fade-up" style={{ animationDelay: '0.1s' }}>
                    {children}
                </div>

                {/* Footer */}
                <p className="text-center text-[11px] text-slate-500 mt-6 fade-up font-medium tracking-wide" style={{ animationDelay: '0.2s' }}>
                    Secured by GovTrace · AICTE Intelligence Operations
                </p>
            </div>
        </div>
    );
}
