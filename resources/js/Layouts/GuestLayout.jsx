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
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.1)_0%,transparent_70%)] mix-blend-screen animate-aurora-shift" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.08)_0%,transparent_70%)] mix-blend-screen animate-aurora-shift" style={{ animationDelay: '5s' }} />
                
                {/* Noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

                {/* Floating particles */}
                <div className="absolute inset-0">
                    {[
                        {t:"8%",l:"10%",s:2,o:.30,d:"0s"}, {t:"15%",l:"45%",s:1,o:.20,d:"2s"},
                        {t:"5%", l:"75%",s:2,o:.25,d:"1s"}, {t:"25%",l:"88%",s:1,o:.15,d:"4s"},
                        {t:"70%",l:"12%",s:1,o:.20,d:"3s"}, {t:"80%",l:"60%",s:2,o:.25,d:"5s"},
                        {t:"90%",l:"30%",s:1,o:.15,d:"0.5s"}, {t:"60%",l:"85%",s:1,o:.18,d:"2.5s"},
                    ].map((s, i) => (
                        <div key={i} className="absolute rounded-full bg-cyan-400 animate-float shadow-[0_0_8px_#06b6d4]"
                            style={{ top: s.t, left: s.l, width: s.s, height: s.s, opacity: s.o, animationDelay: s.d }} />
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

                {/* Form card */}
                <div className="gt-glass border border-slate-700/50 rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] fade-up" style={{ animationDelay: '0.1s' }}>
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
