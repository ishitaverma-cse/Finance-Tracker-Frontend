import { useState } from 'react'
import {
    Eye,
    EyeOff,
    CircleX,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL

function Login({ onSwitchToRegister }) {
    const { login } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleEmailChange = (event) => {
        const value = event.target.value
        setEmail(value)

        setErrors((previous) => ({
            ...previous,
            email: '',
            password: '',
            general: '',
        }))
    }

    const handlePasswordChange = (event) => {
        setPassword(event.target.value)

        setErrors((previous) => ({
            ...previous,
            password: '',
            general: '',
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        const normalizedEmail = email.trim()
        const newErrors = {}

        if (!normalizedEmail) {
            newErrors.email = 'Please enter your email address.'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            newErrors.email = 'Please enter a valid email address.'
        }

        if (!password) {
            newErrors.password = 'Please enter your password.'
        }

        setErrors(newErrors)

        if (Object.keys(newErrors).length > 0) return

        if (!API_URL) {
            setErrors({
                general: 'The server configuration is missing. Please try again later.',
            })
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: normalizedEmail,
                    password,
                }),
            })

            let data

            try {
                data = await response.json()
            } catch {
                throw new Error('The server returned an unexpected response.')
            }

            if (!response.ok) {
                if (response.status === 401) {
                    setErrors({
                        password: 'Incorrect email or password. Please try again.',
                    })
                    return
                }

                throw new Error(data.message || 'Login failed. Please try again.')
            }

            if (!data.token || !data.user) {
                throw new Error('The server returned an invalid login response.')
            }

            login(data.user, data.token)
        } catch (error) {
            setErrors({
                general:
                    error.message === 'Failed to fetch'
                        ? 'Unable to connect to the server. Please check your connection and try again.'
                        : error.message,
            })
        } finally {
            setLoading(false)
        }
    }

    const inputClass = (field) =>
        `w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-stone-800 outline-none transition duration-200 placeholder:text-stone-400 focus:ring-4 ${
            errors[field]
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                : 'border-stone-200 focus:border-emerald-700 focus:ring-emerald-100'
        }`

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#F8F7F2] lg:grid lg:h-screen lg:min-h-0 lg:grid-cols-[0.95fr_1.05fr] lg:overflow-hidden">

            {/* Left Branding Panel */}
            <section className="relative hidden h-screen overflow-hidden bg-[#123D2B] px-8 py-6 text-white lg:flex lg:flex-col xl:px-12">

                {/* Background Decoration */}
                <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

                {/* Brand */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5F3E8] text-[#14532D] shadow-lg">
                        <Wallet size={25} strokeWidth={2.3} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">
                            Thrive<span className="text-[#86C99A]">.</span>
                        </h1>
                        <p className="text-xs font-medium tracking-wide text-emerald-100/70">
                            Personal Finance
                        </p>
                    </div>
                </div>

                {/* Main Brand Message */}
                <div className="relative z-10 my-auto max-w-xl py-6">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
                        <Sparkles size={14} />
                        Your money. Your future.
                    </div>

                    <h2 className="text-5xl font-extrabold leading-[1.15] tracking-tight xl:text-6xl">
                        Make your money
                        <span className="mt-2 block text-[#9DD8A9]">
                            work for you.
                        </span>
                    </h2>

                    <p className="mt-6 max-w-md text-base leading-7 text-emerald-100/75">
                        Build healthier financial habits, stay on top of your spending,
                        and turn your goals into progress — one step at a time.
                    </p>

                    {/* Decorative Financial Cards */}
                    <div className="mt-7 max-w-md space-y-3">

                        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-emerald-100/65">
                                        Your financial journey
                                    </p>
                                    <p className="mt-1 text-xl font-bold">
                                        Small steps. Big growth.
                                    </p>
                                </div>

                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/15 text-[#9DD8A9]">
                                    <TrendingUp size={24} />
                                </div>
                            </div>

                            <div className="mt-4 flex h-12 items-end gap-2">
                                {[35, 48, 40, 62, 52, 76, 66, 92].map((height, index) => (
                                    <div
                                        key={index}
                                        className="flex-1 rounded-t-lg bg-gradient-to-t from-emerald-500/50 to-[#A7E5B3]"
                                        style={{ height: `${height}%` }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                                <div className="flex items-center gap-2 text-emerald-200">
                                    <ArrowDownRight size={18} />
                                    <span className="text-xs font-semibold">Income</span>
                                </div>
                                <p className="mt-2 text-sm font-bold text-white">
                                    Track every win
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                                <div className="flex items-center gap-2 text-rose-200">
                                    <ArrowUpRight size={18} />
                                    <span className="text-xs font-semibold">Expenses</span>
                                </div>
                                <p className="mt-2 text-sm font-bold text-white">
                                    Spend with purpose
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Right Authentication Panel */}
            <section className="flex min-h-screen items-center justify-center px-5 py-6 sm:px-8 lg:h-screen lg:min-h-0 lg:overflow-y-auto lg:px-10 lg:py-5">

                <div className="w-full max-w-md">

                    {/* Mobile Brand */}
                    <div className="mb-9 flex items-center gap-3 lg:hidden">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-800 text-white">
                            <Wallet size={23} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-emerald-950">
                                Thrive<span className="text-emerald-600">.</span>
                            </h1>
                            <p className="text-xs text-stone-500">
                                Personal Finance
                            </p>
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="mb-5">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E8F3EA] px-3 py-1.5 text-xs font-bold text-emerald-800">
                            <Sparkles size={14} />
                            YOUR FINANCIAL JOURNEY
                        </div>

                        <h2 className="text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">
                            Welcome back!
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-stone-500">
                            Continue building a healthier relationship with your money.
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="rounded-[2rem] border border-stone-200/80 bg-white p-5 shadow-[0_12px_45px_rgba(31,55,38,0.07)] sm:p-6">

                        <div className="mb-5">
                            <h3 className="text-xl font-bold text-stone-900">
                                Sign in to Thrive
                            </h3>
                            <p className="mt-1.5 text-sm text-stone-500">
                                Enter your details to access your dashboard.
                            </p>
                        </div>

                        {errors.general && (
                            <div
                                role="alert"
                                className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600"
                            >
                                {errors.general}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate className="space-y-5">

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="login-email"
                                    className="mb-2 block text-sm font-semibold text-stone-700"
                                >
                                    Email address
                                </label>

                                <input
                                    id="login-email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    placeholder="you@example.com"
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={errors.email ? 'login-email-error' : undefined}
                                    className={inputClass('email')}
                                />

                                {errors.email && (
                                    <p
                                        id="login-email-error"
                                        role="alert"
                                        className="mt-2 flex items-center gap-1.5 text-sm text-rose-600"
                                    >
                                        <CircleX size={15} className="shrink-0" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="login-password"
                                    className="mb-2 block text-sm font-semibold text-stone-700"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter your password"
                                        aria-invalid={Boolean(errors.password)}
                                        aria-describedby={errors.password ? 'login-password-error' : undefined}
                                        className={`${inputClass('password')} pr-12`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((visible) => !visible)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        aria-pressed={showPassword}
                                        className="absolute inset-y-0 right-0 flex items-center px-4 text-stone-400 transition hover:text-emerald-800"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={19} />
                                        ) : (
                                            <Eye size={19} />
                                        )}
                                    </button>
                                </div>

                                {errors.password && (
                                    <p
                                        id="login-password-error"
                                        role="alert"
                                        className="mt-2 flex items-center gap-1.5 text-sm text-rose-600"
                                    >
                                        <CircleX size={15} className="shrink-0" />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                                {!loading && (
                                    <ArrowUpRight
                                        size={18}
                                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                    />
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Switch to Register */}
                    <p className="mt-7 text-center text-sm text-stone-500">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToRegister}
                            className="font-bold text-emerald-800 transition hover:text-emerald-950"
                        >
                            Create account
                        </button>
                    </p>

                    <p className="mt-8 text-center text-xs text-stone-400">
                        Thrive · Your money, managed mindfully.
                    </p>
                </div>
            </section>
        </div>
    )
}

export default Login
