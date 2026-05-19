import React, { useEffect, useState } from 'react';

export default function AuroraBackground() {
    const [mounted, setMounted] = useState(false);
    
    // Generate static particle data once - Reduced from 25 to 8 for performance
    const [particles] = useState(() => 
        Array.from({ length: 8 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: `${Math.random() * 2 + 1}px`,
            duration: `${Math.random() * 30 + 20}s`,
            delay: `${Math.random() * 10}s`,
            opacity: Math.random() * 0.3 + 0.1,
        }))
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020617]">
            
            {/* Base Holographic Grid */}
            <div className="absolute inset-0 opacity-10 bg-aurora-grid"></div>
            
            {/* Cinematic Fog & Deep Aurora Blobs - Using radial gradients instead of heavy blur filters */}
            <div className="absolute top-[-30%] left-[-20%] w-[70vw] h-[70vw] bg-[radial-gradient(circle,rgba(6,182,212,0.08)_0%,transparent_70%)] rounded-full animate-aurora-slow"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(16,185,129,0.05)_0%,transparent_70%)] rounded-full animate-aurora-slow" style={{ animationDelay: '-7s' }}></div>
            <div className="absolute top-[20%] right-[30%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(20,184,166,0.03)_0%,transparent_70%)] rounded-full animate-aurora-slow" style={{ animationDelay: '-14s' }}></div>
            <div className="absolute bottom-[30%] left-[10%] w-[40vw] h-[40vw] bg-[radial-gradient(circle,rgba(99,102,241,0.03)_0%,transparent_70%)] rounded-full animate-aurora-slow" style={{ animationDelay: '-21s' }}></div>

            {/* Moving Light Beams - Hardware Accelerated */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-[20%] w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-light-beam"></div>
                <div className="absolute top-0 left-[60%] w-[2px] h-full bg-gradient-to-b from-transparent via-emerald-400 to-transparent animate-light-beam" style={{ animationDelay: '-5s' }}></div>
                <div className="absolute top-0 left-[85%] w-[1px] h-full bg-gradient-to-b from-transparent via-teal-300 to-transparent animate-light-beam" style={{ animationDelay: '-12s' }}></div>
            </div>

            {/* Subtle Floating Particles */}
            <div className="absolute inset-0">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="absolute rounded-full bg-cyan-300 animate-float-particle will-change-transform"
                        style={{
                            left: p.left,
                            top: p.top,
                            width: p.size,
                            height: p.size,
                            opacity: p.opacity,
                            animationDuration: p.duration,
                            animationDelay: p.delay,
                        }}
                    ></div>
                ))}
            </div>
            
            {/* Radial Vignette Overlay to focus center and darken edges */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#020617_100%)] opacity-90"></div>
        </div>
    );
}
