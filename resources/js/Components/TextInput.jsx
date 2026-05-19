import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#e0e0e0] text-[13px] rounded-lg px-4 py-2.5 ' +
                'placeholder:text-[#444] ' +
                'focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0)] focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-300 ' +
                'transition-colors ' +
                className
            }
            ref={localRef}
        />
    );
});
