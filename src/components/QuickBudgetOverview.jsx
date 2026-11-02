import { useEffect, useState } from 'react'
import {
    Wallet,
    CircleAlert,
    ChevronRight,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL

const formatMonth = (date) =>
    date.toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
    })

const QuickBudgetOverview = ({
    token,
    formatCurrency,
    onViewBudgets,
}) => {
    const [budgets, setBudgets] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    useEffect(() => {
        if (!token) {
            setBudgets([])
            setIsLoading(false)
            return
        }

        const controller = new AbortController()

        const fetchBudgets = async () => {
            setIsLoading(true)
            setError('')

            try {
                const response = await fetch(
                    `${API_URL}/budgets?month=${month}&year=${year}`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controller.signal,
                    }
                )

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(
                        data.message || 'Failed to load budgets.'
                    )
                }

                setBudgets(
                    Array.isArray(data.budgets)
                        ? data.budgets
                        : []
                )
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(
                        err.message || 'Unable to load your budgets.'
                    )
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false)
                }
            }
        }

        fetchBudgets()

        return () => controller.abort()
    }, [token, month, year])

    const totalBudget = budgets.reduce(
        (total, budget) =>
            total + (Number(budget.amount) || 0),
        0
    )

    const totalSpent = budgets.reduce(
        (total, budget) =>
            total + (Number(budget.spent) || 0),
        0
    )

    const totalRemaining = budgets.reduce(
        (total, budget) =>
            total + (Number(budget.remaining) || 0),
        0
    )

    const visibleBudgets = [...budgets]
        .sort(
            (a, b) =>
                (Number(b.percentageUsed) || 0) -
                (Number(a.percentageUsed) || 0)
        )
        .slice(0, 3)

    return (
        <section className="overflow-hidden rounded-3xl border border-[#E6E9DF] bg-white shadow-sm transition-all duration-300 hover:shadow-md">

            {/* Section Header */}
            <div className="flex flex-nowrap items-center justify-between gap-3 border-b border-[#EEF0E9] px-5 py-5 sm:px-6">

                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#527A5B] text-white shadow-md shadow-[#527A5B]/20">
                        <Wallet size={22} strokeWidth={2.2} />
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h2 className="text-lg font-bold text-emerald-950">
                                Quick Budget 
                            </h2>

                            <span className="rounded-lg bg-[#EAF2E8] px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-[#527A5B]">
                                {formatMonth(now).toUpperCase()}
                            </span>
                        </div>

                        <p className="mt-1 text-[13px] text-stone-500">
                            Keep an eye on your monthly category limits.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onViewBudgets}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-[#527A5B] transition hover:bg-[#F2F6F0]"
                >
                    View all
                    <ChevronRight size={17} strokeWidth={2.5} />
                </button>
            </div>

            {/* Section Content */}
            <div className="p-5 sm:p-7">

                {/* Loading */}
                {isLoading ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="animate-pulse rounded-2xl border border-stone-100 bg-[#F8F9F5] p-4"
                            >
                                <div className="h-3 w-24 rounded bg-stone-200" />
                                <div className="mt-3 h-6 w-32 rounded bg-stone-200" />
                            </div>
                        ))}
                    </div>
                ) : error ? (

                    /* Error */
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-5 text-center">
                        <CircleAlert
                            className="mx-auto text-red-500"
                            size={21}
                        />

                        <p className="mt-2 text-sm font-semibold text-red-600">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={onViewBudgets}
                            className="mt-3 text-xs font-bold text-[#527A5B] hover:underline"
                        >
                            Open Budgets
                        </button>
                    </div>
                ) : budgets.length === 0 ? (

                    /* Empty State */
                    <div className="rounded-2xl border border-dashed border-[#DDE4D8] bg-[#FAFBF8] px-5 py-8 text-center">

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF2E8] text-[#527A5B]">
                            <Wallet size={22} />
                        </div>

                        <h3 className="mt-3 text-sm font-bold text-[#354438]">
                            No budgets set for this month
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-stone-500">
                            Create category budgets to plan your spending
                            and track your progress.
                        </p>

                        <button
                            type="button"
                            onClick={onViewBudgets}
                            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#527A5B] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#42664A]"
                        >
                            Set Up Budgets
                            <ChevronRight size={14} />
                        </button>
                    </div>
                ) : (

                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                            <div className="rounded-2xl border border-stone-100 bg-[#F8F9F5] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#DCE8D9] hover:bg-[#EAF2E8] hover:shadow-sm">
                                <p className="text-xs font-semibold text-stone-500">
                                    Total Budget
                                </p>

                                <p className="mt-2 text-xl font-extrabold tracking-tight text-stone-800">
                                    {formatCurrency(totalBudget)}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-stone-100 bg-[#F8F9F5] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#DCE8D9] hover:bg-[#EAF2E8] hover:shadow-sm">
                                <p className="text-xs font-semibold text-stone-500">
                                    Total Spent
                                </p>

                                <p className="mt-2 text-xl font-extrabold tracking-tight text-stone-800">
                                    {formatCurrency(totalSpent)}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-stone-100 bg-[#F8F9F5] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#DCE8D9] hover:bg-[#EAF2E8] hover:shadow-sm">
                                <p className="text-xs font-semibold text-stone-500">
                                    Remaining
                                </p>

                                <p
                                    className={`mt-2 text-xl font-extrabold tracking-tight ${totalRemaining < 0
                                        ? 'text-red-600'
                                        : 'text-[#527A5B]'
                                        }`}
                                >
                                    {formatCurrency(totalRemaining)}
                                </p>
                            </div>
                        </div>

                        {/* Category Progress */}
                        <div className="mt-7">

                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h3 className="text-sm font-bold text-stone-700">
                                    Category Progress
                                </h3>

                                <span className="text-xs font-medium text-stone-400">
                                    {budgets.length}{' '}
                                    {budgets.length === 1
                                        ? 'category'
                                        : 'categories'}
                                </span>
                            </div>

                            <div className="space-y-4">

                                {visibleBudgets.map((budget) => {
                                    const percentage =
                                        Number(budget.percentageUsed) || 0

                                    const spent =
                                        Number(budget.spent) || 0

                                    const limit =
                                        Number(budget.amount) || 0

                                    const exceeded =
                                        Boolean(budget.isExceeded) ||
                                        spent > limit

                                    const barWidth = Math.min(
                                        Math.max(percentage, 0),
                                        100
                                    )

                                    return (
                                        <div
                                            key={
                                                budget._id ||
                                                budget.id ||
                                                budget.category
                                            }
                                        >
                                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">

                                                <span className="text-sm font-semibold text-stone-700">
                                                    {budget.category}
                                                </span>

                                                <span className="text-xs font-semibold tabular-nums text-stone-500">
                                                    {formatCurrency(spent)}

                                                    <span className="text-stone-400">
                                                        {' '}/{' '}
                                                        {formatCurrency(limit)}
                                                    </span>

                                                    <span
                                                        className={`ml-2 font-bold ${exceeded
                                                            ? 'text-red-600'
                                                            : 'text-[#527A5B]'
                                                            }`}
                                                    >
                                                        {percentage.toFixed(0)}%
                                                    </span>
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="h-2.5 overflow-hidden rounded-full bg-stone-100">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${exceeded
                                                        ? 'bg-red-500'
                                                        : percentage >= 80
                                                            ? 'bg-amber-400'
                                                            : 'bg-[#6D9A70]'
                                                        }`}
                                                    style={{
                                                        width: `${barWidth}%`,
                                                    }}
                                                />
                                            </div>

                                            <p
                                                className={`mt-1.5 text-[11px] font-medium ${exceeded
                                                    ? 'text-red-500'
                                                    : 'text-stone-400'
                                                    }`}
                                            >
                                                {exceeded
                                                    ? `${formatCurrency(
                                                        Math.max(
                                                            spent - limit,
                                                            0
                                                        )
                                                    )} over budget`
                                                    : `${formatCurrency(
                                                        Math.max(
                                                            Number(
                                                                budget.remaining
                                                            ) || 0,
                                                            0
                                                        )
                                                    )} left`}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>

                            
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}

export default QuickBudgetOverview