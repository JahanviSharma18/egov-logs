import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

const CRITERIA = [
    { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
    { label: "At least one uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
    { label: "At least one lowercase letter", test: (pw) => /[a-z]/.test(pw) },
    { label: "At least one number (0-9)", test: (pw) => /[0-9]/.test(pw) },
    { label: "At least one special character (e.g. !@#$%^&*)", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const metCount = data.password ? CRITERIA.filter(c => c.test(data.password)).length : 0;

    const submit = (e) => {
        e.preventDefault();

        const metCount = CRITERIA.filter(c => c.test(data.password || '')).length;
        if (metCount < CRITERIA.length) {
            setPasswordError("Password must meet all of the security criteria below.");
            return;
        }
        setPasswordError('');

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            className="block w-full pr-10"
                            autoComplete="new-password"
                            onChange={(e) => {
                                setData('password', e.target.value);
                                if (passwordError) setPasswordError('');
                            }}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-cyan-400 transition-colors"
                        >
                            {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                        </button>
                    </div>

                    <InputError message={errors.password || passwordError} className="mt-2" />

                    {data.password && (
                        <div className="mt-3 space-y-3 p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 transition-all duration-300">
                            {/* Strength Label and Progress Bar */}
                            <div className="flex items-center justify-between text-[12px] font-bold">
                                <span className="text-slate-400 font-bold tracking-wide">Password Strength:</span>
                                <span className={
                                    metCount <= 2 ? "text-rose-400" :
                                    metCount <= 4 ? "text-amber-400" : "text-emerald-400"
                                }>
                                    {metCount === 0 ? "None" :
                                     metCount <= 2 ? "Weak" :
                                     metCount <= 4 ? "Medium" : "Strong"}
                                </span>
                            </div>
                            
                            {/* Progress Bar Grid */}
                            <div className="grid grid-cols-5 gap-1.5 h-1.5">
                                {[1, 2, 3, 4, 5].map((idx) => (
                                    <div
                                        key={idx}
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            idx <= metCount
                                                ? metCount <= 2
                                                    ? "bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                                    : metCount <= 4
                                                        ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                                        : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                                : "bg-slate-800"
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Criteria Checklist */}
                            <ul className="space-y-1.5 pt-1">
                                {CRITERIA.map((c, i) => {
                                    const isMet = c.test(data.password || '');
                                    return (
                                        <li key={i} className="flex items-center gap-2 text-[12px] font-medium transition-all duration-300">
                                            <span className={`flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-300 ${
                                                isMet 
                                                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]" 
                                                    : "bg-slate-900/50 border-slate-800 text-slate-500"
                                            }`}>
                                                {isMet ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-2.5 h-2.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                    </svg>
                                                ) : (
                                                    <span className="w-1 h-1 rounded-full bg-slate-500" />
                                                )}
                                            </span>
                                            <span className={isMet ? "text-slate-300" : "text-slate-500"}>{c.label}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <div className="relative mt-1">
                        <TextInput
                            id="password_confirmation"
                            type={showPasswordConfirmation ? "text" : "password"}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full pr-10"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-cyan-400 transition-colors"
                        >
                            {showPasswordConfirmation ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                        </button>
                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
