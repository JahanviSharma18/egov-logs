import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { IconLock, IconMail, IconArrowRight, IconEye, IconEyeOff } from '@tabler/icons-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Sign In — GovTrace" />

            {/* Heading */}
            <div className="mb-6 text-center">
                <h2 className="text-[20px] font-bold text-slate-100 tracking-wide">Sign in to GovTrace</h2>
                <p className="text-[12px] text-slate-400 mt-1">Monitor e-governance logs and system activity</p>
            </div>

            {status && (
                <div className="mb-4 text-[12px] font-medium text-emerald-400 bg-emerald-900/30 border border-emerald-500/30 rounded-lg px-3 py-2 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value="Email address" className="text-slate-300" />
                    <div className="relative mt-1">
                        <IconMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="pl-10"
                            autoComplete="username"
                            isFocused={true}
                            placeholder="you@example.gov"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                {/* Password */}
                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-slate-300" />
                    <div className="relative mt-1">
                        <IconLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        <TextInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            className="pl-10 pr-10"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                        >
                            {showPassword ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="bg-slate-900/50 border-slate-700 checked:bg-cyan-500 focus:ring-cyan-500/30"
                        />
                        <span className="text-[12px] text-slate-400">Remember me</span>
                    </label>

                    <Link
                        href={route('password.request')}
                        className="text-[12px] text-cyan-400 hover:text-cyan-300 hover:underline transition-all duration-300"
                    >
                        Forgot password?
                    </Link>
                </div>

                {/* Submit */}
                <div className="pt-2">
                    <PrimaryButton className="w-full" disabled={processing}>
                        {processing ? 'Signing in…' : 'Sign in'}
                        {!processing && <IconArrowRight size={14} />}
                    </PrimaryButton>
                </div>

            </form>

            {/* Register link */}
            <p className="text-center text-[12px] text-slate-500 mt-6">
                Don't have an account?{' '}
                <Link href={route('register')} className="text-cyan-400 hover:text-cyan-300 hover:underline transition-all duration-300 font-bold tracking-wide">
                    Request access
                </Link>
            </p>
        </GuestLayout>
    );
}
