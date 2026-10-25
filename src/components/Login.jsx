import { useState } from 'react'
import { Eye, EyeOff, CircleX } from 'lucide-react'
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

        if (Object.keys(newErrors).length > 0) {
            return
        }

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

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f8f7f2] px-4 py-10">
            <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-7 shadow-xl sm:p-10">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-800 text-2xl font-bold text-white">
                        T
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-emerald-950">
                        Thrive
                    </h1>

                    <p className="mt-2 text-sm text-stone-500">
                        Take control of your financial future.
                    </p>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-stone-900">
                        Welcome back!
                    </h2>
                    <p className="mt-1 text-sm text-stone-500">
                        Sign in to access your financial dashboard.
                    </p>
                </div>

                {errors.general && (
                    <p
                        role="alert"
                        className="mb-5 text-sm text-rose-600"
                    >
                        {errors.general}
                    </p>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div>
                        <label
                            htmlFor="login-email"
                            className="mb-2 block text-sm font-medium text-stone-700"
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
                            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                                errors.email
                                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                                    : 'border-stone-200 focus:border-emerald-700 focus:ring-emerald-100'
                            }`}
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

                    <div>
                        <label
                            htmlFor="login-password"
                            className="mb-2 block text-sm font-medium text-stone-700"
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
                                className={`w-full rounded-xl border py-3 pl-4 pr-12 text-sm outline-none transition focus:ring-2 ${
                                    errors.password
                                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                                        : 'border-stone-200 focus:border-emerald-700 focus:ring-emerald-100'
                                }`}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((visible) => !visible)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                aria-pressed={showPassword}
                                className="absolute inset-y-0 right-0 flex items-center px-4 text-stone-500 transition hover:text-emerald-800"
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-emerald-800 px-4 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-stone-600">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="font-semibold text-emerald-800 hover:text-emerald-950"
                    >
                        Create account
                    </button>
                </p>
            </div>
        </div>
    )
}

export default Login
