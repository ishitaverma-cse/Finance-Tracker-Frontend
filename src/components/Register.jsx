import { useState } from 'react'
import { Eye, EyeOff, CircleX } from 'lucide-react'

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
        `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${errors[field]
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
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
        <div className="flex min-h-screen items-center justify-center bg-[#f8f7f2] px-4 py-10">
            <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-7 shadow-xl sm:p-10">
                <div className="mb-7 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-800 text-2xl font-bold text-white">
                        T
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-emerald-950">
                        Thrive
                    </h1>

                    <p className="mt-2 text-sm text-stone-500">
                        Build healthier financial habits.
                    </p>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-stone-900">
                        Create your account
                    </h2>
                    <p className="mt-1 text-sm text-stone-500">
                        Get started with your personal finance dashboard.
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

                {success && (
                    <p
                        role="status"
                        className="mb-5 text-sm text-emerald-700"
                    >
                        {success}
                    </p>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div>
                        <label
                            htmlFor="register-name"
                            className="mb-2 block text-sm font-medium text-stone-700"
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

                    <div>
                        <label
                            htmlFor="register-email"
                            className="mb-2 block text-sm font-medium text-stone-700"
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

                    <div>
                        <label
                            htmlFor="register-password"
                            className="mb-2 block text-sm font-medium text-stone-700"
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
                                className="absolute inset-y-0 right-0 flex items-center px-4 text-stone-500 transition hover:text-emerald-800"
                            >
                                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                            </button>
                        </div>
                        {renderError('password', 'register-password-error')}
                    </div>

                    <div>
                        <label
                            htmlFor="confirm-password"
                            className="mb-2 block text-sm font-medium text-stone-700"
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
                                className="absolute inset-y-0 right-0 flex items-center px-4 text-stone-500 transition hover:text-emerald-800"
                            >
                                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                            </button>
                        </div>
                        {renderError('confirmPassword', 'confirm-password-error')}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-emerald-800 px-4 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-stone-600">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="font-semibold text-emerald-800 hover:text-emerald-950"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    )
}

export default Register
