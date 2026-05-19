export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center gap-2
                 bg-gradient-to-r from-emerald-600 to-cyan-600
                 hover:from-emerald-500 hover:to-cyan-500
                 text-white text-[13px] font-bold tracking-wide
                 px-5 py-2.5 rounded-lg
                 shadow-[0_0_15px_rgba(16,185,129,0.3)]
                 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]
                 transition-all duration-300
                 active:scale-[0.98]
                 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:ring-offset-2 focus:ring-offset-[#020617]
                 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                 ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
