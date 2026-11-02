import { useState } from 'react'
import {
    Eye,
    EyeOff,
    CircleX,
    Wallet,
    TrendingUp,
    Sparkles,
    ArrowUpRight,
    ShieldCheck,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL

function Register({ onSwitchToLogin }) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')

    const handleFieldChange = (field, value) => {
        const setters = {
            name: setName,
            email: setEmail,
            password: setPassword,
            confirmPassword: setConfirmPassword,
        }

        setters[field](value)

        setErrors((previous) => {
            const next = { ...previous, [field]: '', general: '' }

            if (field === 'password' || field === 'confirmPassword') {
                next.password = ''
                next.confirmPassword = ''
            }

            if (field === 'email') {
                next.password = ''
            }

            return next
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        const trimmedName = name.trim()
        const normalizedEmail = email.trim()
        const newErrors = {}

        if (!trimmedName) {
            newErrors.name = 'Please enter your full name.'
        } else if (trimmedName.length < 2 || trimmedName.length > 50) {
            newErrors.name = 'Name must contain 2–50 characters.'
        }

        if (!normalizedEmail) {
            newErrors.email = 'Please enter your email address.'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            newErrors.email = 'Please enter a valid email address.'
        }

        if (!password) {
            newErrors.password = 'Please enter a password.'
        } else if (password.length < 8) {
            newErrors.password = 'Password must contain at least 8 characters.'
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password.'
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.'
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
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: trimmedName,
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
                if (response.status === 409) {
                    setErrors({
                        email: data.message || 'An account with this email already exists.',
                    })
                    return
                }

                if (response.status === 400) {
                    setErrors({
                        general: data.message || 'Please check your information and try again.',
                    })
                    return
                }

                throw new Error(data.message || 'Registration failed. Please try again.')
            }

            setSuccess('Account created successfully! Please sign in.')
            setErrors({})

            setTimeout(() => {
                onSwitchToLogin()
            }, 1500)

            return
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

    const renderError = (field, id) =>
        errors[field] ? (
            <p
                id={id}
                role="alert"
                className="mt-2 flex items-center gap-1.5 text-sm text-rose-600"
            >
                <CircleX size={15} className="shrink-0" />
                {errors[field]}
            </p>
        ) : null

    return (
        <div className="min-h-screen bg-[#F8F7F2] lg:grid lg:grid-cols-[0.95fr_1.05fr]">

            {/* Left Branding Panel */}
            <section className="relative hidden min-h-screen overflow-hidden bg-[#123D2B] px-10 py-10 text-white lg:flex lg:flex-col xl:px-14">

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
                <div className="relative z-10 my-auto max-w-xl py-16">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
                        <Sparkles size={14} />
                        Start your journey
                    </div>

                    <h2 className="text-5xl font-extrabold leading-[1.15] tracking-tight xl:text-6xl">
                        Your goals
                        <span className="mt-2 block text-[#9DD8A9]">
                            deserve a plan.
                        </span>
                    </h2>

                    <p className="mt-6 max-w-md text-base leading-7 text-emerald-100/75">
                        Take the first step toward smarter spending, mindful saving,
                        and a future that feels more financially confident.
                    </p>

                    {/* Decorative Card */}
                    <div className="mt-12 max-w-md rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-emerald-100/65">
                                    A better money mindset
                                </p>
                                <h3 className="mt-2 text-xl font-bold">
                                    Progress over perfection.
                                </h3>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/15 text-[#9DD8A9]">
                                <TrendingUp size={24} />
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300/15 text-[#9DD8A9]">
                                    <Wallet size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">
                                        Track your money
                                    </p>
                                    <p className="text-xs text-emerald-100/60">
                                        Know where it goes.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300/15 text-[#9DD8A9]">
                                    <TrendingUp size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">
                                        Grow your savings
                                    </p>
                                    <p className="text-xs text-emerald-100/60">
                                        Make every step count.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Right Authentication Panel */}
            <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-10">

                <div className="w-full max-w-md">

                    {/* Mobile Brand */}
                    <div className="mb-8 flex items-center gap-3 lg:hidden">
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
                    <div className="mb-7">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E8F3EA] px-3 py-1.5 text-xs font-bold text-emerald-800">
                            <Sparkles size={14} />
                            BUILD YOUR FINANCIAL FUTURE
                        </div>

                        <h2 className="text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">
                            Create your account
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-stone-500">
                            Get started with your personal finance dashboard.
                        </p>
                    </div>

                    {/* Register Card */}
                    <div className="rounded-[2rem] border border-stone-200/80 bg-white p-6 shadow-[0_12px_45px_rgba(31,55,38,0.07)] sm:p-8">

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-stone-900">
                                Join Thrive
                            </h3>
                            <p className="mt-1.5 text-sm text-stone-500">
                                A few details to get you started.
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

                        {success && (
                            <div
                                role="status"
                                className="mb-5 flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
                            >
                                <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate className="space-y-4">

                            {/* Full Name */}
                            <div>
                                <label
                                    htmlFor="register-name"
                                    className="mb-2 block text-sm font-semibold text-stone-700"
                                >
                                    Full name
                                </label>

                                <input
                                    id="register-name"
                                    type="text"
                                    autoComplete="name"
                                    value={name}
                                    onChange={(event) => handleFieldChange('name', event.target.value)}
                                    placeholder="Your full name"
                                    maxLength={50}
                                    aria-invalid={Boolean(errors.name)}
                                    aria-describedby={errors.name ? 'register-name-error' : undefined}
                                    className={inputClass('name')}
                                />

                                {renderError('name', 'register-name-error')}
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="register-email"
                                    className="mb-2 block text-sm font-semibold text-stone-700"
                                >
                                    Email address
                                </label>

                                <input
                                    id="register-email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) => handleFieldChange('email', event.target.value)}
                                    placeholder="you@example.com"
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={errors.email ? 'register-email-error' : undefined}
                                    className={inputClass('email')}
                                />

                                {renderError('email', 'register-email-error')}
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="register-password"
                                    className="mb-2 block text-sm font-semibold text-stone-700"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        id="register-password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(event) => handleFieldChange('password', event.target.value)}
                                        placeholder="At least 8 characters"
                                        aria-invalid={Boolean(errors.password)}
                                        aria-describedby={errors.password ? 'register-password-error' : undefined}
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

                                {renderError('password', 'register-password-error')}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor="confirm-password"
                                    className="mb-2 block text-sm font-semibold text-stone-700"
                                >
                                    Confirm password
                                </label>

                                <div className="relative">
                                    <input
                                        id="confirm-password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        value={confirmPassword}
                                        onChange={(event) => handleFieldChange('confirmPassword', event.target.value)}
                                        placeholder="Re-enter your password"
                                        aria-invalid={Boolean(errors.confirmPassword)}
                                        aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                                        className={`${inputClass('confirmPassword')} pr-12`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((visible) => !visible)}
                                        aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                                        aria-pressed={showConfirmPassword}
                                        className="absolute inset-y-0 right-0 flex items-center px-4 text-stone-400 transition hover:text-emerald-800"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={19} />
                                        ) : (
                                            <Eye size={19} />
                                        )}
                                    </button>
                                </div>

                                {renderError('confirmPassword', 'confirm-password-error')}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || Boolean(success)}
                                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? 'Creating account...'
                                    : success
                                        ? 'Account created!'
                                        : 'Create Account'}

                                {!loading && !success && (
                                    <ArrowUpRight
                                        size={18}
                                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                    />
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Switch to Login */}
                    <p className="mt-7 text-center text-sm text-stone-500">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="font-bold text-emerald-800 transition hover:text-emerald-950"
                        >
                            Sign in
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

export default Register
