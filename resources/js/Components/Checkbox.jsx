export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-slate-700/50 bg-slate-900/50 text-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.1)] focus:ring-cyan-500/40 focus:ring-offset-0 transition-all duration-300 ' +
                className
            }
        />
    );
}
