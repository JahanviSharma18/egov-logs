export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-[12px] font-semibold text-[#bbb] mb-1.5 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
